import React from 'react';
import { 
  Instagram, 
  Youtube, 
  Send, 
  Facebook, 
  Music2, 
  Twitter, 
  Disc, 
  Radio, 
  Layers, 
  Sparkles,
  LucideProps
} from 'lucide-react';

interface PlatformIconProps extends LucideProps {
  platformOrIcon: string;
}

export const PlatformIcon: React.FC<PlatformIconProps> = ({ platformOrIcon, className = 'w-5 h-5', ...props }) => {
  const normalized = (platformOrIcon || '').toLowerCase();

  if (normalized.includes('instagram') || normalized === 'instagram') {
    return <Instagram className={className} {...props} />;
  }
  if (normalized.includes('youtube') || normalized === 'youtube') {
    return <Youtube className={className} {...props} />;
  }
  if (normalized.includes('telegram') || normalized === 'telegram' || normalized === 'send') {
    return <Send className={className} {...props} />;
  }
  if (normalized.includes('facebook') || normalized === 'facebook') {
    return <Facebook className={className} {...props} />;
  }
  if (normalized.includes('tiktok') || normalized === 'tiktok' || normalized === 'music2') {
    return <Music2 className={className} {...props} />;
  }
  if (normalized.includes('twitter') || normalized === 'twitter' || normalized.includes('x') || normalized === 'x') {
    return <Twitter className={className} {...props} />;
  }
  if (normalized.includes('spotify') || normalized === 'spotify' || normalized === 'disc') {
    return <Disc className={className} {...props} />;
  }
  if (normalized.includes('soundcloud') || normalized === 'soundcloud' || normalized === 'radio') {
    return <Radio className={className} {...props} />;
  }
  if (normalized.includes('sparkles')) {
    return <Sparkles className={className} {...props} />;
  }

  return <Layers className={className} {...props} />;
};

export const getPlatformMeta = (platform: string) => {
  const norm = (platform || '').toLowerCase();
  if (norm.includes('instagram')) {
    return {
      name: 'Instagram',
      color: '#E1306C',
      bgColor: 'rgba(225, 48, 108, 0.15)',
      borderColor: 'rgba(225, 48, 108, 0.3)',
      textAccent: 'text-rose-400',
    };
  }
  if (norm.includes('youtube')) {
    return {
      name: 'YouTube',
      color: '#FF0000',
      bgColor: 'rgba(255, 0, 0, 0.15)',
      borderColor: 'rgba(255, 0, 0, 0.3)',
      textAccent: 'text-red-400',
    };
  }
  if (norm.includes('telegram')) {
    return {
      name: 'Telegram',
      color: '#229ED9',
      bgColor: 'rgba(34, 158, 217, 0.15)',
      borderColor: 'rgba(34, 158, 217, 0.3)',
      textAccent: 'text-sky-400',
    };
  }
  if (norm.includes('facebook')) {
    return {
      name: 'Facebook',
      color: '#1877F2',
      bgColor: 'rgba(24, 119, 242, 0.15)',
      borderColor: 'rgba(24, 119, 242, 0.3)',
      textAccent: 'text-blue-400',
    };
  }
  if (norm.includes('tiktok')) {
    return {
      name: 'TikTok',
      color: '#00F2FE',
      bgColor: 'rgba(0, 242, 254, 0.15)',
      borderColor: 'rgba(0, 242, 254, 0.3)',
      textAccent: 'text-cyan-400',
    };
  }
  if (norm.includes('twitter') || norm === 'x') {
    return {
      name: 'Twitter / X',
      color: '#1DA1F2',
      bgColor: 'rgba(29, 161, 242, 0.15)',
      borderColor: 'rgba(29, 161, 242, 0.3)',
      textAccent: 'text-blue-300',
    };
  }
  if (norm.includes('spotify')) {
    return {
      name: 'Spotify',
      color: '#1DB954',
      bgColor: 'rgba(29, 185, 84, 0.15)',
      borderColor: 'rgba(29, 185, 84, 0.3)',
      textAccent: 'text-green-400',
    };
  }
  if (norm.includes('soundcloud')) {
    return {
      name: 'SoundCloud',
      color: '#FF5500',
      bgColor: 'rgba(255, 85, 0, 0.15)',
      borderColor: 'rgba(255, 85, 0, 0.3)',
      textAccent: 'text-orange-400',
    };
  }
  return {
    name: 'Other Services',
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    textAccent: 'text-purple-400',
  };
};
