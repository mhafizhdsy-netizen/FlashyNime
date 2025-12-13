
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Info, Star, Calendar, Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import { Anime } from '../types';
import { Button, Badge } from './ui';
import { getMangaDetail } from '../services/api';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';

interface MangaHeroCarouselProps {
  featured: Anime[];
}

export const MangaHeroCarousel: React.FC<MangaHeroCarouselProps> = ({ featured }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [rating, setRating] = useState<string>('N/A');
  
  const { language } = useAppStore();
  const t = translations[language];
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const DURATION = 8000;

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    const manga = featured[currentIndex];
    let isMounted = true;
    if (manga) {
      if (manga.rating && manga.rating !== 'N/A') {
        setRating(manga.rating);
      } else {
        setRating('N/A');
        const fetchScore = async () => {
          if (!manga.id) return;
          try {
            const res = await getMangaDetail(manga.id);
            const score = res?.detail?.rating;
            if (isMounted && score) setRating(score);
          } catch (e) { /* silent */ }
        };
        fetchScore();
      }
    }
    return () => { isMounted = false; };
  }, [currentIndex, featured]);

  useEffect(() => {
    resetTimeout();
    setProgress(0);
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        setProgress(Math.min((elapsed / DURATION) * 100, 100));
    }, 100);

    timeoutRef.current = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex === featured.length - 1 ? 0 : prevIndex + 1));
    }, DURATION);

    return () => {
      resetTimeout();
      clearInterval(progressInterval);
    };
  }, [currentIndex, featured.length]);

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featured.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length);
    setProgress(0);
  };

  if (!featured.length) return <div className="aspect-video w-full bg-slate-900 animate-pulse" />;

  const currentManga = featured[currentIndex];
  const posterUrl = currentManga.poster as string;
  const linkPath = '/manga/detail';

  return (
    <div className="relative w-full aspect-video overflow-hidden bg-[#020617] group select-none shadow-2xl">
      <div className="absolute inset-0 transition-all duration-700 ease-in-out">
         <div key={currentManga.id} className="absolute inset-0 animate-fade-in">
            <img src={posterUrl} alt={currentManga.title} className="w-full h-full object-cover object-top opacity-60 scale-105 group-hover:scale-100 transition-transform duration-[10s] ease-linear" draggable="false" />
         </div>
         <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />
         <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/80 to-transparent" />
      </div>

      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 z-30 pointer-events-none">
        <button onClick={handlePrev} className="pointer-events-auto w-10 h-10 md:w-14 md:h-14 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-rose-600 hover:border-rose-500 transition-all opacity-0 group-hover:opacity-100 -translate-x-10 group-hover:translate-x-0 duration-300 hover:scale-110">
            <ChevronLeft className="w-5 h-5 md:w-8 md:h-8" />
        </button>
        <button onClick={handleNext} className="pointer-events-auto w-10 h-10 md:w-14 md:h-14 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-rose-600 hover:border-rose-500 transition-all opacity-0 group-hover:opacity-100 translate-x-10 group-hover:translate-x-0 duration-300 hover:scale-110">
            <ChevronRight className="w-5 h-5 md:w-8 md:h-8" />
        </button>
      </div>

      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 w-full h-full pb-4">
          <div className="col-span-1 lg:col-span-7 flex flex-col justify-center h-full space-y-2 md:space-y-6 lg:space-y-8 z-10 pointer-events-none">
             <div className="space-y-1 md:space-y-4 animate-fade-in-up pointer-events-auto">
                <div className="flex items-center gap-2 md:gap-3">
                    <Badge variant="hot" className="px-2 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs">
                        #{currentIndex + 1} {t.home.spotlight}
                    </Badge>
                    <span className="text-rose-400 font-bold tracking-widest text-[10px] md:text-xs uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"/> 
                        {currentManga.type || 'Manga'}
                    </span>
                </div>
                <h1 className="text-xl md:text-5xl lg:text-7xl xl:text-8xl font-black text-white leading-[1.1] md:leading-[0.9] tracking-tighter drop-shadow-2xl line-clamp-2 md:line-clamp-3">
                  {currentManga.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 md:gap-x-6 md:gap-y-2 text-xs md:text-sm lg:text-base font-medium text-slate-300">
                   <div className="flex items-center gap-1 text-yellow-400"><Star className="w-3 h-3 md:w-4 md:h-4 fill-current"/><span className="text-white">{rating}</span></div>
                   <div className="flex items-center gap-1"><Clock className="w-3 h-3 md:w-4 md:h-4 text-slate-500"/><span>Ch {currentManga.episode}</span></div>
                   <Badge variant="outline" className="text-[10px] md:text-xs border-slate-600 text-slate-300 px-1.5 md:px-2">HD</Badge>
                </div>
             </div>
             <div className="flex items-center gap-3 md:gap-4 animate-fade-in-up pointer-events-auto pt-2 md:pt-0" style={{ animationDelay: '100ms' }}>
                <Link to={`${linkPath}/${currentManga.id}`}>
                  <Button className="h-9 md:h-14 px-5 md:px-10 text-xs md:text-lg rounded-xl md:rounded-2xl gap-2 md:gap-3 shadow-[0_0_20px_rgba(225,29,72,0.3)] md:shadow-[0_0_40px_rgba(225,29,72,0.5)] bg-gradient-to-r from-rose-600 to-pink-600 border-rose-500/50">
                    <BookOpen className="w-3.5 h-3.5 md:w-5 md:h-5" /> {t.manga.readNow}
                  </Button>
                </Link>
                <Link to={`${linkPath}/${currentManga.id}`}>
                   <Button variant="glass" className="h-9 md:h-14 px-5 md:px-8 text-xs md:text-lg rounded-xl md:rounded-2xl gap-2 md:gap-3 hover:bg-white/10">
                      <Info className="w-3.5 h-3.5 md:w-5 md:h-5" /> {t.home.details}
                   </Button>
                </Link>
             </div>
          </div>
          
          <div className="hidden lg:flex col-span-5 flex-col justify-end items-end pb-12 z-10 pointer-events-auto">
             <div className="space-y-4 w-full max-w-md">
                <div className="flex justify-between items-end mb-4 px-1">
                    <span className="text-sm font-bold text-slate-400">{t.home.upNext}</span>
                    <div className="flex gap-2">
                        <button onClick={handlePrev} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-white"/></button>
                        <button onClick={handleNext} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronRight className="w-5 h-5 text-white"/></button>
                    </div>
                </div>
                
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide mask-image-gradient-right">
                    {featured.map((manga, idx) => {
                        const isActive = idx === currentIndex;
                        const thumbPoster = manga.poster as string;
                        return (
                            <div key={idx} onClick={() => handleThumbnailClick(idx)} className={`relative flex-shrink-0 w-32 aspect-[2/3] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${isActive ? 'ring-2 ring-rose-500 scale-105 shadow-xl shadow-rose-900/40' : 'opacity-60 hover:opacity-100 hover:scale-105'}`}>
                                <img src={thumbPoster} alt={manga.title} loading="lazy" className="w-full h-full object-cover" />
                                {isActive && (
                                    <div className="absolute inset-0 bg-rose-900/20 backdrop-blur-[1px]">
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500">
                                            <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
             </div>
          </div>
        </div>

        <div className="absolute bottom-2 md:bottom-8 left-0 right-0 flex justify-center items-center gap-2 md:gap-3 z-20 lg:hidden pointer-events-auto">
          {featured.map((_, idx) => (
             <button key={idx} onClick={() => { setCurrentIndex(idx); setProgress(0); }} className={`relative transition-all duration-500 ease-out group/dot ${idx === currentIndex ? 'w-4 md:w-8' : 'w-1.5 md:w-2 hover:w-4'}`} aria-label={`Go to slide ${idx + 1}`}>
                <div className={`h-1.5 md:h-2 rounded-full transition-all duration-500 ${idx === currentIndex ? 'bg-gradient-to-r from-rose-500 to-pink-500 shadow-[0_0_15px_rgba(225,29,72,0.6)]' : 'bg-white/20 hover:bg-white/40'}`} />
             </button>
          ))}
        </div>
      </div>
    </div>
  );
};
