
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, X, ArrowLeft, Calendar, ChevronDown } from 'lucide-react';
import { 
  getDonghuaOngoing, 
  getDonghuaCompleted, 
  getDonghuaLatest,
  getDonghuaGenres,
  getDonghuaByGenre,
  getDonghuaSeasons,
  normalizeDonghua 
} from '../services/api';
import { Anime, Genre } from '../types';
import { AnimeCard } from '../components/AnimeCard';
import { Button, Spinner, Badge } from '../components/ui';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';

export const DonghuaBrowse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [page, setPage] = useState(1);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const { language } = useAppStore();
  const t = translations[language];
  
  const activeStatus = searchParams.get('status') || 'latest';
  const genreParam = searchParams.get('genre');
  const yearParam = searchParams.get('year');
  const selectedGenres = genreParam ? genreParam.split(',').filter(Boolean) : [];

  const [selectedYear, setSelectedYear] = useState<string>(yearParam || new Date().getFullYear().toString());

  const filters = [
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
    if (activeStatus === 'seasons') {
      if (yearParam) setSelectedYear(yearParam);
    }
  }, [yearParam, activeStatus]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let results: Anime[] = [];
        
        if (activeStatus === 'seasons') {
            const res = await getDonghuaSeasons(selectedYear);
            if (res.data) results = res.data;
        } else if (selectedGenres.length > 0) {
           const promises = selectedGenres.map(id => getDonghuaByGenre(id, page));
           const responses = await Promise.all(promises);
           
           let combined: Anime[] = [];
           responses.forEach(res => {
             if (res.genre_anime) {
                combined = [...combined, ...res.genre_anime];
             }
           });

           const uniqueMap = new Map();
           combined.forEach(item => {
             if (!uniqueMap.has(item.id)) uniqueMap.set(item.id, item);
           });
           results = Array.from(uniqueMap.values());

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
    fetchData();
  }, [activeStatus, genreParam, page, selectedYear]);

  const toggleGenre = (genreId: string) => {
    if (activeStatus === 'seasons') {
        setSearchParams({ status: 'latest', genre: genreId });
        return;
    }
    const current = new Set(selectedGenres);
    if (current.has(genreId)) current.delete(genreId);
    else current.add(genreId);
    
    const nextGenres = Array.from(current).join(',');
    
    if (nextGenres) setSearchParams({ genre: nextGenres });
    else setSearchParams({ status: activeStatus });
    setPage(1);
  };

  const clearGenres = () => {
    setSearchParams({ status: activeStatus });
    setPage(1);
  };

  const handleYearChange = (year: string) => {
      setSelectedYear(year);
      setSearchParams({ status: 'seasons', year: year });
      setIsYearDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] pt-28 px-6 pb-20">
       <div className="container mx-auto">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 pl-0 hover:pl-2 transition-all text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5 mr-2"/> {t.watch.goBack}
          </Button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 animate-fade-in-up">
             <div>
               <h1 className="text-4xl font-black text-white capitalize mb-2">
                 {t.donghua.library}
               </h1>
               <p className="text-slate-400">{t.donghua.explore}</p>
             </div>
             
             <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 md:pb-0 scrollbar-hide p-1">
                {filters.map(filter => (
                  <Button 
                    key={filter.id}
                    variant={activeStatus === filter.id && selectedGenres.length === 0 ? 'primary' : 'secondary'}
                    onClick={() => {
                        const newParams: any = { status: filter.id };
                        if (filter.id === 'seasons') newParams.year = selectedYear;
                        setSearchParams(newParams);
                        setPage(1);
                    }}
                    className="capitalize rounded-full px-6 whitespace-nowrap"
                  >
                    {filter.label}
                  </Button>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
             <div className="hidden md:block space-y-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <div className="glass-panel p-6 rounded-2xl sticky top-28">
                   
                   {activeStatus === 'seasons' ? (
                       <div className="mb-6">
                           <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                                <Calendar className="w-5 h-5 text-violet-500" /> {t.donghua.seasonsInfo}
                           </h3>
                           <p className="text-sm text-slate-400 mb-4">
                               {t.donghua.browseYear} <strong>{selectedYear}</strong>.
                           </p>
                           <p className="text-xs text-slate-500">
                               {t.donghua.selectYear}
                           </p>
                       </div>
                   ) : (
                       <>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Filter className="w-5 h-5 text-violet-500" /> {t.browse.genres}
                            </h3>
                            {selectedGenres.length > 0 && (
                            <button onClick={clearGenres} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                                <X className="w-3 h-3" /> {t.browse.clear}
                            </button>
                            )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                            {genres.map(g => {
                                const isSelected = selectedGenres.includes(g.id);
                                return (
                                <Badge 
                                    key={g.id} 
                                    variant={isSelected ? "default" : "outline"}
                                    className={`cursor-pointer transition-all px-3 py-1.5 select-none ${
                                    isSelected 
                                        ? 'bg-violet-600 border-violet-600 text-white hover:bg-violet-700' 
                                        : 'text-slate-400 border-slate-700 hover:border-violet-500 hover:text-violet-400'
                                    }`}
                                    onClick={() => toggleGenre(g.id)}
                                >
                                    {g.name}
                                </Badge>
                                );
                            })}
                        </div>
                       </>
                   )}
                </div>
             </div>

             <div className="col-span-1 md:col-span-3">
                {/* Year Dropdown Filter for Seasons View */}
                {activeStatus === 'seasons' && (
                  <div className="mb-8 animate-fade-in-up relative z-20">
                     <div className="relative inline-block text-left">
                        <button 
                            type="button" 
                            className="inline-flex justify-between items-center min-w-[140px] rounded-xl border border-white/10 shadow-lg px-4 py-2.5 bg-slate-800 text-sm font-bold text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-violet-500 transition-all"
                            onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                        >
                            {t.donghua.year}: {selectedYear}
                            <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isYearDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isYearDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsYearDropdownOpen(false)}></div>
                                <div 
                                    className="origin-top-left absolute left-0 mt-2 w-48 rounded-xl shadow-xl bg-[#0f172a] ring-1 ring-black ring-opacity-5 border border-white/10 max-h-60 overflow-y-auto custom-scrollbar z-20 animate-fade-in" 
                                >
                                    <div className="py-1">
                                        {years.map((y) => (
                                            <button
                                                key={y}
                                                className={`${selectedYear === y ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'} block px-4 py-2.5 text-sm font-medium w-full text-left transition-colors`}
                                                onClick={() => handleYearChange(y)}
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
                )}

                {loading ? (
                   <div className="flex justify-center py-20"><Spinner /></div>
                ) : (
                   <>
                      {animes.length === 0 ? (
                         <div className="text-center py-20 text-slate-500">No donghua found for {selectedYear}.</div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                           {animes.map((anime, i) => (
                              <AnimeCard key={`${anime.id}-${i}`} anime={anime} isDonghua={true} />
                           ))}
                        </div>
                      )}
                      
                      {activeStatus !== 'seasons' && (
                          <div className="flex justify-center mt-16 gap-4">
                             <Button 
                               disabled={page === 1} 
                               onClick={() => setPage(p => p - 1)}
                               variant="secondary"
                               className="w-32"
                             >
                               {t.browse.prev}
                             </Button>
                             <span className="flex items-center text-slate-400 font-medium px-4 bg-white/5 rounded-xl">{t.browse.page} {page}</span>
                             <Button 
                               onClick={() => setPage(p => p + 1)}
                               variant="secondary"
                               className="w-32"
                             >
                               {t.browse.next}
                             </Button>
                          </div>
                      )}
                   </>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};
