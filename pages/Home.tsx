
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, RefreshCw, WifiOff, Flame, Clock, Film } from 'lucide-react';
import { getHome, getLatestEpisodes, getRecommended, getPopularAnime, normalizeAnime } from '../services/api';
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
    <section className="py-10 animate-fade-in-up">
      <div className="container mx-auto px-6 mb-6 flex items-center justify-between">
        <div className="space-y-1">
           <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
             <div className={`p-2 rounded-lg bg-${color}-500/10 border border-${color}-500/20`}>
                {Icon && <Icon className={`w-6 h-6 text-${color}-500`} />}
             </div>
             {title}
           </h2>
        </div>
        <Link to={link} className={`group flex items-center gap-1 text-sm font-bold text-${color}-400 hover:text-${color}-300 transition-colors`}>
            {viewAllText} <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
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

export const Home = () => {
  const [recent, setRecent] = useState<Anime[]>([]);
  const [popular, setPopular] = useState<Anime[]>([]);
  const [movies, setMovies] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const { language } = useAppStore();
  const t = translations[language];

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      // getHome now fetches the aggregated data from Samehadaku
      const homeData = await getHome();
      
      if (homeData && homeData.home) {
        setRecent(homeData.home.recent || []);
        setPopular(homeData.home.popular || []);
        setMovies(homeData.home.movies || []);
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

  // Use recent items for HeroCarousel to ensure releasedOn (real-time data) is available and displayed
  const heroItems = recent.length > 0 ? recent.slice(0, 8) : popular.slice(0, 8);

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-20">
      {heroItems.length > 0 && <HeroCarousel featured={heroItems} />}
      
      {/* Adjusted margin top to -mt-8 to prevent covering dots, was -mt-24 */}
      <div className="space-y-4 relative z-20 -mt-8 md:-mt-12">
         <div className="bg-gradient-to-b from-[#020617]/0 via-[#020617] to-[#020617] pt-12">
            {/* Popular Section -> Link to /browse?status=popular */}
            <Section title={t.home.popular} icon={Flame} link="/browse?status=popular" items={popular} color="orange" viewAllText={t.home.viewAll} />
            
            {/* Latest Updates -> Link to /browse?status=recent */}
            <Section title={t.home.latest} icon={Clock} link="/browse?status=recent" items={recent} color="blue" viewAllText={t.home.viewAll} />
            
            {/* Anime Movies -> Link to /browse?status=movies */}
            <Section title={t.home.movies} icon={Film} link="/browse?status=movies" items={movies} color="emerald" viewAllText={t.home.viewAll} />
         </div>
      </div>
    </div>
  );
};
