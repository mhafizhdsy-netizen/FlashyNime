
import React, { useEffect, useState } from 'react';
import { getDonghuaHome } from '../services/api';
import { Anime } from '../types';
import { HeroCarousel } from '../components/HeroCarousel';
import { AnimeCard } from '../components/AnimeCard';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Sparkles, CheckCircle, Calendar, Compass } from 'lucide-react';
import { Spinner, Button } from '../components/ui';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';

export const Donghua = () => {
  const [data, setData] = useState<{ latest: Anime[], completed: Anime[] } | null>(null);
  const navigate = useNavigate();
  const { language } = useAppStore();
  const t = translations[language];
  
  useEffect(() => {
    getDonghuaHome().then(res => setData(res));
  }, []);

  if (!data) return <div className="min-h-screen bg-[#020617] flex items-center justify-center"><Spinner /></div>;

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-20">
       {/* Use Latest Releases for Carousel */}
       <HeroCarousel featured={data.latest.slice(0, 5)} isDonghua={true} />
       
       <div className="container mx-auto px-6 mt-8 space-y-12">
          <section className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-3xl font-bold flex items-center gap-2"><Sparkles className="text-cyan-400"/> {t.donghua.latest}</h2>
               <Link to="/donghua/browse?status=latest" className="group flex items-center gap-1 text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
                  {t.home.viewAll} <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
               </Link>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {data.latest.slice(0, 12).map((a: Anime, i: number) => <AnimeCard key={i} anime={a} isDonghua={true} />)}
             </div>
          </section>

          <section className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-3xl font-bold flex items-center gap-2"><CheckCircle className="text-fuchsia-400"/> {t.donghua.completed}</h2>
               <Link to="/donghua/browse?status=completed" className="group flex items-center gap-1 text-sm font-bold text-fuchsia-400 hover:text-fuchsia-300 transition-colors">
                  {t.home.viewAll} <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
               </Link>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {data.completed.slice(0, 12).map((a: Anime, i: number) => <AnimeCard key={i} anime={a} isDonghua={true} />)}
             </div>
          </section>
       </div>
    </div>
  );
};
