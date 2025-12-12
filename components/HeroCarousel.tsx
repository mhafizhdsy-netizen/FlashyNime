
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, Star, Calendar, Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import { Anime } from '../types';
import { Button, Badge } from './ui';
import { getAnimeDetail } from '../services/api';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';

interface HeroCarouselProps {
  featured: Anime[];
  isDonghua?: boolean;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ featured, isDonghua = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [rating, setRating] = useState<string>('N/A');
  
  const { language } = useAppStore();
  const t = translations[language];
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const DURATION = 8000; // 8 seconds

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Handle Rating Fetching
  useEffect(() => {
    const anime = featured[currentIndex];
    let isMounted = true;

    if (anime) {
        // Use existing rating if available, otherwise fetch it
        if (anime.rating && anime.rating !== 'N/A') {
            setRating(anime.rating);
        } else {
            setRating('N/A');
            // Fetch detailed info to get score
            const fetchScore = async () => {
                if (!anime.id) return;
                try {
                    const res = await getAnimeDetail(anime.id);
                    if (isMounted && res?.detail?.score) {
                        setRating(res.detail.score);
                    }
                } catch (e) {
                    // Suppress errors for background fetch to avoid console spam
                }
            };
            fetchScore();
        }
    }
    
    return () => { isMounted = false; };
  }, [currentIndex, featured]);

  useEffect(() => {
    resetTimeout();
    setProgress(0);
    
    // Progress bar animation
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const p = Math.min((elapsed / DURATION) * 100, 100);
        setProgress(p);
    }, 100);

    timeoutRef.current = setTimeout(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === featured.length - 1 ? 0 : prevIndex + 1
      );
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

  if (!featured.length) return <div className="h-[80vh] w-full bg-slate-900 animate-pulse" />;

  const currentAnime = featured[currentIndex];

  return (
    <div className="relative w-full h-[85vh] md:h-[90vh] overflow-hidden bg-[#020617] group select-none">
      {/* Background Image Layer */}
      <div className="absolute inset-0 transition-all duration-700 ease-in-out">
         <div key={currentAnime.id} className="absolute inset-0 animate-fade-in">
            <img 
                src={currentAnime.poster} 
                alt={currentAnime.title} 
                className="w-full h-full object-cover object-center md:object-top opacity-60 scale-105 group-hover:scale-100 transition-transform duration-[10s] ease-linear" 
                draggable="false"
            />
         </div>
         {/* Cinematic Gradients */}
         <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />
         <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/80 to-transparent" />
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-[#020617]/20 to-[#020617]/40" />
      </div>

      {/* Navigation Arrows (Visible on hover) */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 z-30 pointer-events-none">
        <button 
            onClick={handlePrev}
            className="pointer-events-auto w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-violet-600 hover:border-violet-500 transition-all opacity-0 group-hover:opacity-100 -translate-x-10 group-hover:translate-x-0 duration-300 hover:scale-110"
        >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
        </button>
        <button 
            onClick={handleNext}
            className="pointer-events-auto w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-violet-600 hover:border-violet-500 transition-all opacity-0 group-hover:opacity-100 translate-x-10 group-hover:translate-x-0 duration-300 hover:scale-110"
        >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
        </button>
      </div>

      {/* Main Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 w-full h-full pt-20 pb-10">
          
          {/* Left Content */}
          <div className="col-span-1 lg:col-span-7 flex flex-col justify-center h-full space-y-8 z-10 pointer-events-none">
             <div className="space-y-4 animate-fade-in-up pointer-events-auto">
                <div className="flex items-center gap-3">
                    <Badge variant="hot" className="px-3 py-1 text-xs">
                        #{currentIndex + 1} {t.home.spotlight}
                    </Badge>
                    <span className="text-violet-400 font-bold tracking-widest text-xs uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"/> 
                        {currentAnime.type || 'TV Series'}
                    </span>
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter drop-shadow-2xl line-clamp-2 md:line-clamp-3">
                  {currentAnime.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm md:text-base font-medium text-slate-300">
                   <div className="flex items-center gap-1 text-yellow-400">
                       <Star className="w-4 h-4 fill-current"/>
                       <span className="text-white">{rating}</span>
                   </div>
                   <div className="flex items-center gap-1">
                       <Calendar className="w-4 h-4 text-slate-500"/>
                       <span>{currentAnime.release_day || 'Unknown'}</span>
                   </div>
                   <div className="flex items-center gap-1">
                       <Clock className="w-4 h-4 text-slate-500"/>
                       <span>{currentAnime.episode ? `${currentAnime.episode} Eps` : 'Ongoing'}</span>
                   </div>
                   <Badge variant="outline" className="text-xs border-slate-600 text-slate-300 px-2">HD</Badge>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {currentAnime.genres?.slice(0, 4).map((g) => (
                    <span key={g} className="text-xs font-semibold text-slate-400 border border-white/10 bg-white/5 px-3 py-1 rounded-full backdrop-blur-sm">
                        {g}
                    </span>
                  ))}
                </div>
             </div>

             <div className="flex items-center gap-4 animate-fade-in-up pointer-events-auto" style={{ animationDelay: '100ms' }}>
                <Link to={`${isDonghua ? '/donghua/detail' : '/anime'}/${currentAnime.id}`}>
                  <Button className="h-14 px-8 md:px-10 text-lg rounded-2xl gap-3 shadow-[0_0_40px_rgba(124,58,237,0.5)] border border-violet-500/50">
                    <Play className="fill-white w-5 h-5" /> {t.home.watchNow}
                  </Button>
                </Link>
                <Link to={`${isDonghua ? '/donghua/detail' : '/anime'}/${currentAnime.id}`}>
                   <Button variant="glass" className="h-14 px-8 text-lg rounded-2xl gap-3 hover:bg-white/10">
                      <Info className="w-5 h-5" /> {t.home.details}
                   </Button>
                </Link>
             </div>
          </div>
          
          {/* Right Navigation (Desktop) - Thumbnails */}
          <div className="hidden lg:flex col-span-5 flex-col justify-end items-end pb-12 z-10 pointer-events-auto">
             <div className="space-y-4 w-full max-w-md">
                <div className="flex justify-between items-end mb-4 px-1">
                    <span className="text-sm font-bold text-slate-400">{t.home.upNext}</span>
                    <div className="flex gap-2">
                        <button onClick={handlePrev} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-white"/></button>
                        <button onClick={handleNext} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronRight className="w-5 h-5 text-white"/></button>
                    </div>
                </div>
                
                {/* Thumbnails List */}
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide mask-image-gradient-right">
                    {featured.map((anime, idx) => {
                        const isActive = idx === currentIndex;
                        return (
                            <div 
                                key={idx}
                                onClick={() => handleThumbnailClick(idx)}
                                className={`
                                    relative flex-shrink-0 w-32 aspect-[2/3] rounded-xl overflow-hidden cursor-pointer transition-all duration-300
                                    ${isActive ? 'ring-2 ring-violet-500 scale-105 shadow-xl shadow-violet-900/40' : 'opacity-60 hover:opacity-100 hover:scale-105'}
                                `}
                            >
                                <img 
                                  src={anime.poster} 
                                  alt={anime.title} 
                                  loading="lazy"
                                  className="w-full h-full object-cover" 
                                />
                                {isActive && (
                                    <div className="absolute inset-0 bg-violet-900/20 backdrop-blur-[1px]">
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-violet-500">
                                            <div 
                                                className="h-full bg-white transition-all duration-100 ease-linear" 
                                                style={{ width: `${progress}%` }} 
                                            />
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

        {/* Redesigned Dot Indicators (Mobile/Tablet) */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-3 z-20 lg:hidden pointer-events-auto">
          {featured.map((_, idx) => (
             <button
               key={idx}
               onClick={() => {
                  setCurrentIndex(idx);
                  setProgress(0);
               }}
               className={`relative transition-all duration-500 ease-out group/dot ${
                  idx === currentIndex ? 'w-8' : 'w-2 hover:w-4'
               }`}
               aria-label={`Go to slide ${idx + 1}`}
             >
                <div className={`h-2 rounded-full transition-all duration-500 ${
                    idx === currentIndex 
                      ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-[0_0_15px_rgba(139,92,246,0.6)]' 
                      : 'bg-white/20 hover:bg-white/40'
                }`} />
             </button>
          ))}
        </div>
      </div>
    </div>
  );
};
