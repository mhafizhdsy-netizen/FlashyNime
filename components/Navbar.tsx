
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Bookmark, Zap, Shuffle, Clock, ChevronDown, Languages, Info } from 'lucide-react';
import { Button } from './ui';
import { useAppStore } from '../store/store';
import { getRandomAnime } from '../services/api';
import { translations } from '../utils/translations';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const watchlistCount = useAppStore(state => state.watchlist.length);
  const { language, setLanguage } = useAppStore();
  const t = translations[language];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRandom = async () => {
    const data = await getRandomAnime();
    if (data && data.random && data.random.id) {
       navigate(`/anime/${data.random.id}`);
       setIsMobileMenuOpen(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'id' : 'en');
  };

  const menus = [
    {
      title: 'Anime',
      items: [
        { name: t.nav.home, path: '/' },
        { name: t.nav.browse, path: '/browse' },
        { name: t.nav.movies, path: '/movies' },
        { name: t.nav.genres, path: '/genres' },
        { name: t.nav.batch, path: '/batch' },
        { name: t.nav.schedule, path: '/schedule' },
      ]
    },
    {
      title: 'Donghua',
      items: [
        { name: t.nav.home, path: '/donghua' },
        { name: t.nav.browse, path: '/donghua/browse' },
        { name: t.nav.genres, path: '/donghua/genres' },
        { name: t.nav.schedule, path: '/donghua/schedule' },
        { name: t.nav.season, path: '/donghua/browse?status=seasons' },
      ]
    },
    {
      title: 'Manga',
      items: [
        { name: t.nav.home, path: '/manga' },
        { name: t.nav.browse, path: '/manga/browse' },
        { name: t.nav.genres, path: '/manga/genres' },
      ]
    }
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out px-2 md:px-6 pt-2 md:pt-4
          ${isScrolled ? 'translate-y-0' : 'translate-y-0'} 
        `}
      >
        <div 
          className={`
            max-w-7xl mx-auto rounded-2xl border border-white/5 
            ${isScrolled ? 'bg-[#0f172a]/80 backdrop-blur-xl shadow-2xl shadow-black/50 py-2' : 'bg-transparent border-transparent py-4'}
            transition-all duration-500 px-4 md:px-6 relative
          `}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="group flex items-center gap-2 relative z-10">
              <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-violet-500/20">
                <Zap className="text-white w-5 h-5 fill-white" />
              </div>
              <span className="text-xl font-black tracking-tighter text-white">
                Flashy<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Nime</span>
              </span>
            </Link>

            {/* Desktop Nav - Dropdowns */}
            <div className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
              <div className="flex items-center p-1 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
                {menus.map((menu) => {
                  const isActive = menu.items.some(item => item.path === location.pathname);
                  const isDropdownOpen = activeDropdown === menu.title;
                  
                  return (
                    <div 
                      key={menu.title}
                      className="relative group"
                      onMouseEnter={() => setActiveDropdown(menu.title)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <button 
                        className={`
                          flex items-center gap-1 px-5 py-2 rounded-full text-sm font-bold transition-all duration-300
                          ${isActive ? 'text-white bg-white/10' : 'text-slate-400 hover:text-white'}
                        `}
                      >
                        {menu.title} <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Menu */}
                      <div className={`
                         absolute top-full left-0 mt-2 w-48 bg-[#0f172a] border border-white/10 rounded-xl shadow-xl overflow-hidden transition-all duration-200 origin-top z-50
                         ${isDropdownOpen ? 'opacity-100 visible translate-y-0 scale-100' : 'opacity-0 invisible -translate-y-2 scale-95'}
                      `}>
                         <div className="p-1.5 flex flex-col gap-1">
                           {menu.items.map(item => (
                             <Link
                               key={item.path}
                               to={item.path}
                               className={`
                                 block px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors
                                 ${location.pathname === item.path ? 'bg-violet-600/20 text-violet-300' : 'text-slate-400 hover:text-white hover:bg-white/5'}
                               `}
                             >
                               {item.name}
                             </Link>
                           ))}
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/5 font-bold text-xs"
                title="Change Language"
              >
                {language.toUpperCase()}
              </button>

              <button 
                onClick={() => navigate('/search')} 
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/5"
              >
                <Search className="w-4 h-4" />
              </button>
              
              <button 
                onClick={handleRandom} 
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 hover:from-violet-600 hover:to-fuchsia-600 text-violet-300 hover:text-white transition-all border border-violet-500/30 hover:border-transparent group"
                title={t.nav.random}
              >
                <Shuffle className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              </button>

              <Link to="/history">
                <div className="hidden md:flex relative w-10 h-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/5">
                  <Clock className="w-4 h-4" />
                </div>
              </Link>

              <Link to="/watchlist">
                <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/5">
                  <Bookmark className="w-4 h-4" />
                  {watchlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-fuchsia-600 text-[9px] font-bold flex items-center justify-center rounded-full text-white shadow-lg shadow-fuchsia-600/40 animate-scale-in">
                      {watchlistCount}
                    </span>
                  )}
                </div>
              </Link>

              <button 
                className="md:hidden p-2 text-white hover:bg-white/5 rounded-full transition-colors z-50 relative"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay - Full Screen Blur */}
      <div 
         className={`
           fixed inset-0 z-[40] bg-[#020617]/95 backdrop-blur-3xl flex flex-col md:hidden transition-all duration-300
           ${isMobileMenuOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}
         `}
      >
         {/* Content */}
         <div className="flex-1 overflow-y-auto px-6 pt-24 pb-8 space-y-8 animate-fade-in-up">
             {/* Mobile Search */}
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                <input 
                   type="text" 
                   placeholder={t.nav.searchPlaceholder} 
                   className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all placeholder:text-slate-500"
                   onKeyDown={(e) => { if(e.key === 'Enter') { navigate('/search'); setIsMobileMenuOpen(false); } }}
                   onClick={() => { navigate('/search'); setIsMobileMenuOpen(false); }}
                   readOnly
                />
             </div>

             {/* Navigation Groups */}
             <div className="grid gap-8">
                {menus.map((menu) => (
                   <div key={menu.title} className="space-y-4">
                      <h3 className="text-sm font-black text-violet-500 uppercase tracking-widest pl-1">{menu.title}</h3>
                      <div className="grid grid-cols-2 gap-3">
                         {menu.items.map(item => (
                             <Link 
                               key={item.path}
                               to={item.path} 
                               onClick={() => setIsMobileMenuOpen(false)}
                               className={`
                                 flex items-center justify-center p-3 rounded-xl text-sm font-bold transition-all border
                                 ${location.pathname === item.path 
                                    ? 'bg-violet-600/20 text-violet-300 border-violet-500/30' 
                                    : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10 hover:text-white'
                                 }
                               `}
                             >
                                {item.name}
                             </Link>
                         ))}
                      </div>
                   </div>
                ))}
             </div>

             {/* Quick Actions */}
             <div className="pt-8 border-t border-white/10 space-y-3">
                 <Link to="/history" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400"><Clock className="w-4 h-4" /></div>
                    <span className="font-bold">{t.nav.history}</span>
                 </Link>
                 <Link to="/watchlist" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                    <div className="p-2 rounded-lg bg-fuchsia-500/20 text-fuchsia-400"><Bookmark className="w-4 h-4" /></div>
                    <span className="font-bold">{t.nav.watchlist}</span>
                 </Link>
                 <button onClick={() => { handleRandom(); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-4 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors text-left">
                    <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400"><Shuffle className="w-4 h-4" /></div>
                    <span className="font-bold">{t.nav.random}</span>
                 </button>
                 <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400"><Info className="w-4 h-4" /></div>
                    <span className="font-bold">{t.nav.about}</span>
                 </Link>
             </div>
             
             <div className="pt-4 text-center">
                <span className="inline-block text-xs font-bold text-slate-500">
                   Version 1.0.0 • FlashyNime
                </span>
             </div>
         </div>
      </div>
    </>
  );
};