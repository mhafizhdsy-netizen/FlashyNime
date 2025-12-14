
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Star, ImageOff } from 'lucide-react';
import { Anime } from '../types';
import { getMangaDetail, normalizeManga } from '../services/api';
import { Spinner } from './ui';

interface MangaCardProps {
  manga: Anime;
  overrideLink?: string;
}

export const MangaCard: React.FC<MangaCardProps> = ({ manga, overrideLink }) => {
  const [enrichedManga, setEnrichedManga] = useState<Anime>(manga);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const cardRef = useRef<HTMLAnchorElement>(null);

  const displayManga = enrichedManga;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isInView) return;

    const hasMissingInfo = !displayManga.poster || !displayManga.status || !displayManga.type;
    if (hasMissingInfo && displayManga.id) {
      setIsLoadingDetail(true);
      getMangaDetail(displayManga.id)
        .then(res => {
          if (res.detail) {
            const normalized = normalizeManga(res.detail);
            setEnrichedManga(prev => ({
                ...prev,
                ...normalized,
                id: prev.id || normalized.id,
                title: prev.title || normalized.title,
            }));
          } else {
            setHasError(true);
          }
        })
        .catch(() => {
          setHasError(true);
        })
        .finally(() => {
          setIsLoadingDetail(false);
        });
    } else if (hasMissingInfo && !displayManga.id) {
      setHasError(true);
    }
  }, [isInView, displayManga.id]);


  const linkPrefix = '/manga/detail';
  const displayTitle = (displayManga as any).english_title || displayManga.title;
  const mangaId = displayManga.id || ''; 
  
  const finalLink = overrideLink ? overrideLink : `${linkPrefix}/${mangaId}`;
  const rawPoster = displayManga.poster;
  const posterUrl = Array.isArray(rawPoster) && rawPoster.length > 0 ? rawPoster[0] : typeof rawPoster === 'string' ? rawPoster : '';

  const hasPoster = posterUrl && posterUrl.trim() !== '';

  return (
    <Link to={finalLink} ref={cardRef} className="block group w-full h-full relative">
      <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden bg-slate-800 transition-all duration-500 group-hover:shadow-[0_0_25px_rgba(225,29,72,0.4)] group-hover:scale-[1.02] ring-1 ring-white/10 group-hover:ring-rose-500/50">
        
        {/* Loading State */}
        {isLoadingDetail && (
            <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center z-20">
                <Spinner />
            </div>
        )}

        {/* Fallback for error or missing image when in view */}
        {!isLoadingDetail && isInView && (!hasPoster || hasError) && (
           <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center p-4 text-center z-0">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-2">
                 <ImageOff className="w-6 h-6 text-slate-600" />
              </div>
              <span className="text-xs font-bold text-slate-500 line-clamp-3 leading-relaxed">
                 {displayTitle}
              </span>
           </div>
        )}

        {/* Skeleton before view or before load */}
        {(!isInView || !isLoaded) && !hasError && !isLoadingDetail && (
          <div className="absolute inset-0 bg-slate-800 z-0">
             <div className="w-full h-full animate-pulse bg-gradient-to-b from-slate-700/50 to-slate-800/50" />
          </div>
        )}

        {/* Image - rendered once in view */}
        {!isLoadingDetail && isInView && hasPoster && !hasError && (
            <img 
            src={posterUrl} 
            alt={displayTitle}
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
            onError={() => {
                setHasError(true);
            }}
            className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 
                ${isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-xl'}
            `}
            />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
           <div className="w-14 h-14 rounded-full bg-rose-600/80 backdrop-blur-md flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-300 shadow-lg shadow-rose-600/20">
              <BookOpen className="w-6 h-6" />
           </div>
        </div>

        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
            {displayManga.episode && (
                <span className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 shadow-lg">
                    Ch {displayManga.episode}
                </span>
            )}
        </div>
        
        <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
            {displayManga.rating && displayManga.rating !== 'N/A' && (
                 <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/90 backdrop-blur-md text-[10px] font-bold text-black shadow-lg">
                    <Star className="w-3 h-3 fill-black" /> {displayManga.rating}
                 </div>
            )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
           <h3 className="text-white font-bold text-sm md:text-base leading-snug line-clamp-2 mb-2 drop-shadow-md group-hover:text-rose-300 transition-colors">
             {displayTitle}
           </h3>
           
           <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {displayManga.type && (
                 <span className="text-[10px] uppercase font-bold text-slate-200 bg-white/10 px-1.5 py-0.5 rounded flex items-center gap-1 border border-white/5">
                    {displayManga.type}
                 </span>
              )}
           </div>
        </div>
      </div>
    </Link>
  );
};
