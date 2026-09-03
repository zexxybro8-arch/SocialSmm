import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { SupportTicket } from '../types/database';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/Badge';
import { useToast } from '../components/Toast';
import { 
  LifeBuoy, 
  Send, 
  CheckCircle2, 
  Clock, 
  User, 
  ShieldCheck, 
  Search,
  MessageSquare
} from 'lucide-react';

export const AdminSupportQueue: React.FC = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  const fetchTickets = async () => {
    try {
      const data = await api.getTickets();
      setTickets(data);
      if (selectedTicket) {
        const found = data.find((t) => t.id === selectedTicket.id);
        if (found) setSelectedTicket(found);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    setIsSending(true);
    try {
      const updated = await api.addTicketReply(selectedTicket.id, replyText);
      setSelectedTicket(updated);
      setReplyText('');
      await fetchTickets();
      toast('success', 'Support response transmitted');
    } catch (err: any) {
      toast('error', err.message || 'Failed to send reply');
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateStatus = async (status: 'open' | 'in_progress' | 'resolved' | 'closed') => {
    if (!selectedTicket) return;
    try {
      const updated = await api.updateTicketStatus(selectedTicket.id, status);
      setSelectedTicket(updated);
      await fetchTickets();
      toast('info', `Ticket status marked ${status.toUpperCase()}`);
    } catch (err: any) {
      toast('error', err.message || 'Failed to change status');
    }
  };

  const filtered = tickets.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.id.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.customerId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
          Client Support & Inquiries Queue
        </h2>
        <p className="text-xs md:text-sm text-zinc-400 mt-1">
          Respond to customer questions regarding campaign timelines, invoices, and service deliverables.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-2">
            {filtered.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-950/20 border-amber-500 shadow-md'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-semibold text-zinc-400">{t.id}</span>
                    <StatusBadge status={t.status} />
                  </div>
                  <h4 className="text-xs font-semibold text-white truncate">{t.subject}</h4>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2">
                    <span className="font-mono">{t.customerId}</span>
                    <span className="uppercase text-[10px] text-amber-400 font-bold">{t.priority}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Conversation */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <GlassCard className="p-5 flex flex-col h-[580px] justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-zinc-800">
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedTicket.subject}</h3>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      Client ID: <strong className="font-mono text-zinc-200">{selectedTicket.customerId}</strong> • Category: <strong className="text-zinc-200 capitalize">{selectedTicket.category.replace('_', ' ')}</strong>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 self-start sm:self-auto">
                    <button
                      onClick={() => handleUpdateStatus('in_progress')}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-semibold text-zinc-200 transition-colors"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('resolved')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-800 hover:bg-emerald-900 text-[11px] font-semibold text-emerald-300 transition-colors"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-2 custom-scrollbar">
                {(selectedTicket.messages || []).map((m) => {
                  const isAdmin = m.senderRole === 'admin';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center space-x-1.5 text-[11px] text-zinc-400 mb-1 px-1">
                        {isAdmin ? (
                          <ShieldCheck className="w-3 h-3 text-amber-400" />
                        ) : (
                          <User className="w-3 h-3 text-indigo-400" />
                        )}
                        <span className="font-semibold text-zinc-300">{m.senderName}</span>
                        <span>•</span>
                        <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                          isAdmin
                            ? 'bg-amber-600 text-white rounded-tr-sm shadow-md shadow-amber-950/30'
                            : 'bg-zinc-800 text-zinc-200 rounded-tl-sm border border-zinc-700/80'
                        }`}
                      >
                        {m.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-zinc-800 flex items-center space-x-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type administrative reply to client..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={isSending || !replyText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0 shadow-md shadow-amber-950/30"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
              </form>
            </GlassCard>
          ) : (
            <div className="h-[580px] rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 flex flex-col items-center justify-center p-6 text-center text-xs text-zinc-500">
              <MessageSquare className="w-8 h-8 mb-2 text-zinc-600" />
              <p>Select a support ticket from the list to read history and send responses.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
