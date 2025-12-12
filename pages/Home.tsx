import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, RefreshCw, WifiOff, Flame, Clock, Film, Trophy, Star } from 'lucide-react';
import { getHome, normalizeAnime } from '../services/api';
import { Anime } from '../types';
import { AnimeCard } from '../components/AnimeCard';
import { HeroCarousel } from '../components/HeroCarousel';
import { Button, Spinner } from '../components/ui';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';

// Section component
const Section = ({ title, icon: Icon, link, items, isDonghua = false, color = "violet", viewAllText }: { title: string, icon?: any, link: string, items: Anime[], isDonghua?: boolean, color?: string, viewAllText: string }) => {
  if (!items || items.length === 0) return null;
  return (
    <section className="py-8 md:py-12 animate-fade-in-up">
      <div className="container mx-auto px-6 mb-6 flex items-center justify-between">
        <div className="space-y-1">
           <h2 className="text-xl md:text-3xl font-bold text-white flex items-center gap-2 md:gap-3">
             <div className={`p-1.5 md:p-2 rounded-lg bg-${color}-500/10 border border-${color}-500/20`}>
                {Icon && <Icon className={`w-5 h-5 md:w-6 md:h-6 text-${color}-500`} />}
             </div>
             {title}
           </h2>
        </div>
        <Link to={link} className={`group flex items-center gap-1 text-xs md:text-sm font-bold text-${color}-400 hover:text-${color}-300 transition-colors`}>
            {viewAllText} <ChevronRight className="w-3 h-3 md:w-4 md:h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {items.slice(0, 12).map((anime, idx) => (
            <div key={`${anime.id}-${idx}`} style={{ animationDelay: `${idx * 50}ms` }} className="animate-scale-in">
                <AnimeCard anime={anime} isDonghua={isDonghua} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Top10Section = ({ items, t }: { items: Anime[], t: any }) => {
  if (!items || items.length === 0) return null;

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-amber-500'; // Gold
    if (rank === 2) return 'from-slate-300 to-slate-500'; // Silver
    if (rank === 3) return 'from-amber-600 to-orange-700'; // Bronze
    return 'from-slate-600 to-slate-800'; // Default
  };

  const getRankStrokeColor = (rank: number) => {
    if (rank === 1) return 'rgba(250, 204, 21, 0.2)';
    if (rank === 2) return 'rgba(203, 213, 225, 0.2)';
    if (rank === 3) return 'rgba(217, 119, 6, 0.2)';
    return 'rgba(71, 85, 105, 0.2)';
  };
  
  return (
    <section className="py-8 md:py-16 bg-gradient-to-b from-[#020617] via-slate-900/50 to-[#020617] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-violet-900/30 rounded-full blur-3xl opacity-50 z-0"/>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-8 text-center md:text-left">
           <h2 className="text-3xl md:text-4xl font-black text-white mb-2 flex items-center justify-center md:justify-start gap-3">
             <Trophy className="w-8 h-8 text-yellow-400" />
             <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-orange-400">
               {t.home.top10Ranking}
             </span>
           </h2>
           <p className="text-slate-400 font-medium">{t.home.top10Desc}</p>
        </div>

        {/* Scroll Container */}
        <div className="flex overflow-x-auto gap-4 md:gap-8 pb-8 snap-x scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0 mask-image-lr">
            {items.map((anime, index) => {
                const rank = anime.rank || index + 1;
                const rankColor = getRankColor(rank);
                const strokeColor = getRankStrokeColor(rank);

                return (
                  <Link 
                    to={`/anime/${anime.id}`} 
                    key={anime.id} 
                    className="group relative flex-shrink-0 w-[200px] h-[280px] md:w-[240px] md:h-[340px] snap-center transition-transform duration-300 ease-out md:hover:-translate-y-2"
                  >
                    {/* Giant Rank Number (Behind) */}
                    <div 
                      className="absolute -left-4 -bottom-4 md:-left-8 md:-bottom-8 z-0 text-[160px] md:text-[220px] leading-none font-black tracking-tighter text-transparent bg-clip-text transition-all duration-300 group-hover:scale-110"
                      style={{
                        backgroundImage: `linear-gradient(to top, ${getRankColor(rank).split(' ')[1].replace('to-', '')}, ${getRankColor(rank).split(' ')[0].replace('from-', '')})`,
                        WebkitTextStroke: `4px ${strokeColor}`
                      }}
                    >
                      {rank}
                    </div>

                    {/* Card Content */}
                    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-slate-900 ring-1 ring-white/5 transition-all duration-300 group-hover:ring-2 group-hover:shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                      <img 
                        src={anime.poster} 
                        alt={anime.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                      
                      {/* Rank Badge */}
                      <div className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-bold text-white rounded-md border border-white/10 backdrop-blur-md bg-gradient-to-br ${rankColor}`}>
                        Rank #{rank}
                      </div>

                      {/* Info at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-bold text-white text-base leading-tight line-clamp-2 mb-1 group-hover:text-yellow-300 transition-colors">
                            {anime.title}
                        </h3>
                        {anime.rating && anime.rating !== 'N/A' && (
                            <div className="flex items-center gap-1 text-xs text-yellow-400 font-bold">
                               <Star className="w-3 h-3 fill-current" /> {anime.rating}
                            </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
            })}
        </div>
      </div>
    </section>
  );
};

export const Home = () => {
  const [recent, setRecent] = useState<Anime[]>([]);
  const [popular, setPopular] = useState<Anime[]>([]);
  const [movies, setMovies] = useState<Anime[]>([]);
  const [top10, setTop10] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const { language } = useAppStore();
  const t = translations[language];

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const homeData = await getHome();
      
      if (homeData && homeData.home) {
        setRecent(homeData.home.recent || []);
        setPopular(homeData.home.popular || []);
        setMovies(homeData.home.movies || []);
        setTop10(homeData.home.top10 || []);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [retryCount]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const hasContent = recent.length > 0 || popular.length > 0 || movies.length > 0;

  if (error && !hasContent) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900/50 p-10 rounded-3xl border border-slate-800 text-center max-w-md backdrop-blur-xl">
          <WifiOff className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-2">{t.home.connectionLost}</h2>
          <p className="text-slate-400 mb-8">{t.home.unableToReach}</p>
          <Button onClick={() => setRetryCount(c => c + 1)} className="gap-2 w-full h-12 text-lg">
            <RefreshCw className="w-5 h-5" /> {t.home.retry}
          </Button>
        </div>
      </div>
    );
  }

  const heroItems = recent.length > 0 ? recent.slice(0, 8) : popular.slice(0, 8);

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-20 pt-24 md:pt-28">
      {heroItems.length > 0 && <HeroCarousel featured={heroItems} />}
      
      <div className="space-y-4 relative z-20 -mt-8 md:-mt-12">
         <div className="bg-gradient-to-b from-[#020617]/0 via-[#020617] to-[#020617] pt-12">
            
            <Section title={t.home.popular} icon={Flame} link="/browse?status=popular" items={popular} color="orange" viewAllText={t.home.viewAll} />
            <Section title={t.home.latest} icon={Clock} link="/browse?status=recent" items={recent} color="blue" viewAllText={t.home.viewAll} />
            <Section title={t.home.movies} icon={Film} link="/browse?status=movies" items={movies} color="emerald" viewAllText={t.home.viewAll} />

            {/* Top 10 Ranking Section */}
            {top10.length > 0 && <Top10Section items={top10} t={t} />}
            
         </div>
      </div>
    </div>
  );
};