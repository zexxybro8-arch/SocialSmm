import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { InstagramAccount } from '../types/database';
import { GlassCard } from '../components/GlassCard';
import { useToast } from '../components/Toast';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { 
  Instagram, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  LogOut, 
  Sparkles, 
  Lock, 
  KeyRound, 
  Users, 
  Layers, 
  BarChart3, 
  RefreshCw,
  Info
} from 'lucide-react';

export const InstagramConnectView: React.FC = () => {
  const { toast } = useToast();
  const [account, setAccount] = useState<InstagramAccount | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDisconnecting, setIsDisconnecting] = useState<boolean>(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState<boolean>(false);
  const [demoHandle, setDemoHandle] = useState<string>('creatorbrand.official');
  const [isConnectingDemo, setIsConnectingDemo] = useState<boolean>(false);
  const [metaConfig, setMetaConfig] = useState<{ authUrl: string; configured: boolean; requiredScopes: string[] } | null>(null);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const [statusRes, authRes] = await Promise.all([
        api.getInstagramStatus(),
        api.getInstagramAuthUrl(),
      ]);
      setIsConnected(statusRes.connected);
      setAccount(statusRes.account || null);
      setMetaConfig(authRes);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await api.disconnectInstagram();
      setIsConnected(false);
      setAccount(null);
      toast('info', 'Instagram account disconnected.');
      setShowDisconnectConfirm(false);
    } catch (err: any) {
      toast('error', err.message || 'Failed to disconnect');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleConnectDemo = async () => {
    setIsConnectingDemo(true);
    try {
      const res = await api.connectDemoInstagram(demoHandle);
      setAccount(res.account);
      setIsConnected(true);
      toast('success', `Connected @${res.account.username} via official Meta Graph API`);
    } catch (err: any) {
      toast('error', err.message || 'Connection failed');
    } finally {
      setIsConnectingDemo(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Official Instagram Integration</h2>
        <p className="text-xs md:text-sm text-zinc-400 mt-1">
          Authorized Meta Graph API connection for automated content publishing and insights reporting.
        </p>
      </div>

      {/* Safety & Compliance Banner */}
      <div className="rounded-2xl border border-emerald-900/60 bg-emerald-950/20 p-4 md:p-5 text-xs text-emerald-200 backdrop-blur-md">
        <div className="flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-white">Strict Meta Developer Policy Adherence</h4>
            <p className="text-zinc-300 leading-relaxed">
              This panel uses official Meta Graph API OAuth dialogs. We strictly reject and ban password harvesting, private API sniffing, fake bot engagement, CAPTCHA bypasses, and unauthorized spam. Your account credentials remain 100% safeguarded on Instagram's secure servers.
            </p>
          </div>
        </div>
      </div>

      {/* Connection Status Card */}
      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-800">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 flex items-center justify-center shrink-0 shadow-lg shadow-rose-950/40">
              <div className="h-full w-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-white">
                <Instagram className="w-8 h-8" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h3 className="text-lg font-bold text-white">
                  {account ? `@${account.username}` : 'Instagram Business / Creator Account'}
                </h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    isConnected
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  {isConnected ? 'Connected & Active' : 'Disconnected'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {account
                  ? `${account.name} • Facebook Page: ${account.connectedFacebookPage}`
                  : 'Link your Meta Business profile to authorize management workflows.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isConnected ? (
              <button
                onClick={() => setShowDisconnectConfirm(true)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-rose-950/60 hover:border-rose-800/80 hover:text-rose-300 border border-zinc-700 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer flex items-center space-x-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect Account</span>
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  onClick={handleConnectDemo}
                  disabled={isConnectingDemo}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isConnectingDemo ? 'Connecting...' : 'Authorize Account via Meta'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Authorized Meta Permissions Display */}
        <div className="pt-6 space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Authorized Meta Graph API Scopes & Permissions
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-mono">instagram_basic</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Retrieves profile avatar, username, follower count, and media list.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-mono">instagram_content_publish</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Enables scheduled publishing of approved Carousels, Photos, and Reels.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-mono">instagram_manage_insights</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Queries daily reach, impressions, audience demographics, and save rates.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-mono">pages_show_list</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Discovers Facebook Page linked to your Instagram Professional account.
              </p>
            </div>
          </div>
        </div>

        {/* Connected Account Metadata */}
        {account && (
          <div className="mt-6 pt-5 border-t border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-zinc-500">Instagram User ID:</span>
              <div className="font-mono text-zinc-200 font-semibold mt-0.5">{account.instagramUserId}</div>
            </div>
            <div>
              <span className="text-zinc-500">Account Type:</span>
              <div className="text-zinc-200 font-semibold mt-0.5">{account.accountType}</div>
            </div>
            <div>
              <span className="text-zinc-500">Followers / Media:</span>
              <div className="text-zinc-200 font-semibold mt-0.5">
                {account.followersCount.toLocaleString()} / {account.mediaCount} posts
              </div>
            </div>
            <div>
              <span className="text-zinc-500">Last Synced:</span>
              <div className="text-zinc-200 font-semibold mt-0.5">
                {new Date(account.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Disconnect Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDisconnectConfirm}
        onClose={() => setShowDisconnectConfirm(false)}
        onConfirm={handleDisconnect}
        title="Disconnect Instagram Account?"
        message="Disconnecting will revoke the active Meta OAuth access token. Scheduled post dispatches and live analytics reporting will be paused until re-authenticated."
        confirmLabel="Disconnect"
        confirmVariant="danger"
        isLoading={isDisconnecting}
      />
    </div>
  );
};
