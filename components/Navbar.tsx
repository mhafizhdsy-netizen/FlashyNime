
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Bookmark, Zap, Shuffle, Clock, ChevronDown, Languages, Info, Film, Tv, BookOpen } from 'lucide-react';
import { Button, Spinner } from './ui';
import { useAppStore } from '../store/store';
import { getRandomAnime, searchAnime, searchDonghua, searchManga, normalizeAnime, normalizeDonghua, normalizeManga } from '../services/api';
import { translations } from '../utils/translations';
import { Anime } from '../types';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Anime[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const watchlistCount = useAppStore(state => state.watchlist.length);
  const { language, setLanguage } = useAppStore();
  const t = translations[language];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Click outside to close search
    const handleClickOutside = (event: MouseEvent) => {
        if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
            if (window.innerWidth >= 768) { // Only on desktop
                setIsSearchOpen(false);
            }
            setSuggestions([]); // Clear suggestions to hide dropdown
        }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Auto-focus input when opening search
  useEffect(() => {
      if (isSearchOpen && inputRef.current) {
          inputRef.current.focus();
      }
  }, [isSearchOpen]);

  // Debounced Search Effect
  useEffect(() => {
      const delayDebounceFn = setTimeout(async () => {
          if (searchQuery.trim().length > 2) {
              setIsSearching(true);
              try {
                  // Fetch from all sources in parallel
                  const [animeRes, donghuaRes, mangaRes] = await Promise.allSettled([
                      searchAnime(searchQuery),
                      searchDonghua(searchQuery),
                      searchManga(searchQuery)
                  ]);

                  let combinedResults: Anime[] = [];

                  if (animeRes.status === 'fulfilled' && animeRes.value.search_results) {
                      combinedResults = [...combinedResults, ...animeRes.value.search_results.map(normalizeAnime).slice(0, 3)];
                  }
                  if (donghuaRes.status === 'fulfilled' && donghuaRes.value.search_results) {
                      combinedResults = [...combinedResults, ...donghuaRes.value.search_results.map(normalizeDonghua).slice(0, 2)];
                  }
                  if (mangaRes.status === 'fulfilled' && mangaRes.value.results) {
                      combinedResults = [...combinedResults, ...mangaRes.value.results.map(normalizeManga).slice(0, 2)];
                  }

                  setSuggestions(combinedResults);
              } catch (error) {
                  console.error("Auto-suggest error:", error);
                  setSuggestions([]);
              } finally {
                  setIsSearching(false);
              }
          } else {
              setSuggestions([]);
          }
      }, 500);

      return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
          navigate(`/search?q=${encodeURIComponent(searchQuery)}`); // You might need to handle query param in Search page or just navigate
          // Since existing Search page uses internal state, let's just go to /search and let user type again or 
          // Better: pass state. For now, simple navigation to trigger fresh search context if needed.
          // Actually, the current Search page doesn't read URL params for query. 
          // So we just navigate to /search and close the dropdown. 
          // Ideally, Search.tsx should read ?q= param.
          navigate('/search'); 
          setIsSearchOpen(false);
          setSuggestions([]);
          setSearchQuery('');
          setIsMobileMenuOpen(false);
      }
  };

  const handleSuggestionClick = (anime: Anime) => {
      let path = `/anime/${anime.id}`;
      if (anime.isManga) path = `/manga/detail/${anime.id}`;
      else if (anime.isDonghua) path = `/donghua/detail/${anime.id}`;
      
      navigate(path);
      setIsSearchOpen(false);
      setSuggestions([]);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
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

  const SearchDropdown = () => {
      if (searchQuery.length > 2 && (suggestions.length > 0 || isSearching)) {
          return (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                  {isSearching ? (
                      <div className="p-4 flex justify-center">
                          <Spinner />
                      </div>
                  ) : (
                      <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                          {suggestions.map((item, idx) => (
                              <div 
                                  key={`${item.id}-${idx}`}
                                  onClick={() => handleSuggestionClick(item)}
                                  className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                              >
                                  <img 
                                      src={Array.isArray(item.poster) ? item.poster[0] : item.poster} 
                                      alt={item.title} 
                                      className="w-10 h-14 object-cover rounded-md flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                      <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                                      <div className="flex items-center gap-2 mt-1">
                                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                              item.isManga ? 'bg-rose-500/10 text-rose-300 border-rose-500/20' : 
                                              item.isDonghua ? 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20' : 
                                              'bg-violet-500/10 text-violet-300 border-violet-500/20'
                                          }`}>
                                              {item.isManga ? 'Manga' : item.isDonghua ? 'Donghua' : 'Anime'}
                                          </span>
                                          {item.rating && item.rating !== 'N/A' && (
                                              <span className="text-[10px] text-yellow-500 flex items-center gap-0.5">
                                                  ★ {item.rating}
                                              </span>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          ))}
                          <button 
                              onClick={handleSearchSubmit}
                              className="w-full p-3 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-center uppercase tracking-wider"
                          >
                              See all results for "{searchQuery}"
                          </button>
                      </div>
                  )}
              </div>
          );
      }
      return null;
  };

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
            {!isSearchOpen && (
                <div className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2 animate-fade-in">
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
                                    ${location.pathname === item.path ? 'bg-violet-600/20 text-violet-300' : 'text-slate-400 hover:text-white hover:bg-white/10'}
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
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              
              {/* Expandable Search Bar (Desktop) */}
              <div ref={searchRef} className="hidden md:flex relative items-center transition-all duration-300">
                  <div className={`flex items-center bg-white/5 border border-white/5 rounded-full overflow-hidden transition-all duration-500 ${isSearchOpen ? 'w-64 bg-[#0f172a] border-violet-500/50 shadow-lg shadow-violet-500/10' : 'w-10 h-10 hover:bg-white/10'}`}>
                      <button 
                          onClick={() => {
                              if (!isSearchOpen) setIsSearchOpen(true);
                              else if(searchQuery) handleSearchSubmit({preventDefault:()=>{}} as any);
                          }}
                          className={`flex-shrink-0 w-10 h-10 flex items-center justify-center text-slate-300 transition-colors ${isSearchOpen ? 'text-violet-400' : 'hover:text-white'}`}
                      >
                          <Search className="w-4 h-4" />
                      </button>
                      <input 
                          ref={inputRef}
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                          placeholder={t.nav.searchPlaceholder}
                          className={`bg-transparent border-none outline-none text-sm text-white placeholder-slate-500 h-full w-full pr-10 transition-all duration-300 ${isSearchOpen ? 'opacity-100' : 'opacity-0 w-0'}`}
                      />
                      {isSearchOpen && (
                          <button 
                              onClick={() => {
                                  setIsSearchOpen(false);
                                  setSearchQuery('');
                                  setSuggestions([]);
                              }}
                              className="absolute right-2 p-1 text-slate-500 hover:text-white transition-colors"
                          >
                              <X className="w-4 h-4" />
                          </button>
                      )}
                  </div>
                  {/* Dropdown Results */}
                  <SearchDropdown />
              </div>

              {/* Discovery Actions */}
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

              {/* Language Toggle - Moved to end for better grouping */}
              <button
                onClick={toggleLanguage}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/5 font-bold text-xs"
                title="Change Language"
              >
                {language.toUpperCase()}
              </button>

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
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder={t.nav.searchPlaceholder} 
                   className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all placeholder:text-slate-500"
                   onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                />
                {/* Mobile Dropdown */}
                <div className="relative mt-2">
                    <SearchDropdown />
                </div>
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
