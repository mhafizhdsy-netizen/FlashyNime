
import React, { useEffect, useState } from 'react';
import { X, Copy, Check, Facebook, Twitter, Link as LinkIcon } from 'lucide-react';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, title, url }) => {
  const [copied, setCopied] = useState(false);
  const { language } = useAppStore();
  const t = translations[language];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const shareLinks = [
    {
      name: 'Facebook',
      icon: <Facebook className="w-6 h-6" />,
      color: 'bg-[#1877F2]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    },
    {
      name: 'Twitter',
      icon: <Twitter className="w-6 h-6" />,
      color: 'bg-[#000000]',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    },
    {
      name: 'WhatsApp',
      icon: <WhatsAppIcon className="w-6 h-6" />,
      color: 'bg-[#25D366]',
      url: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`
    },
    {
      name: 'Telegram',
      icon: <TelegramIcon className="w-6 h-6" />,
      color: 'bg-[#229ED9]',
      url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl p-6 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">{t.details.shareTitle}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Preview */}
        <div className="mb-8">
            <p className="text-slate-400 text-sm mb-2">{t.details.shareDesc}:</p>
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-violet-500 to-fuchsia-500 rounded-full" />
                <p className="font-bold text-slate-200 line-clamp-1">{title}</p>
            </div>
        </div>

        {/* Social Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
           {shareLinks.map((link) => (
             <a 
               key={link.name}
               href={link.url}
               target="_blank"
               rel="noopener noreferrer"
               className="flex flex-col items-center gap-2 group"
             >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 group-hover:-translate-y-1 ${link.color}`}>
                   {link.icon}
                </div>
                <span className="text-xs font-medium text-slate-400 group-hover:text-white transition-colors">{link.name}</span>
             </a>
           ))}
        </div>

        {/* Copy Link */}
        <div className="relative">
            <div className="flex items-center gap-2 p-1.5 pl-4 bg-black/40 border border-white/10 rounded-xl group focus-within:border-violet-500/50 transition-colors">
                <LinkIcon className="w-4 h-4 text-slate-500" />
                <input 
                  readOnly 
                  value={url} 
                  className="bg-transparent border-none outline-none text-sm text-slate-300 w-full truncate font-mono"
                />
                <button 
                  onClick={handleCopy}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all min-w-[90px] justify-center
                    ${copied 
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                        : 'bg-white/10 text-white hover:bg-violet-600 hover:shadow-lg hover:shadow-violet-600/20'
                    }
                  `}
                >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? t.details.copied : t.details.copy}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};
