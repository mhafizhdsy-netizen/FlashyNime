import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getDonghuaSchedule } from '../services/api';
import { ScheduleDay } from '../types';
import { AnimeCard } from '../components/AnimeCard';
import { Button, Spinner } from '../components/ui';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';

export const DonghuaSchedule = () => {
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [activeDay, setActiveDay] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { language } = useAppStore();
  const t = translations[language];
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    setActiveDay(today);
    
    setLoading(true);
    getDonghuaSchedule().then(res => { 
        if (res.schedule) setSchedule(res.schedule); 
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeDay && scrollRef.current) {
        const activeBtn = document.getElementById(`day-btn-${activeDay}`);
        if (activeBtn) {
            const containerLeft = scrollRef.current.getBoundingClientRect().left;
            const btnLeft = activeBtn.getBoundingClientRect().left;
            const offset = btnLeft - containerLeft - 24; 
            scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
        }
    }
  }, [activeDay, loading]);

  // Robust comparison: Normalize strings to ensure "Friday " matches "Friday"
  const normalizeDay = (d: string) => d.toLowerCase().trim();
  const currentList = schedule.find(s => normalizeDay(s.day) === normalizeDay(activeDay))?.animeList || [];

  return (
    <div className="min-h-screen bg-[#020617] pt-28 px-6 pb-20">
      <div className="container mx-auto">
         <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 pl-0 hover:pl-2 transition-all text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5 mr-2"/> {t.watch.goBack}
         </Button>

         <div className="text-center mb-10 animate-fade-in-up">
            <h1 className="text-4xl font-black text-white mb-2">Donghua {t.nav.schedule}</h1>
            <p className="text-slate-400">{t.schedule.subtitle}</p>
         </div>
         
         <div className="mb-10 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div 
                ref={scrollRef}
                className="flex overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0 gap-3 mask-image-gradient"
            >
              {days.map(day => (
                 <button
                   key={day}
                   id={`day-btn-${day}`}
                   onClick={() => setActiveDay(day)}
                   className={`
                     flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border
                     ${activeDay === day 
                       ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-transparent shadow-lg shadow-violet-500/25 scale-105' 
                       : 'bg-slate-800/50 text-slate-400 border-white/5 hover:bg-slate-800 hover:text-white hover:border-white/10'
                     }
                   `}
                 >
                   {day}
                 </button>
              ))}
            </div>
         </div>

         {loading ? (
             <div className="flex justify-center items-center py-32 animate-fade-in min-h-[50vh]">
                 <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/5 backdrop-blur-sm shadow-xl">
                    <Spinner />
                 </div>
             </div>
         ) : (
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                {currentList.map((anime, idx) => (
                   <AnimeCard key={`${anime.id}-${idx}`} anime={anime} isDonghua={true} />
                ))}
                {currentList.length === 0 && (
                   <div className="col-span-full text-center py-20 text-slate-500 bg-white/5 rounded-3xl border border-white/5">
                      <p className="text-lg">{t.schedule.noSchedule} {activeDay}.</p>
                   </div>
                )}
             </div>
         )}
      </div>
    </div>
  );
};