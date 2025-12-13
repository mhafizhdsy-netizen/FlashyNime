
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Flame, Clock } from 'lucide-react';
import { getMangaHome } from '../services/api';
import { Anime } from '../types';
import { MangaCard } from '../components/MangaCard';
import { MangaHeroCarousel } from '../components/MangaHeroCarousel';
import { Spinner } from '../components/ui';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';

const Section = ({ title, icon: Icon, link, items, color = "rose", viewAllText }: { title: string, icon?: any, link: string, items: Anime[], color?: string, viewAllText: string }) => {
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
          {items.slice(0, 12).map((manga, idx) => (
            <div key={`${manga.id}-${idx}`} style={{ animationDelay: `${idx * 50}ms` }} className="animate-scale-in">
                <MangaCard manga={manga} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const MangaHome = () => {
  const [trending, setTrending] = useState<Anime[]>([]);
  const [latest, setLatest] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { language } = useAppStore();
  const t = translations[language];

  useEffect(() => {
    setLoading(true);
    getMangaHome().then(res => {
        setTrending(res.trending || []);
        setLatest(res.latest || []);
    }).catch(err => {
        console.error("MangaHome fetch failed:", err);
    }).finally(() => {
        setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-20 pt-24 md:pt-28">
      {trending.length > 0 && <MangaHeroCarousel featured={trending.slice(0, 8)} />}
      
      <div className="space-y-4 relative z-20 -mt-8 md:-mt-12">
         <div className="bg-gradient-to-b from-[#020617]/0 via-[#020617] to-[#020617] pt-12">
            
            <Section 
                title={t.manga.trending} 
                icon={Flame} 
                link="/manga/browse?status=popular" 
                items={trending} 
                color="rose" 
                viewAllText={t.home.viewAll} 
            />
            
            <Section 
                title={t.manga.latest} 
                icon={Clock} 
                link="/manga/browse?status=recent" 
                items={latest} 
                color="blue" 
                viewAllText={t.home.viewAll} 
            />

         </div>
      </div>
    </div>
  );
};
