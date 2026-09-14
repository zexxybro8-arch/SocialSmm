import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Load Firebase configuration
let firebaseConfig: any = {};
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
} catch (e) {
  console.error('Error reading firebase-applet-config.json:', e);
}

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId || 'gen-lang-client-0062305766',
  });
}

const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(getApp(), firebaseConfig.firestoreDatabaseId)
  : getFirestore();

async function authenticateFirebaseToken(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Please log in to place an order.' });
    return;
  }

  const idToken = authHeader.split('Bearer ')[1]?.trim();
  if (!idToken) {
    res.status(401).json({ success: false, error: 'Please log in to place an order.' });
    return;
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    (req as any).user = decodedToken;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ success: false, error: 'Please log in to place an order.' });
    return;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Secure Server-side Order Creation Endpoint
  app.post('/api/orders/create', authenticateFirebaseToken, async (req: express.Request, res: express.Response) => {
    const user = (req as any).user;
    const uid = user.uid;
    const userEmail = user.email || '';

    const {
      serviceId,
      quantity,
      link,
      targetUrl,
      targetAccount,
      customerNotes,
      requirements,
      idempotencyKey,
    } = req.body || {};

    const targetLink = (targetUrl || targetAccount || link || '').toString().trim();

    // 1. Basic input checks
    if (!serviceId) {
      res.status(400).json({ success: false, error: 'Please select a valid service.' });
      return;
    }

    if (!targetLink || targetLink.length < 2) {
      res.status(400).json({ success: false, error: 'Please enter a valid Instagram link.' });
      return;
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      res.status(400).json({ success: false, error: 'Please enter a valid order quantity.' });
      return;
    }

    // 2. Check Idempotency Key if provided
    if (idempotencyKey) {
      try {
        const existingQuery = await db
          .collection('orders')
          .where('userId', '==', uid)
          .where('idempotencyKey', '==', idempotencyKey)
          .limit(1)
          .get();

        if (!existingQuery.empty) {
          const existingOrder = existingQuery.docs[0].data();
          res.json({ success: true, order: existingOrder, duplicated: true });
          return;
        }
      } catch (err) {
        console.warn('Idempotency check query error:', err);
      }
    }

    try {
      // 3. Execute Atomic Transaction for Wallet Deduction & Order Creation
      const transactionResult = await db.runTransaction(async (transaction) => {
        // A. Load User Document
        const userRef = db.collection('users').doc(uid);
        const userSnap = await transaction.get(userRef);

        let userData: any = {};
        if (userSnap.exists) {
          userData = userSnap.data() || {};
        } else {
          // Fallback to customers collection if exists
          const customerSnap = await transaction.get(db.collection('customers').doc(uid));
          if (customerSnap.exists) {
            userData = customerSnap.data() || {};
          }
        }

        const walletBalance = Number(userData.walletBalance ?? userData.balance ?? 0);
        const spent = Number(userData.spent ?? 0);

        // B. Load Service Document
        const serviceRef = db.collection('services').doc(serviceId);
        let serviceSnap = await transaction.get(serviceRef);
        let serviceData: any = null;

        if (serviceSnap.exists) {
          serviceData = serviceSnap.data();
        } else {
          // Query by custom serviceId field if doc ID differs
          const serviceQuery = await db.collection('services').where('serviceId', '==', serviceId).limit(1).get();
          if (!serviceQuery.empty) {
            serviceData = serviceQuery.docs[0].data();
          } else {
            const serviceQueryStr = await db.collection('services').where('id', '==', serviceId).limit(1).get();
            if (!serviceQueryStr.empty) {
              serviceData = serviceQueryStr.docs[0].data();
            }
          }
        }

        if (!serviceData) {
          throw new Error('This service is currently unavailable.');
        }

        if (serviceData.status && serviceData.status !== 'active') {
          throw new Error('This service is currently unavailable.');
        }

        // C. Validate Quantity Limits
        const minQty = Number(serviceData.minQuantity) || 1;
        const maxQty = Number(serviceData.maxQuantity) || 1000000;

        if (qty < minQty || qty > maxQty) {
          throw new Error(`Quantity must be between ${minQty.toLocaleString()} and ${maxQty.toLocaleString()}.`);
        }

        // D. Calculate Price SERVER-SIDE
        const ratePer1k = Number(serviceData.ratePer1k || serviceData.price || 0.45);
        const isPer1k =
          serviceData.unitLabel?.toLowerCase().includes('1,000') ||
          serviceData.unitLabel?.toLowerCase().includes('1k') ||
          minQty >= 10;

        const rawPrice = isPer1k ? (ratePer1k * qty) / 1000 : ratePer1k * qty;
        const discountPercent = Number(userData.customDiscountPercent || 0);
        let discountAmount = 0;
        if (discountPercent > 0) {
          discountAmount = (rawPrice * discountPercent) / 100;
        }

        const finalPrice = Math.max(0.01, Math.round((rawPrice - discountAmount) * 100) / 100);

        // E. Verify Balance
        if (walletBalance < finalPrice) {
          const missing = (finalPrice - walletBalance).toFixed(2);
          throw new Error(`Insufficient balance. Please add ₹${missing} to your wallet.`);
        }

        // F. Prepare Identifiers & Writes
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const orderNum = Math.floor(100000 + Math.random() * 900000);
        const orderId = `ORD-${dateStr}-${orderNum}`;
        const txnId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const now = new Date().toISOString();

        const newWalletBalance = Math.round((walletBalance - finalPrice) * 100) / 100;
        const newSpent = Math.round((spent + finalPrice) * 100) / 100;

        const newOrder: any = {
          id: orderId,
          userId: uid,
          customerId: uid,
          username: userData.username || (userEmail ? userEmail.split('@')[0] : 'Customer'),
          customerName: userData.fullName || userData.name || userData.username || (userEmail ? userEmail.split('@')[0] : 'Customer'),
          customerEmail: userEmail || userData.email || '',
          serviceId: serviceData.id || serviceId,
          serviceName: serviceData.name || 'Instagram Service',
          serviceCategory: serviceData.categoryName || serviceData.category || 'Instagram',
          link: targetLink,
          targetUrl: targetLink,
          targetAccount: targetLink,
          quantity: qty,
          price: finalPrice,
          totalPrice: finalPrice,
          amount: finalPrice,
          finalAmount: finalPrice,
          currency: 'INR',
          discountApplied: Math.round(discountAmount * 100) / 100,
          customerNotes: customerNotes || '',
          requirements: requirements || {},
          status: 'pending',
          creationType: 'customer',
          createdBy: uid,
          idempotencyKey: idempotencyKey || '',
          timeline: [
            {
              id: `tl_${Date.now()}`,
              status: 'pending',
              title: 'Order Received',
              description: 'Order placed and payment deducted from account wallet.',
              timestamp: now,
              updatedBy: 'system',
            },
          ],
          createdAt: now,
          updatedAt: now,
        };

        const walletTxn: any = {
          id: txnId,
          userId: uid,
          customerId: uid,
          type: 'order',
          amount: -finalPrice,
          description: `Order #${orderId} - ${serviceData.name} (Qty: ${qty})`,
          orderId: orderId,
          serviceId: serviceData.id || serviceId,
          status: 'completed',
          paymentMethod: 'wallet',
          createdAt: now,
          updatedAt: now,
        };

        // G. Perform Atomic Writes
        if (userSnap.exists) {
          transaction.update(userRef, {
            walletBalance: newWalletBalance,
            spent: newSpent,
            updatedAt: now,
          });
        } else {
          transaction.set(userRef, {
            uid: uid,
            email: userEmail,
            walletBalance: newWalletBalance,
            spent: newSpent,
            updatedAt: now,
          }, { merge: true });
        }

        const orderRef = db.collection('orders').doc(orderId);
        transaction.set(orderRef, newOrder);

        const txnRef = db.collection('transactions').doc(txnId);
        transaction.set(txnRef, walletTxn);

        const walletTxnRef = db.collection('wallet_transactions').doc(txnId);
        transaction.set(walletTxnRef, walletTxn);

        return { order: newOrder, newWalletBalance, serviceData };
      });

      let finalOrder = transactionResult.order;

      // 4. External Provider API Dispatch (if credentials exist)
      const providerApiKey = process.env.SMM_PROVIDER_API_KEY;
      const providerApiUrl = process.env.SMM_PROVIDER_URL;

      if (providerApiKey && providerApiUrl) {
        try {
          const providerRes = await fetch(providerApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              key: providerApiKey,
              action: 'add',
              service: transactionResult.serviceData.providerServiceId || serviceId,
              link: targetLink,
              quantity: qty,
            }),
          });

          const providerData = await providerRes.json();
          if (providerData && providerData.order) {
            const providerOrderId = String(providerData.order);
            finalOrder.status = 'processing';
            finalOrder.providerOrderId = providerOrderId;

            await db.collection('orders').doc(finalOrder.id).update({
              status: 'processing',
              providerOrderId,
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (providerError) {
          console.error('SMM Provider submission error:', providerError);
        }
      }

      res.json({ success: true, order: finalOrder, newWalletBalance: transactionResult.newWalletBalance });
    } catch (err: any) {
      console.error('Order Creation API Error:', err);
      res.status(400).json({
        success: false,
        error: err.message || 'Unable to place order. Please try again.',
      });
    }
  });

  // Customer Get Own Orders Endpoint
  app.get('/api/orders', authenticateFirebaseToken, async (req: express.Request, res: express.Response) => {
    try {
      const uid = (req as any).user.uid;
      const snapshot = await db.collection('orders')
        .where('userId', '==', uid)
        .get();

      let ordersList = snapshot.docs.map(doc => doc.data());
      
      // Fallback query by customerId if needed
      if (ordersList.length === 0) {
        const snap2 = await db.collection('orders')
          .where('customerId', '==', uid)
          .get();
        ordersList = snap2.docs.map(doc => doc.data());
      }

      ordersList.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json({ success: true, orders: ordersList });
    } catch (err: any) {
      console.error('Get Customer Orders API Error:', err);
      res.status(500).json({ success: false, error: 'Failed to retrieve orders.' });
    }
  });

  // =========================================================
  // ADMIN MIDDLEWARE & ENDPOINTS
  // =========================================================
  async function authenticateAdminToken(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Unauthorized. Admin login required.' });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1]?.trim();
    if (!idToken) {
      res.status(401).json({ success: false, error: 'Unauthorized. Admin login required.' });
      return;
    }

    try {
      const decodedToken = await getAuth().verifyIdToken(idToken);
      const uid = decodedToken.uid;

      const userSnap = await db.collection('users').doc(uid).get();
      const userData = userSnap.exists ? userSnap.data() : null;

      if (!userData || userData.role !== 'admin') {
        res.status(403).json({ success: false, error: 'Forbidden. Admin privileges required.' });
        return;
      }

      (req as any).user = decodedToken;
      (req as any).adminUser = userData;
      next();
    } catch (err) {
      console.error('Admin token verification error:', err);
      res.status(401).json({ success: false, error: 'Unauthorized. Token invalid or expired.' });
      return;
    }
  }

  // Admin Get All Orders
  app.get('/api/admin/orders', authenticateAdminToken, async (_req: express.Request, res: express.Response) => {
    try {
      const snapshot = await db.collection('orders').get();
      const ordersList = snapshot.docs.map(doc => doc.data());
      ordersList.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json({ success: true, orders: ordersList });
    } catch (err: any) {
      console.error('Admin Get Orders Error:', err);
      res.status(500).json({ success: false, error: 'Failed to retrieve admin orders.' });
    }
  });

  // Admin Update Order Status & Refund Action
  app.post('/api/admin/orders/update-status', authenticateAdminToken, async (req: express.Request, res: express.Response) => {
    try {
      const adminUser = (req as any).adminUser;
      const adminUid = (req as any).user.uid;
      const { orderId, status, notes, providerOrderId, refundCustomer } = req.body || {};

      if (!orderId) {
        res.status(400).json({ success: false, error: 'Order ID is required.' });
        return;
      }

      const orderRef = db.collection('orders').doc(orderId);
      const orderSnap = await orderRef.get();

      if (!orderSnap.exists) {
        res.status(404).json({ success: false, error: 'Order not found.' });
        return;
      }

      const orderData = orderSnap.data() || {};
      const targetUid = orderData.userId || orderData.customerId;
      const orderPrice = Number(orderData.finalAmount ?? orderData.totalPrice ?? orderData.price ?? 0);
      const now = new Date().toISOString();

      let isRefunding = (status === 'refunded' || (status === 'cancelled' && refundCustomer)) && orderData.status !== 'refunded';

      if (isRefunding && targetUid && orderPrice > 0) {
        // Atomic Refund Transaction
        await db.runTransaction(async (transaction) => {
          const userRef = db.collection('users').doc(targetUid);
          const userSnap = await transaction.get(userRef);

          let currentWallet = 0;
          let currentSpent = 0;
          if (userSnap.exists) {
            const uData = userSnap.data() || {};
            currentWallet = Number(uData.walletBalance ?? 0);
            currentSpent = Number(uData.spent ?? 0);
          }

          const newWallet = Math.round((currentWallet + orderPrice) * 100) / 100;
          const newSpent = Math.max(0, Math.round((currentSpent - orderPrice) * 100) / 100);

          if (userSnap.exists) {
            transaction.update(userRef, { walletBalance: newWallet, spent: newSpent, updatedAt: now });
          }

          const txnId = `TXN-REFUND-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const refundTxn = {
            id: txnId,
            userId: targetUid,
            customerId: targetUid,
            type: 'refund',
            amount: orderPrice,
            description: `Refund for Order #${orderId}`,
            orderId: orderId,
            status: 'completed',
            createdAt: now,
            updatedAt: now,
          };

          transaction.set(db.collection('transactions').doc(txnId), refundTxn);
          transaction.set(db.collection('wallet_transactions').doc(txnId), refundTxn);
        });
      }

      // Update Order document
      const currentTimeline = orderData.timeline || [];
      const updatedTimeline = [
        ...currentTimeline,
        {
          id: `tl_${Date.now()}`,
          status: status || orderData.status,
          title: `Status set to ${(status || orderData.status).toUpperCase()}`,
          description: notes || `Order status updated by admin (${adminUser.fullName || adminUser.username || adminUid})`,
          timestamp: now,
          updatedBy: adminUser.fullName || adminUser.username || 'admin',
        },
      ];

      const updates: any = {
        status: status || orderData.status,
        updatedAt: now,
        timeline: updatedTimeline,
      };

      if (notes !== undefined) updates.notes = notes;
      if (providerOrderId !== undefined) updates.providerOrderId = providerOrderId;

      await orderRef.update(updates);

      const updatedSnap = await orderRef.get();
      res.json({ success: true, order: updatedSnap.data() });
    } catch (err: any) {
      console.error('Admin Update Order Status Error:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to update order status.' });
    }
  });

  // Admin Manual Order Creation
  app.post('/api/admin/orders/create-manual', authenticateAdminToken, async (req: express.Request, res: express.Response) => {
    try {
      const adminUid = (req as any).user.uid;
      const adminUser = (req as any).adminUser;

      const {
        targetUserId,
        serviceId,
        quantity,
        link,
        chargeCustomer,
        providerMode,
        providerOrderId,
        status,
        notes,
      } = req.body || {};

      if (!targetUserId) {
        res.status(400).json({ success: false, error: 'Please select a customer.' });
        return;
      }

      if (!serviceId) {
        res.status(400).json({ success: false, error: 'Please select a service.' });
        return;
      }

      const qty = Number(quantity);
      if (isNaN(qty) || qty <= 0) {
        res.status(400).json({ success: false, error: 'Please enter a valid quantity.' });
        return;
      }

      const targetLink = (link || '').trim();
      if (!targetLink) {
        res.status(400).json({ success: false, error: 'Please enter a valid Instagram link.' });
        return;
      }

      // Load Service
      const serviceSnap = await db.collection('services').doc(serviceId).get();
      let serviceData: any = serviceSnap.exists ? serviceSnap.data() : null;
      if (!serviceData) {
        const querySnap = await db.collection('services').where('serviceId', '==', serviceId).limit(1).get();
        if (!querySnap.empty) serviceData = querySnap.docs[0].data();
      }

      if (!serviceData) {
        res.status(400).json({ success: false, error: 'Service not found.' });
        return;
      }

      // Load Customer
      const userSnap = await db.collection('users').doc(targetUserId).get();
      const userData = userSnap.exists ? userSnap.data() : {};

      const ratePer1k = Number(serviceData.ratePer1k || serviceData.price || 0.45);
      const isPer1k = (Number(serviceData.minQuantity) || 1) >= 10 || serviceData.unitLabel?.includes('1k');
      const calculatedPrice = isPer1k ? Math.round(((ratePer1k * qty) / 1000) * 100) / 100 : Math.round(ratePer1k * qty * 100) / 100;
      const finalPrice = Math.max(0.01, calculatedPrice);

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const orderNum = Math.floor(100000 + Math.random() * 900000);
      const orderId = `ORD-${dateStr}-${orderNum}`;
      const now = new Date().toISOString();

      let shouldCharge = Boolean(chargeCustomer);

      if (shouldCharge) {
        // Atomic charge
        await db.runTransaction(async (transaction) => {
          const userRef = db.collection('users').doc(targetUserId);
          const uSnap = await transaction.get(userRef);
          let currentWallet = 0;
          let currentSpent = 0;
          if (uSnap.exists) {
            const uData = uSnap.data() || {};
            currentWallet = Number(uData.walletBalance ?? 0);
            currentSpent = Number(uData.spent ?? 0);
          }

          if (currentWallet < finalPrice) {
            throw new Error(`Customer wallet balance (₹${currentWallet}) is less than required ₹${finalPrice}.`);
          }

          const newWallet = Math.round((currentWallet - finalPrice) * 100) / 100;
          const newSpent = Math.round((currentSpent + finalPrice) * 100) / 100;

          transaction.update(userRef, { walletBalance: newWallet, spent: newSpent, updatedAt: now });

          const txnId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const walletTxn = {
            id: txnId,
            userId: targetUserId,
            customerId: targetUserId,
            type: 'order',
            amount: -finalPrice,
            description: `Manual Order #${orderId} - ${serviceData.name} (Qty: ${qty})`,
            orderId: orderId,
            status: 'completed',
            createdAt: now,
          };

          transaction.set(db.collection('transactions').doc(txnId), walletTxn);
          transaction.set(db.collection('wallet_transactions').doc(txnId), walletTxn);
        });
      }

      const manualOrder: any = {
        id: orderId,
        userId: targetUserId,
        customerId: targetUserId,
        username: userData.username || userData.email?.split('@')[0] || 'Customer',
        customerName: userData.fullName || userData.name || userData.username || 'Customer',
        customerEmail: userData.email || '',
        serviceId: serviceData.id || serviceId,
        serviceName: serviceData.name || 'Instagram Service',
        serviceCategory: serviceData.categoryName || serviceData.category || 'Instagram',
        link: targetLink,
        targetUrl: targetLink,
        targetAccount: targetLink,
        quantity: qty,
        price: finalPrice,
        totalPrice: finalPrice,
        amount: finalPrice,
        finalAmount: finalPrice,
        currency: 'INR',
        discountApplied: 0,
        status: status || 'processing',
        creationType: 'manual',
        createdBy: adminUid,
        provider: providerMode === 'automatic' ? 'smm_provider' : 'manual',
        providerOrderId: providerOrderId || '',
        notes: notes || `Created manually by admin (${adminUser.fullName || adminUid})`,
        requirements: {},
        timeline: [
          {
            id: `tl_${Date.now()}`,
            status: status || 'processing',
            title: 'Manual Order Created',
            description: `Order created by Admin. Charge customer: ${shouldCharge ? 'Yes' : 'No'}.`,
            timestamp: now,
            updatedBy: adminUser.fullName || 'admin',
          },
        ],
        createdAt: now,
        updatedAt: now,
      };

      await db.collection('orders').doc(orderId).set(manualOrder);

      res.json({ success: true, order: manualOrder });
    } catch (err: any) {
      console.error('Admin Manual Order Error:', err);
      res.status(400).json({ success: false, error: err.message || 'Failed to create manual order.' });
    }
  });

  // Admin Search / List Customers
  app.get('/api/admin/customers/search', authenticateAdminToken, async (_req: express.Request, res: express.Response) => {
    try {
      const snapshot = await db.collection('users').get();
      const customersList = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: doc.id,
            username: data.username || data.email?.split('@')[0] || 'User',
            fullName: data.fullName || data.name || data.username || 'Customer',
            email: data.email || '',
            role: data.role || 'customer',
            walletBalance: Number(data.walletBalance ?? data.balance ?? 0),
          };
        })
        .filter(u => u.role !== 'admin');

      res.json({ success: true, customers: customersList });
    } catch (err: any) {
      console.error('Admin Customer Search Error:', err);
      res.status(500).json({ success: false, error: 'Failed to search customers.' });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
