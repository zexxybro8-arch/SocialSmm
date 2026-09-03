import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { SupportTicket, TicketMessage } from '../types/database';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge, Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';
import { useAuth } from '../auth/AuthContext';
import { 
  LifeBuoy, 
  Plus, 
  MessageSquare, 
  Send, 
  Clock, 
  CheckCircle2, 
  User, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const SupportTicketsView: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState<boolean>(false);
  const [subject, setSubject] = useState<string>('');
  const [category, setCategory] = useState<string>('order_issue');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [initialMessage, setInitialMessage] = useState<string>('');
  const [replyText, setReplyText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  const fetchTickets = async () => {
    try {
      const data = await api.getTickets();
      setTickets(data);
      if (selectedTicket) {
        const updated = data.find((t) => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !initialMessage) {
      toast('error', 'Please fill in all fields');
      return;
    }
    setIsSending(true);
    try {
      const res = await api.createTicket({
        subject,
        category,
        priority,
        message: initialMessage,
      });
      toast('success', `Ticket ${res.ticket.id} opened`);
      setIsNewTicketModalOpen(false);
      setSubject('');
      setInitialMessage('');
      await fetchTickets();
      setSelectedTicket(res.ticket);
    } catch (err: any) {
      toast('error', err.message || 'Failed to create ticket');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    setIsSending(true);
    try {
      const updated = await api.addTicketReply(selectedTicket.id, replyText);
      setSelectedTicket(updated);
      setReplyText('');
      await fetchTickets();
      toast('success', 'Reply sent');
    } catch (err: any) {
      toast('error', err.message || 'Failed to send reply');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Support & Account Assistance</h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Direct communication with our social media management specialists and account managers.
          </p>
        </div>
        <button
          onClick={() => setIsNewTicketModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs md:text-sm font-semibold flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Open New Ticket</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Your Inquiries ({tickets.length})
          </h3>
          {tickets.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
              No active tickets. Click "Open New Ticket" if you need help with any order or campaign.
            </div>
          ) : (
            tickets.map((ticket) => {
              const isSelected = selectedTicket?.id === ticket.id;
              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/30 border-indigo-500 shadow-md shadow-indigo-950/40'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-semibold text-zinc-400">{ticket.id}</span>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <h4 className="text-sm font-semibold text-white truncate">{ticket.subject}</h4>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2">
                    <span className="capitalize">{ticket.category.replace('_', ' ')}</span>
                    <span>{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Conversation Thread */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <GlassCard className="p-5 flex flex-col h-[580px] justify-between">
              {/* Ticket Top Info */}
              <div className="pb-3.5 border-b border-zinc-800 flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">{selectedTicket.subject}</h3>
                    <StatusBadge status={selectedTicket.status} />
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-zinc-400 mt-1">
                    <span>Category: <strong className="text-zinc-200 capitalize">{selectedTicket.category.replace('_', ' ')}</strong></span>
                    <span>•</span>
                    <span>Priority: <strong className="text-zinc-200 uppercase">{selectedTicket.priority}</strong></span>
                  </div>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-2 custom-scrollbar">
                {(selectedTicket.messages || []).map((msg) => {
                  const isStaff = msg.senderRole === 'admin';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isStaff ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center space-x-1.5 text-[11px] text-zinc-400 mb-1 px-1">
                        {isStaff ? (
                          <ShieldCheck className="w-3 h-3 text-amber-400" />
                        ) : (
                          <User className="w-3 h-3 text-indigo-400" />
                        )}
                        <span className="font-semibold text-zinc-300">{msg.senderName}</span>
                        <span>•</span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                          isStaff
                            ? 'bg-zinc-800 text-zinc-200 rounded-tl-sm border border-zinc-700/80'
                            : 'bg-indigo-600 text-white rounded-tr-sm shadow-md shadow-indigo-600/20'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-zinc-800 flex items-center space-x-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response to support..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isSending || !replyText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </GlassCard>
          ) : (
            <div className="h-[580px] rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 flex flex-col items-center justify-center p-6 text-center text-xs text-zinc-500">
              <MessageSquare className="w-8 h-8 mb-2 text-zinc-600" />
              <p>Select an active ticket from the left panel to inspect messages and write responses.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      <Modal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        title="Open Support Ticket"
        maxWidth="md"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Subject *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Question about Reel delivery timeline"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="order_issue">Order Fulfillment</option>
                <option value="service_inquiry">Service Inquiry</option>
                <option value="billing">Billing & Ledger</option>
                <option value="technical">Meta API Integration</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Message Description *
            </label>
            <textarea
              required
              rows={4}
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              placeholder="Please provide specifics regarding your campaign, target account handle, or invoice ID..."
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsNewTicketModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
            >
              {isSending ? 'Creating...' : 'Submit Inquiry'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
