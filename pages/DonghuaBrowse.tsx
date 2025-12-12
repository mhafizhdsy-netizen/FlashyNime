
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Filter, X, ArrowLeft, Calendar, ChevronDown, Layers, Search, Tag } from 'lucide-react';
import { 
  getDonghuaOngoing, 
  getDonghuaCompleted, 
  getDonghuaLatest,
  getDonghuaGenres,
  getDonghuaByGenre,
  getDonghuaSeasons,
} from '../services/api';
import { Anime, Genre } from '../types';
import { AnimeCard } from '../components/AnimeCard';
import { Button, Spinner } from '../components/ui';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';

export const DonghuaBrowse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Data State
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isGenreMenuOpen, setIsGenreMenuOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  
  const { language } = useAppStore();
  const t = translations[language];
  
  // Derived Params
  const activeStatus = searchParams.get('status') || 'latest';
  const genreParam = searchParams.get('genre');
  const yearParam = searchParams.get('year');
  
  const selectedGenres = genreParam ? genreParam.split(',').filter(Boolean) : [];
  const selectedYear = yearParam || new Date().getFullYear().toString();

  const statusFilters = [
    { id: 'latest', label: t.browse.filters.latest },
    { id: 'ongoing', label: t.browse.filters.ongoing },
    { id: 'completed', label: t.browse.filters.completed },
    { id: 'seasons', label: t.browse.filters.seasons }
  ];

  const years = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];

  useEffect(() => {
    getDonghuaGenres().then(res => setGenres(res.genres || []));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let results: Anime[] = [];
        
        // Priority 1: Seasons/Year Filter
        if (activeStatus === 'seasons') {
            const res = await getDonghuaSeasons(selectedYear);
            if (res.data) results = res.data;
            
        // Priority 2: Genre Filter
        } else if (selectedGenres.length > 0) {
           const promises = selectedGenres.map(id => getDonghuaByGenre(id, page));
           const responses = await Promise.all(promises);
           
           let combined: Anime[] = [];
           responses.forEach(res => {
             if (res.genre_anime) {
                combined = [...combined, ...res.genre_anime];
             }
           });

           // Deduplicate
           const uniqueMap = new Map();
           combined.forEach(item => {
             if (!uniqueMap.has(item.id)) uniqueMap.set(item.id, item);
           });
           results = Array.from(uniqueMap.values());

        // Priority 3: Standard Status Filter
        } else {
           let res: any;
           switch (activeStatus) {
             case 'ongoing':
               res = await getDonghuaOngoing(page);
               if (res.ongoing) results = res.ongoing;
               break;
             case 'completed':
               res = await getDonghuaCompleted(page);
               if (res.completed) results = res.completed;
               break;
             case 'latest':
             default:
               res = await getDonghuaLatest(page);
               if (res.latest) results = res.latest;
               break;
           }
        }
        setAnimes(results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    // Scroll to top when filter changes
    if (page === 1) window.scrollTo(0, 0);
    
    fetchData();
  }, [activeStatus, genreParam, page, selectedYear]);

  // -- Handlers --

  const toggleGenre = (genreId: string) => {
    // If we are in 'seasons' mode, switching to genres should reset to 'latest' to avoid confusion, 
    // or just let genres override status. Let's make genres override status to 'latest' contextually implies general browse.
    // However, best UX is just to clear 'seasons' status.
    const current = new Set(selectedGenres);
    if (current.has(genreId)) current.delete(genreId);
    else current.add(genreId);
    
    const nextGenres = Array.from(current).join(',');
    
    const newParams: any = {};
    if (nextGenres) {
        newParams.genre = nextGenres;
        // If we were on seasons, we might want to switch off it, or keep it?
        // The API `getDonghuaByGenre` doesn't filter by year. So we should probably reset status to 'latest' (default view)
        if (activeStatus === 'seasons') newParams.status = 'latest';
        else newParams.status = activeStatus;
    } else {
        newParams.status = activeStatus;
        if (activeStatus === 'seasons') newParams.year = selectedYear;
    }
    
    setSearchParams(newParams);
    setPage(1);
  };

  const handleYearChange = (year: string) => {
      setSearchParams({ status: 'seasons', year: year });
      setIsYearDropdownOpen(false);
      setPage(1);
  };

  const clearAllFilters = () => {
    setSearchParams({ status: 'latest' });
    setPage(1);
  };

  const removeFilter = (type: 'year' | 'genre', value?: string) => {
      if (type === 'year') {
          setSearchParams({ status: 'latest' });
      } else if (type === 'genre' && value) {
          toggleGenre(value);
      }
      setPage(1);
  };

  const getPageTitle = () => {
    if (activeStatus === 'seasons') return `Donghua: ${selectedYear}`;
    if (selectedGenres.length > 0) return `${selectedGenres.length} Genres`;
    const activeFilterObj = statusFilters.find(f => f.id === activeStatus);
    return activeFilterObj ? activeFilterObj.label : t.donghua.library;
  };

  return (
    <div className="min-h-screen bg-[#020617] pb-20">
       
       {/* --- Header & Filters (Static/Relative) --- */}
       <div className="relative z-40 bg-[#020617] border-b border-white/5 pt-20 md:pt-24 pb-4">
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
                              {t.donghua.explore}
                          </p>
                      </div>
                  </div>
                  
                  {/* Desktop Quick Search Trigger */}
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
                              // Active state logic:
                              // If filter is 'seasons', it's active if activeStatus is seasons.
                              // If filter is others, it's active if activeStatus matches AND no genres selected.
                              const isActive = filter.id === 'seasons' 
                                ? activeStatus === 'seasons'
                                : activeStatus === filter.id && selectedGenres.length === 0;

                              return (
                                  <button
                                    key={filter.id}
                                    onClick={() => {
                                        const newParams: any = { status: filter.id };
                                        if (filter.id === 'seasons') newParams.year = selectedYear;
                                        setSearchParams(newParams);
                                        setPage(1);
                                    }}
                                    className={`
                                        relative px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300
                                        ${isActive 
                                            ? 'text-white shadow-lg shadow-fuchsia-900/20 bg-gradient-to-r from-fuchsia-600 to-violet-600' 
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

                  {/* Filter Buttons (Genre, Year) */}
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

                      {/* Year Toggle */}
                      <div className="relative">
                        <button 
                            onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all
                                ${activeStatus === 'seasons'
                                    ? 'bg-fuchsia-500/10 border-fuchsia-500/50 text-fuchsia-300' 
                                    : 'bg-slate-800/50 border-white/5 text-slate-300 hover:bg-slate-800 hover:text-white'}
                            `}
                        >
                            <Calendar className="w-4 h-4" />
                            <span>{activeStatus === 'seasons' ? selectedYear : t.donghua.year}</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isYearDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Year Dropdown */}
                        {isYearDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsYearDropdownOpen(false)}/>
                                <div className="absolute right-0 top-full mt-2 w-[180px] bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl p-2 z-20 animate-scale-in origin-top-right max-h-60 overflow-y-auto custom-scrollbar">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 pl-2 pt-2">Select Year</h4>
                                    <div className="space-y-1">
                                        {years.map(y => (
                                            <button
                                                key={y}
                                                onClick={() => handleYearChange(y)}
                                                className={`w-full text-left px-4 py-2 rounded-lg font-bold text-sm transition-all
                                                    ${selectedYear === y && activeStatus === 'seasons'
                                                        ? 'bg-fuchsia-600 text-white shadow-lg' 
                                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                                                `}
                                            >
                                                {y}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                      </div>
                  </div>
              </div>

              {/* Active Filters Row */}
              {(activeStatus === 'seasons' || selectedGenres.length > 0) && (
                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-white/5 animate-fade-in">
                      <span className="text-xs font-bold text-slate-500 mr-2">Active:</span>
                      
                      {activeStatus === 'seasons' && (
                          <button 
                            onClick={() => removeFilter('year')}
                            className="flex items-center gap-1 pl-3 pr-2 py-1 bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 rounded-lg text-xs font-bold hover:bg-fuchsia-500/30 transition-colors"
                          >
                              Year: {selectedYear} <X className="w-3 h-3" />
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
                    <p className="text-slate-500 text-sm font-medium animate-pulse">Fetching donghua data...</p>
                </div>
            ) : (
                <>
                    {animes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/5">
                            <div className="bg-slate-800 p-4 rounded-full mb-4">
                                <Search className="w-8 h-8 text-slate-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{t.browse.noResults}</h3>
                            <p className="text-slate-400 max-w-xs mx-auto">No donghua found for {activeStatus === 'seasons' ? `year ${selectedYear}` : 'this selection'}.</p>
                            <Button variant="secondary" onClick={clearAllFilters} className="mt-6">Clear Filters</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                            {animes.map((anime, i) => (
                                <div key={`${anime.id}-${i}`} className="animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                                    <AnimeCard anime={anime} isDonghua={true} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination - Hide if Seasons/Genres active as APIs might differ or return full lists */}
                    {activeStatus !== 'seasons' && animes.length > 0 && (
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

       {/* --- Genre Modal using Portal --- */}
       {isGenreMenuOpen && createPortal(
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <div 
                 className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity animate-fade-in" 
                 onClick={() => setIsGenreMenuOpen(false)} 
               />
               <div className="relative bg-[#0f172a] w-full max-w-5xl max-h-[85vh] rounded-3xl border border-white/10 shadow-2xl flex flex-col animate-scale-in overflow-hidden">
                   
                   <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0f172a] z-10">
                       <h3 className="text-2xl font-black text-white flex items-center gap-3">
                           <Layers className="text-fuchsia-500" /> Select Genres
                       </h3>
                       <button onClick={() => setIsGenreMenuOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                           <X className="w-6 h-6" />
                       </button>
                   </div>

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
                                            ? 'bg-fuchsia-600 border-fuchsia-500 text-white shadow-lg shadow-fuchsia-900/40' 
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

                   <div className="p-6 border-t border-white/5 bg-slate-900/90 backdrop-blur-sm z-10 flex justify-between items-center">
                       <span className="text-slate-400 text-sm font-medium">{selectedGenres.length} selected</span>
                       <div className="flex gap-3">
                           {selectedGenres.length > 0 && (
                               <Button variant="ghost" onClick={clearAllFilters} className="text-slate-400 hover:text-white">
                                   Reset
                               </Button>
                           )}
                           <Button onClick={() => setIsGenreMenuOpen(false)} className="px-8 rounded-xl shadow-lg shadow-fuchsia-900/20 bg-gradient-to-r from-fuchsia-600 to-violet-600 border-none">
                               Apply Filters
                           </Button>
                       </div>
                   </div>
               </div>
           </div>,
           document.body
       )}

    </div>
  );
};
