import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { Filter, X, ArrowLeft, ChevronDown, AlignLeft, Search, Layers, Grid, ListFilter, Tag } from 'lucide-react';
import { 
  getOngoingAnime, 
  getCompleteAnime, 
  getMovies, 
  getPopularAnime, 
  getLatestEpisodes,
  getAnimeByGenre,
  getAnimeListByLetter, 
  getGenres,
  normalizeAnime,
  getAnimeDetail
} from '../services/api';
import { Anime, Genre, AnimeGroup } from '../types';
import { AnimeCard } from '../components/AnimeCard';
import { Button, Spinner, Badge } from '../components/ui';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';

export const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Data State
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [allLetters, setAllLetters] = useState<AnimeGroup[]>([]);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isGenreMenuOpen, setIsGenreMenuOpen] = useState(false);
  const [isLetterMenuOpen, setIsLetterMenuOpen] = useState(false);
  
  const { language } = useAppStore();
  const t = translations[language];
  
  // Derived Params
  const activeStatus = searchParams.get('status');
  const genreParam = searchParams.get('genre');
  const letterParam = searchParams.get('letter');
  
  // Defaults if no param is set, depending on route
  const currentStatus = activeStatus || (location.pathname.includes('popular') ? 'popular' : location.pathname.includes('movies') ? 'movies' : 'popular');
  
  const selectedGenres = genreParam ? genreParam.split(',').filter(Boolean) : [];
  const selectedLetter = letterParam || null;

  const statusFilters = [
    { id: 'popular', label: t.browse.filters.popular },
    { id: 'recent', label: t.browse.filters.recent },
    { id: 'ongoing', label: t.browse.filters.ongoing },
    { id: 'completed', label: t.browse.filters.completed },
    { id: 'movies', label: t.browse.filters.movies }
  ];

  const letters = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  // -- Data Fetching --

  useEffect(() => {
    getGenres().then(res => setGenres(res.genres || []));
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        if (selectedLetter) {
          let groups = allLetters;
          if (groups.length === 0) {
            const res = await getAnimeListByLetter();
            groups = res.list || [];
            if (!isCancelled) {
              setAllLetters(groups);
            }
          }
          const group = groups.find(g => g.startWith.toUpperCase() === selectedLetter.toUpperCase());
          
          const initialAnimes = group?.animeList || [];
          if (!isCancelled) {
            setAnimes(initialAnimes);
          }
        } else {
          // Fallback to original logic for other filters
          let results: Anime[] = [];
          if (selectedGenres.length > 0) {
            const promises = selectedGenres.map(id => getAnimeByGenre(id, page));
            const responses = await Promise.all(promises);
            let combined: Anime[] = [];
            responses.forEach(res => {
              if (res.genre_anime) {
                combined = [...combined, ...res.genre_anime.map(normalizeAnime)];
              }
            });
            const uniqueMap = new Map();
            combined.forEach(item => {
              if (!uniqueMap.has(item.id)) uniqueMap.set(item.id, item);
            });
            results = Array.from(uniqueMap.values());
          } else {
            let res: any;
            switch (currentStatus) {
              case 'recent':
                res = await getLatestEpisodes(page);
                if (res.latest) results = res.latest.map(normalizeAnime);
                break;
              case 'ongoing':
                res = await getOngoingAnime(page);
                if (res.ongoing) results = res.ongoing.map(normalizeAnime);
                break;
              case 'completed':
                res = await getCompleteAnime(page);
                if (res.complete) results = res.complete.map(normalizeAnime);
                break;
              case 'movies':
                res = await getMovies(page);
                if (res.movies) results = res.movies.map(normalizeAnime);
                break;
              case 'popular':
              default:
                res = await getPopularAnime(page);
                if (res.popular) results = res.popular.map(normalizeAnime);
                break;
            }
          }
          if (!isCancelled) {
            setAnimes(results);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };
    
    if (page === 1) window.scrollTo(0, 0);
    
    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [currentStatus, genreParam, letterParam, page]); 

  // -- Handlers --

  const toggleGenre = (genreId: string) => {
    const current = new Set(selectedGenres);
    if (current.has(genreId)) current.delete(genreId);
    else current.add(genreId);
    
    const nextGenres = Array.from(current).join(',');
    const newParams: any = {};
    
    if (nextGenres) newParams.genre = nextGenres;
    else newParams.status = currentStatus; // Fallback to status if genres cleared
    
    setSearchParams(newParams);
    setPage(1);
  };

  const handleLetterSelect = (letter: string) => {
      setSearchParams({ letter });
      setIsLetterMenuOpen(false);
      setPage(1);
  };

  const clearAllFilters = () => {
    setSearchParams({ status: 'popular' });
    setPage(1);
  };

  const removeFilter = (type: 'letter' | 'genre', value?: string) => {
      if (type === 'letter') {
          setSearchParams({ status: currentStatus });
      } else if (type === 'genre' && value) {
          toggleGenre(value);
      }
      setPage(1);
  };

  const getPageTitle = () => {
    if (selectedLetter) return `A-Z: ${selectedLetter}`;
    if (selectedGenres.length > 0) return `${selectedGenres.length} Genres`;
    const activeFilterObj = statusFilters.find(f => f.id === currentStatus);
    return activeFilterObj ? activeFilterObj.label : 'Library';
  };

  return (
    <div className="min-h-screen bg-[#020617] pb-20">
       
       {/* --- Header & Filters (Static/Relative) --- */}
       <div className="relative z-30 bg-[#020617] border-b border-white/5 pt-20 md:pt-24 pb-4">
          <div className="container mx-auto px-4 md:px-6">
              
              {/* Top Row: Back, Title, Mobile Actions */}
              <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                      <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-full w-10 h-10 p-0 hover:bg-white/10">
                        <ArrowLeft className="w-5 h-5"/>
                      </Button>
                      <div>
                          <h1 className="text-xl md:text-2xl font-black text-white leading-none tracking-tight">
                              {getPageTitle()}
                          </h1>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                              {t.browse.subtitle}
                          </p>
                      </div>
                  </div>
                  
                  {/* Desktop Quick Search Trigger (Visual Only) */}
                  <div className="hidden md:block">
                      <Button variant="outline" className="rounded-full border-slate-700 text-slate-400 gap-2 px-4 h-9" onClick={() => navigate('/search')}>
                          <Search className="w-3.5 h-3.5" /> <span>Search Library...</span>
                      </Button>
                  </div>
              </div>

              {/* Middle Row: Control Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Status Pills (Horizontal Scroll) */}
                  <div className="flex-1 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                      <div className="flex items-center gap-2">
                          {statusFilters.map(filter => {
                              const isActive = !selectedLetter && selectedGenres.length === 0 && currentStatus === filter.id;
                              return (
                                  <button
                                    key={filter.id}
                                    onClick={() => {
                                        setSearchParams({ status: filter.id });
                                        setPage(1); 
                                    }}
                                    className={`
                                        relative px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300
                                        ${isActive 
                                            ? 'text-white shadow-lg shadow-violet-900/20 bg-gradient-to-r from-violet-600 to-fuchsia-600' 
                                            : 'text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-transparent hover:border-white/10'
                                        }
                                    `}
                                  >
                                      {filter.label}
                                  </button>
                              )
                          })}
                      </div>
                  </div>

                  {/* Filter Buttons (Genre, A-Z) */}
                  <div className="flex items-center gap-2 shrink-0">
                      {/* Genre Toggle */}
                      <button 
                        onClick={() => setIsGenreMenuOpen(true)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all
                            ${selectedGenres.length > 0 
                                ? 'bg-violet-500/10 border-violet-500/50 text-violet-300' 
                                : 'bg-slate-800/50 border-white/5 text-slate-300 hover:bg-slate-800 hover:text-white'}
                        `}
                      >
                          <Tag className="w-4 h-4" />
                          <span>{t.browse.genres}</span>
                          {selectedGenres.length > 0 && (
                              <span className="flex items-center justify-center bg-violet-600 text-white text-[10px] w-5 h-5 rounded-full ml-1">
                                  {selectedGenres.length}
                              </span>
                          )}
                      </button>

                      {/* A-Z Toggle */}
                      <button 
                        onClick={() => setIsLetterMenuOpen(true)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all
                            ${selectedLetter 
                                ? 'bg-fuchsia-500/10 border-fuchsia-500/50 text-fuchsia-300' 
                                : 'bg-slate-800/50 border-white/5 text-slate-300 hover:bg-slate-800 hover:text-white'}
                        `}
                      >
                        <AlignLeft className="w-4 h-4" />
                        <span>{selectedLetter || 'A-Z'}</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                  </div>
              </div>

              {/* Active Filters Row (Dismissible Pills) */}
              {(selectedLetter || selectedGenres.length > 0) && (
                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-white/5 animate-fade-in">
                      <span className="text-xs font-bold text-slate-500 mr-2">Active:</span>
                      
                      {selectedLetter && (
                          <button 
                            onClick={() => removeFilter('letter')}
                            className="flex items-center gap-1 pl-3 pr-2 py-1 bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 rounded-lg text-xs font-bold hover:bg-fuchsia-500/30 transition-colors"
                          >
                              Letter: {selectedLetter} <X className="w-3 h-3" />
                          </button>
                      )}

                      {selectedGenres.map(gId => {
                          const gName = genres.find(g => g.id === gId)?.name || gId;
                          return (
                            <button 
                                key={gId}
                                onClick={() => removeFilter('genre', gId)}
                                className="flex items-center gap-1 pl-3 pr-2 py-1 bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-lg text-xs font-bold hover:bg-violet-500/30 transition-colors"
                            >
                                {gName} <X className="w-3 h-3" />
                            </button>
                          );
                      })}

                      <button onClick={clearAllFilters} className="text-xs text-slate-500 hover:text-white underline decoration-slate-700 ml-auto">
                          Clear All
                      </button>
                  </div>
              )}
          </div>
       </div>

       {/* --- Main Content Grid --- */}
       <div className="container mx-auto px-4 md:px-6 py-8">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Spinner />
                    <p className="text-slate-500 text-sm font-medium animate-pulse">Fetching anime data...</p>
                </div>
            ) : (
                <>
                    {animes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/5">
                            <div className="bg-slate-800 p-4 rounded-full mb-4">
                                <Search className="w-8 h-8 text-slate-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{t.browse.noResults}</h3>
                            <p className="text-slate-400 max-w-xs mx-auto">Try adjusting your filters or searching for something else.</p>
                            <Button variant="secondary" onClick={clearAllFilters} className="mt-6">Clear Filters</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                            {animes.map((anime, i) => (
                                <div key={`${anime.id}-${i}`} className="animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                                    <AnimeCard anime={anime} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination (Simple for now, relies on scroll-to-top effect) */}
                    {!selectedLetter && animes.length > 0 && (
                        <div className="flex justify-center items-center mt-16 gap-6">
                            <Button 
                                disabled={page === 1} 
                                onClick={() => setPage(p => p - 1)}
                                variant="secondary"
                                className="w-32 rounded-full"
                            >
                                {t.browse.prev}
                            </Button>
                            <span className="text-sm font-black text-slate-500 tracking-widest uppercase">Page {page}</span>
                            <Button 
                                onClick={() => setPage(p => p + 1)}
                                variant="secondary"
                                className="w-32 rounded-full"
                            >
                                {t.browse.next}
                            </Button>
                        </div>
                    )}
                </>
            )}
       </div>

       {/* --- Genre Modal/Drawer using Portal for Z-Index Safety --- */}
       {isGenreMenuOpen && createPortal(
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               {/* Backdrop */}
               <div 
                 className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity animate-fade-in" 
                 onClick={() => setIsGenreMenuOpen(false)} 
               />
               
               {/* Modal Content */}
               <div className="relative bg-[#0f172a] w-full max-w-5xl max-h-[85vh] rounded-3xl border border-white/10 shadow-2xl flex flex-col animate-scale-in overflow-hidden">
                   
                   {/* Modal Header */}
                   <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0f172a] z-10">
                       <h3 className="text-2xl font-black text-white flex items-center gap-3">
                           <Layers className="text-violet-500" /> Select Genres
                       </h3>
                       <button onClick={() => setIsGenreMenuOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                           <X className="w-6 h-6" />
                       </button>
                   </div>

                   {/* Modal Body - Scrollable */}
                   <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[#0f172a]">
                       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                           {genres.map(g => {
                               const isSelected = selectedGenres.includes(g.id);
                               return (
                                   <button
                                     key={g.id}
                                     onClick={() => toggleGenre(g.id)}
                                     className={`
                                        flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-bold transition-all
                                        ${isSelected 
                                            ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/40' 
                                            : 'bg-slate-800/50 border-white/5 text-slate-300 hover:bg-slate-800 hover:border-white/10 hover:text-white'
                                        }
                                     `}
                                   >
                                       {g.name}
                                       {isSelected && <div className="w-2 h-2 rounded-full bg-white shadow-sm" />}
                                   </button>
                               )
                           })}
                       </div>
                   </div>

                   {/* Modal Footer */}
                   <div className="p-6 border-t border-white/5 bg-slate-900/90 backdrop-blur-sm z-10 flex justify-between items-center">
                       <span className="text-slate-400 text-sm font-medium">{selectedGenres.length} selected</span>
                       <div className="flex gap-3">
                           {selectedGenres.length > 0 && (
                               <Button variant="ghost" onClick={() => { setSearchParams({ status: currentStatus }); setPage(1); }} className="text-slate-400 hover:text-white">
                                   Reset
                               </Button>
                           )}
                           <Button onClick={() => setIsGenreMenuOpen(false)} className="px-8 rounded-xl shadow-lg shadow-violet-900/20">
                               Apply Filters
                           </Button>
                       </div>
                   </div>
               </div>
           </div>,
           document.body
       )}

       {/* --- A-Z Modal using Portal --- */}
       {isLetterMenuOpen && createPortal(
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               {/* Backdrop */}
               <div 
                 className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity animate-fade-in" 
                 onClick={() => setIsLetterMenuOpen(false)} 
               />
               
               {/* Modal Content */}
               <div className="relative bg-[#0f172a] w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl flex flex-col animate-scale-in overflow-hidden">
                   <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0f172a]">
                       <h3 className="text-xl font-black text-white flex items-center gap-2">
                           <AlignLeft className="text-fuchsia-500" /> Sort by Letter
                       </h3>
                       <button onClick={() => setIsLetterMenuOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                           <X className="w-5 h-5" />
                       </button>
                   </div>
                   
                   <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar bg-[#0f172a]">
                        <div className="grid grid-cols-6 gap-2 sm:gap-3">
                            {letters.map(l => (
                                <button
                                    key={l}
                                    onClick={() => handleLetterSelect(l)}
                                    className={`aspect-square rounded-xl flex items-center justify-center font-bold text-lg transition-all
                                        ${selectedLetter === l 
                                            ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-900/40 scale-110' 
                                            : 'bg-slate-800/50 text-slate-400 border border-white/5 hover:bg-slate-700 hover:text-white hover:border-white/20'}
                                    `}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                   </div>
               </div>
           </div>,
           document.body
       )}

    </div>
  );
};