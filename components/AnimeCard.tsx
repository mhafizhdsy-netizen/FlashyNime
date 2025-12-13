
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, Tv, Film, Layers, ImageOff } from 'lucide-react';
import { Anime } from '../types';
import { getAnimeDetail, getDonghuaDetail, getMangaDetail, normalizeAnime, normalizeDonghua, normalizeManga } from '../services/api';

interface AnimeCardProps {
  anime: Anime;
  isDonghua?: boolean;
  isBatch?: boolean;
  isManga?: boolean;
  overrideLink?: string;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, isDonghua = false, isBatch = false, isManga = false, overrideLink }) => {
  const [enrichedAnime, setEnrichedAnime] = useState<Anime>(anime);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const cardRef = useRef<HTMLAnchorElement>(null);
  const observerFired = useRef(false);

  const displayAnime = enrichedAnime;

  // Lazy load missing details (poster, status, type)
  useEffect(() => {
    const isContentDonghua = anime.isDonghua || isDonghua;
    const isContentManga = anime.isManga || isManga;
    const hasMissingInfo = !displayAnime.poster || !displayAnime.status || !displayAnime.type;

    if (!hasMissingInfo || observerFired.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          observerFired.current = true;

          if (displayAnime.id) {
            let detailFetcher: any;
            let normalizer: any;

            if (isContentManga) {
              detailFetcher = getMangaDetail;
              normalizer = normalizeManga;
            } else if (isContentDonghua) {
              detailFetcher = getDonghuaDetail;
              normalizer = normalizeDonghua;
            } else {
              detailFetcher = getAnimeDetail;
              normalizer = normalizeAnime;
            }

            detailFetcher(displayAnime.id)
              .then(res => {
                if (res.detail) {
                  const normalized = normalizer(res.detail);
                  setEnrichedAnime(prev => ({
                      ...prev,
                      ...normalized,
                      id: prev.id || normalized.id,
                      title: prev.title || normalized.title,
                      english_title: (res.detail as any).english_title || (prev as any).english_title,
                  }));
                } else {
                  setHasError(true);
                }
              })
              .catch(() => {
                setHasError(true);
              });
          } else {
            setHasError(true);
          }
        }
      },
      {
        rootMargin: '200px',
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [displayAnime, isDonghua, isManga]);


  const isContentDonghua = anime.isDonghua || isDonghua;
  const isContentManga = anime.isManga || isManga;

  let linkPrefix = '/anime';
  if (isContentManga) {
    linkPrefix = '/manga/detail';
  } else if (isContentDonghua) {
    linkPrefix = '/donghua/detail';
  }
  
  if (isBatch) {
    linkPrefix = '/batch';
  }

  const displayTitle = (displayAnime as any).english_title || displayAnime.title;
  const animeId = displayAnime.id || ''; 
  
  const finalLink = overrideLink ? overrideLink : `${linkPrefix}/${animeId}`;
  const rawPoster = displayAnime.poster;
  const posterUrl = Array.isArray(rawPoster) && rawPoster.length > 0 ? rawPoster[0] : typeof rawPoster === 'string' ? rawPoster : '';

  const hasPoster = posterUrl && posterUrl.trim() !== '';

  return (
    <Link to={finalLink} ref={cardRef} className="block group w-full h-full relative">
      <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden bg-slate-800 transition-all duration-500 group-hover:shadow-[0_0_25px_rgba(124,58,237,0.4)] group-hover:scale-[1.02] ring-1 ring-white/10 group-hover:ring-violet-500/50">
        
        {/* Fallback for missing/broken image */}
        {(!hasPoster || hasError) && (
           <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center p-4 text-center z-0">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-2">
                 <ImageOff className="w-6 h-6 text-slate-600" />
              </div>
              <span className="text-xs font-bold text-slate-500 line-clamp-3 leading-relaxed">
                 {displayTitle}
              </span>
           </div>
        )}

        {/* Initial Skeleton before poster URL is fetched */}
        {!posterUrl && !hasError && (
          <div className="absolute inset-0 bg-slate-800 z-0">
             <div className="w-full h-full animate-pulse bg-gradient-to-b from-slate-700/50 to-slate-800/50" />
          </div>
        )}

        {/* Image - rendered once posterUrl is available */}
        {hasPoster && !hasError && (
            <img 
            src={posterUrl} 
            alt={displayTitle}
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
            onError={() => {
                setHasError(true);
                setEnrichedAnime(prev => ({...prev, poster: ''}));
            }}
            className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 
                ${isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-xl'}
            `}
            />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Play Icon Reveal */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
           <div className="w-14 h-14 rounded-full bg-violet-600/80 backdrop-blur-md flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-300 shadow-lg shadow-violet-600/20">
              <Play className="w-6 h-6 fill-white ml-1" />
           </div>
        </div>

        {/* Top Left: Episode / Batch */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
            {displayAnime.episode && !isBatch && (
                <span className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 shadow-lg">
                    {isContentManga ? 'Ch' : 'Ep'} {displayAnime.episode}
                </span>
            )}
            {isBatch && (
                <span className="px-2 py-1 rounded-md bg-fuchsia-600/80 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 shadow-lg uppercase flex items-center gap-1">
                    <Layers className="w-3 h-3" /> Batch
                </span>
            )}
        </div>
        
        {/* Top Right: Rating (Status moved to bottom) */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
            {displayAnime.rating && displayAnime.rating !== 'N/A' && (
                 <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/90 backdrop-blur-md text-[10px] font-bold text-black shadow-lg">
                    <Star className="w-3 h-3 fill-black" /> {displayAnime.rating}
                 </div>
            )}
        </div>

        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
           <h3 className="text-white font-bold text-sm md:text-base leading-snug line-clamp-2 mb-2 drop-shadow-md group-hover:text-violet-300 transition-colors">
             {displayTitle}
           </h3>
           
           {/* Permanent Details: Type & Status */}
           <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {displayAnime.type && !isBatch && (
                 <span className="text-[10px] uppercase font-bold text-slate-200 bg-white/10 px-1.5 py-0.5 rounded flex items-center gap-1 border border-white/5">
                    {displayAnime.type.toLowerCase().includes('movie') ? <Film className="w-3 h-3"/> : <Tv className="w-3 h-3"/>}
                    {displayAnime.type}
                 </span>
              )}
              {displayAnime.status && (
                 <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-white/5
                    ${displayAnime.status.toLowerCase().includes('ongoing') ? 'text-green-300 bg-green-500/10' : 'text-blue-300 bg-blue-500/10'}
                 `}>
                    {displayAnime.status}
                 </span>
              )}
           </div>
        </div>
      </div>
    </Link>
  );
};