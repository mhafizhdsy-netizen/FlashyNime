
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
    
    timeoutRef.current = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex === featured.length - 1 ? 0 : prevIndex + 1));
    }, DURATION);

    return () => {
      resetTimeout();
    };
  }, [currentIndex, featured.length]);

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featured.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length);
  };

  if (!featured.length) return <div className="w-full px-4 md:px-8 h-[50vh] bg-slate-900/50 animate-pulse rounded-3xl mx-auto mt-4" />;

  const currentManga = featured[currentIndex];
  const linkPath = '/manga/detail';

  return (
    <div className="w-full px-4 md:px-8 pt-4 pb-8">
      {/* Aspect Ratio: 16:9 (Landscape) on Mobile and Desktop */}
      <div className="relative w-full aspect-video rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-[#020617] group select-none shadow-[0_0_50px_rgba(225,29,72,0.15)] ring-1 ring-white/10 isolate">
        
        {/* Background Layer - Crossfade Logic */}
        {featured.map((manga, index) => {
            const posterUrl = manga.poster as string;
            const isActive = index === currentIndex;

            return (
                <div 
                    key={manga.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out will-change-opacity ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    <div className="absolute inset-0 bg-[#020617]" />
                    <img 
                        src={posterUrl} 
                        alt={manga.title} 
                        className={`w-full h-full object-cover object-top transition-transform duration-[10000ms] ease-linear ${isActive ? 'scale-110' : 'scale-100'}`}
                        draggable="false"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/80 to-transparent" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#020617]/30 to-[#020617]/50" />
                </div>
            );
        })}

        <div className="absolute inset-0 z-20 flex items-center pointer-events-none">
            <div className="container mx-auto px-4 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-2 md:gap-6 w-full h-full pb-4 md:pb-0">
                
                {/* Left Info */}
                <div className="col-span-1 lg:col-span-7 flex flex-col justify-end lg:justify-center h-full space-y-1 md:space-y-6 pointer-events-auto pb-6 md:pb-12 lg:pb-0">
                    <div className="space-y-1 md:space-y-4 animate-fade-in-up" key={currentIndex}>
                        <div className="flex items-center gap-2 md:gap-3">
                            <Badge variant="hot" className="px-1.5 py-0.5 md:px-3 md:py-1 text-[9px] md:text-xs shadow-lg shadow-rose-500/20 backdrop-blur-md border-none bg-gradient-to-r from-orange-500 to-rose-600">
                                #{currentIndex + 1} {t.home.spotlight}
                            </Badge>
                            <span className="flex items-center gap-1.5 md:gap-2 text-rose-300 text-[9px] md:text-xs font-bold uppercase tracking-widest bg-rose-500/10 px-1.5 py-0.5 md:px-3 md:py-1 rounded-full border border-rose-500/20 backdrop-blur-md">
                                <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-rose-500"></span>
                                </span>
                                {currentManga.type || 'Manga'}
                            </span>
                        </div>

                        <h1 className="text-lg sm:text-4xl md:text-5xl lg:text-7xl font-black text-white leading-none tracking-tighter drop-shadow-2xl line-clamp-2">
                            {currentManga.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-1.5 md:gap-4 text-[9px] md:text-sm font-medium text-slate-300">
                            <div className="flex items-center gap-1 md:gap-1.5 text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 md:px-2 md:py-1 rounded-md md:rounded-lg border border-yellow-400/20">
                                <Star className="w-2.5 h-2.5 md:w-4 md:h-4 fill-current"/>
                                <span>{rating}</span>
                            </div>
                            <div className="flex items-center gap-1 md:gap-1.5 bg-white/5 px-1.5 py-0.5 md:px-2 md:py-1 rounded-md md:rounded-lg border border-white/10">
                                <Clock className="w-2.5 h-2.5 md:w-4 md:h-4 text-slate-400"/>
                                <span>Ch {currentManga.episode}</span>
                            </div>
                            <Badge variant="outline" className="text-[9px] md:text-xs px-1.5 py-0.5 md:px-2 md:py-1 bg-white/5 backdrop-blur-sm">HD</Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4 pt-1 md:pt-2 animate-fade-in-up" style={{ animationDelay: '100ms' }} key={`btns-${currentIndex}`}>
                        <Link to={`${linkPath}/${currentManga.id}`}>
                            <Button className="h-8 md:h-14 px-4 md:px-10 text-xs md:text-lg rounded-lg md:rounded-2xl gap-1.5 md:gap-3 shadow-[0_0_30px_rgba(225,29,72,0.4)] bg-gradient-to-r from-rose-600 to-pink-600 border border-rose-500/50 hover:scale-105 active:scale-95 transition-all">
                                <BookOpen className="fill-white w-3 h-3 md:w-5 md:h-5" /> {t.manga.readNow}
                            </Button>
                        </Link>
                        <Link to={`${linkPath}/${currentManga.id}`}>
                            <Button variant="glass" className="h-8 md:h-14 px-3 md:px-8 text-xs md:text-lg rounded-lg md:rounded-2xl gap-1.5 md:gap-3 hover:bg-white/15 border-white/10">
                                <Info className="w-3 h-3 md:w-5 md:h-5" /> {t.home.details}
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Right Navigation */}
                <div className="hidden lg:flex col-span-5 flex-col justify-end items-end pb-12 pointer-events-auto">
                    <div className="space-y-4 w-full max-w-sm xl:max-w-md">
                        <div className="flex justify-between items-end mb-4 px-1">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t.home.upNext}</span>
                            <div className="flex gap-2">
                                <button onClick={handlePrev} className="p-3 bg-white/5 hover:bg-rose-600 border border-white/10 hover:border-rose-500 rounded-full transition-all group/nav">
                                    <ChevronLeft className="w-5 h-5 text-white group-hover/nav:scale-110 transition-transform"/>
                                </button>
                                <button onClick={handleNext} className="p-3 bg-white/5 hover:bg-rose-600 border border-white/10 hover:border-rose-500 rounded-full transition-all group/nav">
                                    <ChevronRight className="w-5 h-5 text-white group-hover/nav:scale-110 transition-transform"/>
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex gap-4 overflow-hidden relative p-1 -m-1">
                            {featured.map((manga, idx) => {
                                const isActive = idx === currentIndex;
                                const thumbPoster = manga.poster as string;
                                
                                return (
                                    <div 
                                        key={idx}
                                        onClick={() => handleThumbnailClick(idx)}
                                        className={`
                                            relative flex-shrink-0 w-28 xl:w-32 aspect-[3/4] rounded-xl overflow-hidden cursor-pointer transition-all duration-500 ease-out
                                            ${isActive 
                                                ? 'ring-2 ring-rose-500 shadow-xl shadow-rose-900/50 scale-105 opacity-100 translate-y-0 z-10' 
                                                : 'opacity-50 hover:opacity-80 scale-95 hover:scale-100 grayscale hover:grayscale-0'
                                            }
                                        `}
                                    >
                                        <img src={thumbPoster} alt={manga.title} className="w-full h-full object-cover" loading="lazy"/>
                                        
                                        {isActive && (
                                            <div className="absolute inset-0 bg-gradient-to-t from-rose-900/80 to-transparent flex flex-col justify-end p-2">
                                                <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.8)] origin-left" 
                                                        style={{ 
                                                            animation: `progress ${DURATION}ms linear` 
                                                        }} 
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
        </div>

        {/* Mobile Indicators */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center items-center gap-1.5 z-30 lg:hidden pointer-events-auto">
            {featured.map((_, idx) => (
                <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className="group relative p-2"
                    aria-label={`Go to slide ${idx + 1}`}
                >
                    <span className={`block rounded-full transition-all duration-500 ${
                        idx === currentIndex ? 'w-4 h-1 bg-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.5)]' : 'w-1 h-1 bg-white/30'
                    }`} />
                    {idx === currentIndex && (
                        <span className="absolute bottom-2 left-2 h-1 bg-white/50 rounded-full w-0 animate-[progress_8s_linear_forwards]" style={{ maxWidth: '1rem' }} />
                    )}
                </button>
            ))}
        </div>

        <style>{`
            @keyframes progress {
                from { width: 0%; }
                to { width: 100%; }
            }
        `}</style>
      </div>
    </div>
  );
};
