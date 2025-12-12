
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Github, Heart, Instagram } from 'lucide-react';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"/>
  </svg>
);

const letters = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

export const Footer = () => {
  const { language } = useAppStore();
  const t = translations[language];
  const location = useLocation();
  const isDonghua = location.pathname.includes('/donghua');

  return (
    <footer className="bg-[#020617] border-t border-white/5 pt-20 pb-10 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-violet-600 to-transparent opacity-50 blur-sm" />
      
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
          <div className="col-span-1 md:col-span-4 space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 p-1.5 rounded-lg">
                <Zap className="text-white w-5 h-5 fill-white" />
              </div>
              <span className="text-xl font-black tracking-tighter text-white">
                Flashy<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Nime</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              {t.footer.desc}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-violet-600 hover:text-white transition-all border border-white/5 hover:border-violet-500">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-violet-600 hover:text-white transition-all border border-white/5 hover:border-violet-500">
                <TikTokIcon className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-violet-600 hover:text-white transition-all border border-white/5 hover:border-violet-500">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h4 className="text-white font-bold mb-6 flex items-center gap-2">Anime</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link to="/browse?status=ongoing" className="hover:text-violet-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-violet-500"/> {t.browse.filters.ongoing}</Link></li>
              <li><Link to="/browse?status=popular" className="hover:text-violet-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-violet-500"/> {t.browse.filters.popular}</Link></li>
              <li><Link to="/movies" className="hover:text-violet-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-violet-500"/> {t.nav.movies}</Link></li>
              <li><Link to="/batch" className="hover:text-violet-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-violet-500"/> {t.nav.batch}</Link></li>
              <li><Link to="/genres" className="hover:text-violet-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-violet-500"/> {t.genres.animeTitle}</Link></li>
              <li><Link to="/schedule" className="hover:text-violet-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-violet-500"/> {t.nav.schedule}</Link></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h4 className="text-white font-bold mb-6 flex items-center gap-2">Donghua</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link to="/donghua" className="hover:text-violet-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-violet-500"/> {t.nav.home}</Link></li>
              <li><Link to="/donghua/browse" className="hover:text-violet-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-violet-500"/> {t.nav.browse}</Link></li>
              <li><Link to="/donghua/browse?status=seasons" className="hover:text-violet-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-violet-500"/> {t.nav.season}</Link></li>
              <li><Link to="/donghua/genres" className="hover:text-violet-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-violet-500"/> {t.genres.donghuaTitle}</Link></li>
              <li><Link to="/donghua/schedule" className="hover:text-violet-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-violet-500"/> {t.nav.schedule}</Link></li>
            </ul>
          </div>

          {!isDonghua && (
            <div className="col-span-1 md:col-span-4">
              <h4 className="text-white font-bold mb-6">Browse A-Z</h4>
              <div className="flex flex-wrap gap-2">
                  {letters.map((l) => (
                    <Link 
                      key={l} 
                      to={`/browse?letter=${l}`}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-violet-600 hover:text-white text-sm font-bold transition-all border border-white/5 hover:border-violet-500"
                    >
                        {l}
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} FlashyNime. {t.footer.rights}</p>
          <div className="flex items-center gap-1 text-slate-500 text-sm">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500 mx-1 animate-pulse" /> by Rio
          </div>
          <p className="text-xs text-slate-600 md:max-w-xs text-center md:text-right">
             {t.footer.disclaimer}
          </p>
        </div>
      </div>
    </footer>
  );
};
