import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Layers, 
  Sparkles, 
  AlertCircle,
  MoveUp,
  MoveDown
} from 'lucide-react';
import { PlatformCategory } from '../types/database';
import { PlatformIcon, getPlatformMeta } from '../components/PlatformIcon';
import { api } from '../api/client';

interface CategoryManagementProps {
  categories: PlatformCategory[];
  onRefreshCategories: () => void;
}

export const CategoryManagement: React.FC<CategoryManagementProps> = ({
  categories,
  onRefreshCategories,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    iconName: 'Instagram',
    color: '#22C55E',
    bgColor: 'rgba(34, 197, 94, 0.15)',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const iconOptions = [
    { label: 'Instagram', value: 'Instagram' },
    { label: 'YouTube', value: 'Youtube' },
    { label: 'Telegram', value: 'Send' },
    { label: 'Facebook', value: 'Facebook' },
    { label: 'TikTok', value: 'Music2' },
    { label: 'Twitter / X', value: 'Twitter' },
    { label: 'Spotify', value: 'Disc' },
    { label: 'SoundCloud', value: 'Radio' },
    { label: 'General / Other', value: 'Layers' },
  ];

  const handleStartEdit = (cat: PlatformCategory) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      iconName: cat.iconName || 'Layers',
      color: cat.color || '#22C55E',
      bgColor: cat.bgColor || 'rgba(34, 197, 94, 0.15)',
      description: cat.description || '',
    });
  };

  const handleSaveEdit = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.updateCategory(id, formData);
      setEditingId(null);
      onRefreshCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.createCategory(formData);
      setShowCreateModal(false);
      setFormData({
        name: '',
        iconName: 'Instagram',
        color: '#22C55E',
        bgColor: 'rgba(34, 197, 94, 0.15)',
        description: '',
      });
      onRefreshCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;
    setLoading(true);
    try {
      await api.deleteCategory(id);
      onRefreshCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Platform Categories</h3>
          <p className="text-xs text-zinc-400">Manage social platforms shown on user dashboards</p>
        </div>
        <button
          onClick={() => {
            setFormData({
              name: '',
              iconName: 'Instagram',
              color: '#22C55E',
              bgColor: 'rgba(34, 197, 94, 0.15)',
              description: '',
            });
            setShowCreateModal(true);
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Platform</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Categories Grid / Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories.map((cat) => {
          const isEditing = editingId === cat.id;

          if (isEditing) {
            return (
              <div key={cat.id} className="p-4 rounded-2xl bg-zinc-900 border border-emerald-500/50 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Icon</label>
                    <select
                      value={formData.iconName}
                      onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs"
                    >
                      {iconOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Color</label>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value, bgColor: `${e.target.value}20` })}
                      className="h-8 w-12 rounded bg-zinc-950 border border-zinc-800 p-0.5 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800">
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveEdit(cat.id)}
                    disabled={loading}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500 text-zinc-950 text-xs font-bold"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={cat.id}
              className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: cat.bgColor || 'rgba(34, 197, 94, 0.15)',
                    color: cat.color || '#22C55E',
                  }}
                >
                  <PlatformIcon platformOrIcon={cat.iconName || cat.id} className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{cat.name}</span>
                    <span className="text-[10px] text-zinc-400 font-normal">
                      ({cat.servicesCount ?? 0} services)
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-1 max-w-[200px]">
                    {cat.description || 'No description provided'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleStartEdit(cat)}
                  className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                  title="Edit category"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800"
                  title="Delete category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Category Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl text-zinc-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h4 className="text-base font-bold text-white">Create New Platform</h4>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Platform Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. LinkedIn or Threads"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Professional B2B post formatting and audience engagement"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Icon Style</label>
                  <select
                    value={formData.iconName}
                    onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs"
                  >
                    {iconOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Brand Color</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value, bgColor: `${e.target.value}25` })}
                    className="h-9 w-14 rounded-xl bg-zinc-950 border border-zinc-800 p-1 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs"
                >
                  {loading ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
