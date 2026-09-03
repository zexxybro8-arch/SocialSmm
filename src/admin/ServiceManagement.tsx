import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Service, ServiceCategory, PlatformCategory } from '../types/database';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';
import { 
  Layers, 
  Plus, 
  Search, 
  Edit, 
  Check, 
  Clock, 
  ToggleLeft, 
  ToggleRight,
  Sparkles
} from 'lucide-react';

export const ServiceManagement: React.FC = () => {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<PlatformCategory[]>([]);
  const [search, setSearch] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form State
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('instagram');
  const [price, setPrice] = useState<number>(99);
  const [deliveryTime, setDeliveryTime] = useState<string>('24 - 48 Hours');
  const [shortDescription, setShortDescription] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [deliverablesText, setDeliverablesText] = useState<string>('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      const [servicesData, categoriesData] = await Promise.all([
        api.getServices(),
        api.getCategories()
      ]);
      setServices(servicesData);
      setCategories(categoriesData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingService(null);
    setName('');
    setCategory(categories[0]?.id || 'instagram');
    setPrice(149);
    setDeliveryTime('24 - 48 Hours');
    setShortDescription('');
    setDescription('');
    setDeliverablesText('Custom editorial calendar\n3 High-converting carousels\nCaption copy & hashtag strategy');
    setStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (srv: Service) => {
    setEditingService(srv);
    setName(srv.name);
    setCategory(srv.category);
    setPrice(srv.price);
    setDeliveryTime(srv.deliveryTime);
    setShortDescription(srv.shortDescription);
    setDescription(srv.description);
    setDeliverablesText((srv.deliverables || []).join('\n'));
    setStatus(srv.status);
    setIsModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const deliverables = deliverablesText
        .split('\n')
        .map((d) => d.trim())
        .filter((d) => d.length > 0);

      if (editingService) {
        await api.updateService(editingService.id, {
          name,
          category,
          price,
          deliveryTime,
          shortDescription,
          description,
          deliverables,
          status,
        });
        toast('success', `Service package updated.`);
      } else {
        await api.createService({
          name,
          category,
          price,
          deliveryTime,
          shortDescription,
          description,
          deliverables,
          status,
        });
        toast('success', 'New service package published.');
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      toast('error', err.message || 'Failed to save service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (srv: Service) => {
    const nextStatus: 'active' | 'inactive' = srv.status === 'active' ? 'inactive' : 'active';
    try {
      await api.updateService(srv.id, { status: nextStatus });
      toast('info', `${srv.name} set to ${nextStatus}`);
      await fetchData();
    } catch (err: any) {
      toast('error', err.message || 'Failed to toggle status');
    }
  };

  const filtered = services.filter((s) => {
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Services & Pricing Catalog
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Configure social media management packages, deliverables, pricing tiers, and turnaround schedules.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs md:text-sm font-semibold flex items-center space-x-2 shadow-lg shadow-amber-950/40 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service Package</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search services..."
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
        />
      </div>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-900/40 text-zinc-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Service Package</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Standard Price</th>
                <th className="py-3.5 px-4">Turnaround</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filtered.map((srv) => (
                <tr key={srv.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{srv.name}</div>
                    <div className="text-[11px] text-zinc-400 line-clamp-1 max-w-sm">
                      {srv.shortDescription}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono uppercase text-[10px] text-zinc-300">
                      {srv.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">${srv.price.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-zinc-300">{srv.deliveryTime}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={srv.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => handleToggleStatus(srv)}
                        title={srv.status === 'active' ? 'Disable' : 'Enable'}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                      >
                        {srv.status === 'active' ? (
                          <ToggleRight className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-zinc-500" />
                        )}
                      </button>
                      <button
                        onClick={() => openEditModal(srv)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
                        title="Edit service details"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Add / Edit Service Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? `Edit Service: ${editingService.name}` : 'New SMM Service Package'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveService} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Service Package Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Executive Brand Authority Reel & Carousel Suite"
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Platform Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Standard Price ($ USD) *
              </label>
              <input
                type="number"
                step="5"
                required
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Turnaround / Delivery Window
              </label>
              <input
                type="text"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                placeholder="e.g. 24 - 48 Hours"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Catalog Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="active">Active (Visible in catalog)</option>
                <option value="inactive">Inactive (Hidden from clients)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Summary Description *
            </label>
            <input
              type="text"
              required
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Concise overview of what is included in this package..."
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Included Deliverables Checklist (one item per line)
            </label>
            <textarea
              rows={4}
              value={deliverablesText}
              onChange={(e) => setDeliverablesText(e.target.value)}
              placeholder="e.g.&#10;Full profile audit & bio revamp&#10;Custom hashtag cluster research&#10;Scheduled publishing via Meta API"
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500 resize-none font-mono"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-950/40"
            >
              {isLoading ? 'Saving...' : 'Save Package'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
