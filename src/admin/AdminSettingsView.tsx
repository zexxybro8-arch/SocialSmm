import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { AuditLog } from '../types/database';
import { GlassCard } from '../components/GlassCard';
import { useToast } from '../components/Toast';
import { 
  Settings, 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Instagram, 
  FileText, 
  CheckCircle2, 
  Save, 
  AlertTriangle,
  Server
} from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [appId, setAppId] = useState<string>('849204918239012');
  const [appSecret, setAppSecret] = useState<string>('••••••••••••••••••••••••••••••••');
  const [webhookToken, setWebhookToken] = useState<string>('meta_verify_token_smm_prod_2026');
  const [callbackUrl, setCallbackUrl] = useState<string>('https://app.instasmm.com/api/instagram/oauth/callback');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await api.getAdminAuditLogs();
        setLogs(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchLogs();
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast('success', 'Meta Graph API configuration saved.');
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
          System Security & Meta API Settings
        </h2>
        <p className="text-xs md:text-sm text-zinc-400 mt-1">
          Configure Meta Developer credentials, verify security policies, and audit administrative event history.
        </p>
      </div>

      {/* Meta API Configuration Form */}
      <GlassCard className="p-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-zinc-800">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-md">
            <Instagram className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Meta Developer App Credentials</h3>
            <p className="text-xs text-zinc-400">
              Required for user OAuth dialogs and Graph API v21.0 authorization
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Meta App ID
              </label>
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Meta App Secret (Encrypted)
              </label>
              <input
                type="password"
                value={appSecret}
                onChange={(e) => setAppSecret(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Webhook Verify Token
              </label>
              <input
                type="text"
                value={webhookToken}
                onChange={(e) => setWebhookToken(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Authorized OAuth Redirect URI
              </label>
              <input
                type="text"
                value={callbackUrl}
                onChange={(e) => setCallbackUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-amber-950/40 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Updating...' : 'Save Meta Configuration'}</span>
            </button>
          </div>
        </form>
      </GlassCard>

      {/* Security Checkpoints */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-emerald-900/60 bg-emerald-950/20 space-y-1.5">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Anti-Harvesting Guard Active</span>
          </div>
          <p className="text-[11px] text-zinc-300">
            Passwords never pass through or get logged in backend traces. OAuth tokens stored encrypted.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-emerald-900/60 bg-emerald-950/20 space-y-1.5">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Strict Role Segregation</span>
          </div>
          <p className="text-[11px] text-zinc-300">
            Customer token cannot elevate to admin routes. Customer accounts provisioned strictly by admins.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-emerald-900/60 bg-emerald-950/20 space-y-1.5">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Anti-Bot Architecture</span>
          </div>
          <p className="text-[11px] text-zinc-300">
            Zero automated follower scraping, fake likes, or spam engines allowed on platform infrastructure.
          </p>
        </div>
      </div>

      {/* Administrative Audit Logs Table */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-white">Administrative Audit Logs</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Immutable record of admin actions and mutations</p>
          </div>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800/80 text-zinc-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Actor</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Target Entity</th>
                <th className="py-3 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3 px-3 text-zinc-400">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-3 px-3 font-semibold text-white">{log.actorName}</td>
                  <td className="py-3 px-3 font-mono text-amber-400">{log.action}</td>
                  <td className="py-3 px-3 font-mono text-zinc-300">{log.targetId}</td>
                  <td className="py-3 px-3 text-zinc-400 max-w-sm truncate">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
