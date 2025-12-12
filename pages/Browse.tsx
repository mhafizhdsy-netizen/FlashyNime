
import React, { useEffect, useState } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { Filter, X, ArrowLeft } from 'lucide-react';
import { 
  getOngoingAnime, 
  getCompleteAnime, 
  getMovies, 
  getPopularAnime, 
  getLatestEpisodes,
  getAnimeByGenre, 
  getGenres,
  normalizeAnime 
} from '../services/api';
import { Anime, Genre } from '../types';
import { AnimeCard } from '../components/AnimeCard';
import { Button, Spinner, Badge } from '../components/ui';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';

export const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [page, setPage] = useState(1);
  const { language } = useAppStore();
  const t = translations[language];
  
  // Determine active status based on URL param or Route path
  const getActiveStatus = () => {
    const paramStatus = searchParams.get('status');
    if (paramStatus) return paramStatus;
    if (location.pathname === '/popular') return 'popular';
    if (location.pathname === '/movies') return 'movies';
    return 'popular'; // Default
  };

  const activeStatus = getActiveStatus();
  // Support multiple genres comma-separated
  const genreParam = searchParams.get('genre');
  const selectedGenres = genreParam ? genreParam.split(',').filter(Boolean) : [];

  // Filter definitions
  const filters = [
    { id: 'popular', label: t.browse.filters.popular },
    { id: 'recent', label: t.browse.filters.recent },
    { id: 'ongoing', label: t.browse.filters.ongoing },
    { id: 'completed', label: t.browse.filters.completed },
    { id: 'movies', label: t.browse.filters.movies }
  ];

  useEffect(() => {
    // Fetch all genres
    getGenres().then(res => setGenres(res.genres || []));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let results: Anime[] = [];
        
        // Priority: Genre (Multi-select OR logic) -> Status
        if (selectedGenres.length > 0) {
           // Fetch all selected genres in parallel
           const promises = selectedGenres.map(id => getAnimeByGenre(id, page));
           const responses = await Promise.all(promises);
           
           // Combine results
           let combined: Anime[] = [];
           responses.forEach(res => {
             if (res.genre_anime) {
                // Since API returns normalized, we can use directly, 
                // but mapping again is safe due to idempotency if types mix
                combined = [...combined, ...res.genre_anime.map(normalizeAnime)];
             }
           });

           // Deduplicate based on ID (OR logic)
           const uniqueMap = new Map();
           combined.forEach(item => {
             if (!uniqueMap.has(item.id)) {
               uniqueMap.set(item.id, item);
             }
           });
           results = Array.from(uniqueMap.values());

        } else {
           let res: any;
           switch (activeStatus) {
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
        setAnimes(results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeStatus, genreParam, page]); // Depend on genreParam string

  const toggleGenre = (genreId: string) => {
    const current = new Set(selectedGenres);
    if (current.has(genreId)) {
        current.delete(genreId);
    } else {
        current.add(genreId);
    }
    
    const nextGenres = Array.from(current).join(',');
    
    if (nextGenres) {
        setSearchParams({ genre: nextGenres });
    } else {
        // If no genres left, revert to current status view
        setSearchParams({ status: activeStatus });
    }
    setPage(1);
  };

  const clearGenres = () => {
    setSearchParams({ status: activeStatus });
    setPage(1);
  };

  const getPageTitle = () => {
    if (selectedGenres.length > 0) {
      if (selectedGenres.length === 1) {
        const g = genres.find(x => x.id === selectedGenres[0]);
        return `Genre: ${g ? g.name : selectedGenres[0]}`;
      }
      return `${selectedGenres.length} Genres Selected`;
    }
    return t.browse.title;
  };

  return (
    <div className="min-h-screen bg-[#020617] pt-28 px-6 pb-20">
       <div className="container mx-auto">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 pl-0 hover:pl-2 transition-all text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5 mr-2"/> {t.watch.goBack}
          </Button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 animate-fade-in-up">
             <div>
               <h1 className="text-4xl font-black text-white capitalize mb-2">
                 {getPageTitle()}
               </h1>
               <p className="text-slate-400">{t.browse.subtitle}</p>
             </div>
             
             <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 md:pb-0 scrollbar-hide p-1">
                {filters.map(filter => (
                  <Button 
                    key={filter.id}
                    variant={activeStatus === filter.id && selectedGenres.length === 0 ? 'primary' : 'secondary'}
                    onClick={() => {
                        setSearchParams({ status: filter.id });
                        setPage(1); // Reset page on filter change
                    }}
                    className="capitalize rounded-full px-6 whitespace-nowrap"
                  >
                    {filter.label}
                  </Button>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
             {/* Sidebar Filters */}
             <div className="hidden md:block space-y-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <div className="glass-panel p-6 rounded-2xl sticky top-28">
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
                </div>
             </div>

             {/* Grid */}
             <div className="col-span-1 md:col-span-3">
                {loading ? (
                   <div className="flex justify-center py-20"><Spinner /></div>
                ) : (
                   <>
                      {animes.length === 0 ? (
                         <div className="text-center py-20 text-slate-500">{t.browse.noResults}</div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                           {animes.map((anime, i) => (
                              <AnimeCard key={`${anime.id}-${i}`} anime={anime} />
                           ))}
                        </div>
                      )}
                      
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
                   </>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};
