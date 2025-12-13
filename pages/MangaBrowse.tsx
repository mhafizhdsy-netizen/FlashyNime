import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { X, ArrowLeft, ChevronDown, Layers, Search, Tag } from 'lucide-react';
import { 
  getMangaList,
  getMangaProjects,
  getAllManga,
  getMangaGenres,
  getMangaByGenre
} from '../services/api';
import { Anime, Genre } from '../types';
import { MangaCard } from '../components/MangaCard';
import { Button, Spinner } from '../components/ui';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';

export const MangaBrowse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Data State
  const [mangas, setMangas] = useState<Anime[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{ hasNextPage: boolean } | null>(null);
  const [isGenreMenuOpen, setIsGenreMenuOpen] = useState(false);
  
  const { language } = useAppStore();
  const t = translations[language];
  
  // Derived Params
  const activeStatus = searchParams.get('status') || 'popular';
  const genreParam = searchParams.get('genre');
  
  const selectedGenres = genreParam ? genreParam.split(',').filter(Boolean) : [];

  const statusFilters = [
    { id: 'popular', label: t.browse.filters.popular, order: 'popular' },
    { id: 'recent', label: t.browse.filters.latest, order: 'update' },
    { id: 'new', label: "New Releases", order: 'new' },
    { id: 'ongoing', label: t.browse.filters.ongoing, order: 'ongoing' },
    { id: 'completed', label: t.browse.filters.completed, order: 'completed' },
    { id: 'projects', label: t.manga.projects },
    { id: 'all', label: "All" }
  ];

  useEffect(() => {
    getMangaGenres().then(res => setGenres(res.genres || []));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let res: any;
        const activeFilter = statusFilters.find(f => f.id === activeStatus) || statusFilters[0];
        
        if (selectedGenres.length > 0) {
           const slug = selectedGenres[0]; 
           res = await getMangaByGenre(slug, page);
        } else {
            if (activeStatus === 'projects') {
                res = await getMangaProjects(page);
            } else if (activeStatus === 'all') {
                res = await getAllManga(page);
            } else {
                res = await getMangaList(activeFilter.order || 'popular', page);
            }
        }
        
        if (res) {
          const list = res.list || res.projects || [];
          setMangas(list);
          setPagination(res.pagination || null);
        }

      } catch (err) {
        console.error(err);
        setMangas([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (page === 1) window.scrollTo(0, 0);
    
    fetchData();
  }, [activeStatus, genreParam, page]);

  const toggleGenre = (genreId: string) => {
    const nextGenres = genreId === selectedGenres[0] ? '' : genreId;
    
    const newParams: any = {};
    if (nextGenres) {
        newParams.genre = nextGenres;
    } else {
        newParams.status = activeStatus;
    }
    
    setSearchParams(newParams);
    setPage(1);
    setIsGenreMenuOpen(false);
  };

  const clearAllFilters = () => {
    setSearchParams({ status: 'popular' });
    setPage(1);
  };

  const removeFilter = (type: 'genre', value?: string) => {
      if (type === 'genre') {
          toggleGenre(value || '');
      }
      setPage(1);
  };

  const getPageTitle = () => {
    if (selectedGenres.length > 0) {
        const genreName = genres.find(g => g.id === selectedGenres[0])?.name || selectedGenres[0];
        return `${genreName} Manga`;
    }
    const activeFilterObj = statusFilters.find(f => f.id === activeStatus);
    return activeFilterObj ? activeFilterObj.label : t.manga.library;
  };

  return (
    <div className="min-h-screen bg-[#020617] pb-20">
       <div className="relative z-30 bg-[#020617] border-b border-white/5 pt-20 md:pt-24 pb-4">
          <div className="container mx-auto px-4 md:px-6">
              
              <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                      <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-full w-10 h-10 p-0 hover:bg-white/10">
                        <ArrowLeft className="w-5 h-5"/>
                      </Button>
                      <div>
                          <h1 className="text-xl md:text-2xl font-black text-white leading-none tracking-tight capitalize">
                              {getPageTitle()}
                          </h1>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                              {t.manga.explore}
                          </p>
                      </div>
                  </div>
                  
                  <div className="hidden md:block">
                      <Button variant="outline" className="rounded-full border-slate-700 text-slate-400 gap-2 px-4 h-9" onClick={() => navigate('/search')}>
                          <Search className="w-3.5 h-3.5" /> <span>Search Library...</span>
                      </Button>
                  </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                      <div className="flex items-center gap-2">
                          {statusFilters.map(filter => {
                              const isActive = selectedGenres.length === 0 && activeStatus === filter.id;
                              return (
                                  <button
                                    key={filter.id}
                                    onClick={() => {
                                        const newParams: any = { status: filter.id };
                                        setSearchParams(newParams);
                                        setPage(1);
                                    }}
                                    className={`
                                        relative px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300
                                        ${isActive 
                                            ? 'text-white shadow-lg shadow-rose-900/20 bg-gradient-to-r from-rose-600 to-pink-600' 
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

                  <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => setIsGenreMenuOpen(true)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all
                            ${selectedGenres.length > 0 
                                ? 'bg-rose-500/10 border-rose-500/50 text-rose-300' 
                                : 'bg-slate-800/50 border-white/5 text-slate-300 hover:bg-slate-800 hover:text-white'}
                        `}
                      >
                          <Tag className="w-4 h-4" />
                          <span>{t.browse.genres}</span>
                          {selectedGenres.length > 0 && (
                              <span className="flex items-center justify-center bg-rose-600 text-white text-[10px] w-5 h-5 rounded-full ml-1">
                                  {selectedGenres.length}
                              </span>
                          )}
                      </button>
                  </div>
              </div>

              {selectedGenres.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-white/5 animate-fade-in">
                      <span className="text-xs font-bold text-slate-500 mr-2">Active:</span>
                      {selectedGenres.map(gId => {
                          const gName = genres.find(g => g.id === gId)?.name || gId;
                          return (
                            <button 
                                key={gId}
                                onClick={() => removeFilter('genre', gId)}
                                className="flex items-center gap-1 pl-3 pr-2 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-bold hover:bg-rose-500/30 transition-colors"
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

       <div className="container mx-auto px-4 md:px-6 py-8">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Spinner />
                    <p className="text-slate-500 text-sm font-medium animate-pulse">Fetching manga data...</p>
                </div>
            ) : (
                <>
                    {mangas.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/5">
                            <div className="bg-slate-800 p-4 rounded-full mb-4">
                                <Search className="w-8 h-8 text-slate-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{t.browse.noResults}</h3>
                            <p className="text-slate-400 max-w-xs mx-auto">No manga found matching your criteria.</p>
                            <Button variant="secondary" onClick={clearAllFilters} className="mt-6">Clear Filters</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                            {mangas.map((manga, i) => (
                                <div key={`${manga.id}-${i}`} className="animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                                    <MangaCard manga={manga} />
                                </div>
                            ))}
                        </div>
                    )}

                    {mangas.length > 0 && (
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
                                disabled={!pagination?.hasNextPage}
                            >
                                {t.browse.next}
                            </Button>
                        </div>
                    )}
                </>
            )}
       </div>

       {isGenreMenuOpen && createPortal(
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <div 
                 className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity animate-fade-in" 
                 onClick={() => setIsGenreMenuOpen(false)} 
               />
               <div className="relative bg-[#0f172a] w-full max-w-5xl max-h-[85vh] rounded-3xl border border-white/10 shadow-2xl flex flex-col animate-scale-in overflow-hidden">
                   <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0f172a] z-10">
                       <h3 className="text-2xl font-black text-white flex items-center gap-3">
                           <Layers className="text-rose-500" /> Select Genre
                       </h3>
                       <button onClick={() => setIsGenreMenuOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                           <X className="w-6 h-6" />
                       </button>
                   </div>
                   <div className="p-6 overflow-y-auto custom-scrollbar scroll-mask-y flex-1 bg-[#0f172a]">
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
                                            ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-900/40' 
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
               </div>
           </div>,
           document.body
       )}
    </div>
  );
};