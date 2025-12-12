
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, Tv, Film, Layers } from 'lucide-react';
import { Anime } from '../types';

interface AnimeCardProps {
  anime: Anime;
  isDonghua?: boolean;
  isBatch?: boolean;
  overrideLink?: string;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, isDonghua = false, isBatch = false, overrideLink }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const isContentDonghua = anime.isDonghua !== undefined ? anime.isDonghua : isDonghua;

  let linkPrefix = '/anime';
  if (isContentDonghua) linkPrefix = '/donghua/detail';
  if (isBatch) linkPrefix = '/batch';

  const displayTitle = (anime as any).english_title || anime.title;
  const animeId = anime.id || ''; 
  
  const finalLink = overrideLink ? overrideLink : `${linkPrefix}/${animeId}`;
  
  return (
    <Link to={finalLink} className="block group w-full h-full relative">
      <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden bg-slate-800 transition-all duration-500 group-hover:shadow-[0_0_25px_rgba(124,58,237,0.4)] group-hover:scale-[1.02] ring-1 ring-white/10 group-hover:ring-violet-500/50">
        
        {/* Loading Skeleton */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-slate-800 z-0">
             <div className="w-full h-full animate-pulse bg-gradient-to-b from-slate-700/50 to-slate-800/50" />
          </div>
        )}

        {/* Image */}
        <img 
          src={anime.poster} 
          alt={displayTitle}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 
            ${isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-xl'}
          `}
        />

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
            {anime.episode && !isBatch && (
                <span className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 shadow-lg">
                    Ep {anime.episode}
                </span>
            )}
            {isBatch && (
                <span className="px-2 py-1 rounded-md bg-fuchsia-600/80 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 shadow-lg uppercase flex items-center gap-1">
                    <Layers className="w-3 h-3" /> Batch
                </span>
            )}
        </div>
        
        {/* Top Right: Status & Rating */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
            {/* Status Badge */}
            {anime.status && (
                <span className={`px-2 py-1 rounded-md backdrop-blur-md text-[10px] font-bold text-white border border-white/10 shadow-lg uppercase 
                    ${anime.status.toLowerCase().includes('ongoing') ? 'bg-green-500/80' : 'bg-blue-500/80'}`}>
                    {anime.status}
                </span>
            )}
            
            {/* Rating Badge */}
            {anime.rating && anime.rating !== 'N/A' && (
                 <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/90 backdrop-blur-md text-[10px] font-bold text-black shadow-lg">
                    <Star className="w-3 h-3 fill-black" /> {anime.rating}
                 </div>
            )}
        </div>

        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
           <h3 className="text-white font-bold text-sm md:text-base leading-snug line-clamp-2 mb-1 drop-shadow-md group-hover:text-violet-300 transition-colors">
             {displayTitle}
           </h3>
           
           {/* Hover Details: Type & Genre */}
           <div className="flex flex-wrap items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 h-0 group-hover:h-auto overflow-hidden mt-1">
              {anime.type && !isBatch && (
                 <span className="text-[10px] uppercase font-bold text-slate-200 bg-white/10 px-1.5 py-0.5 rounded flex items-center gap-1 border border-white/5">
                    {anime.type.toLowerCase().includes('movie') ? <Film className="w-3 h-3"/> : <Tv className="w-3 h-3"/>}
                    {anime.type}
                 </span>
              )}
              {anime.genres && anime.genres.length > 0 && (
                 <span className="text-[10px] font-bold text-slate-200 bg-white/10 px-1.5 py-0.5 rounded border border-white/5 truncate max-w-[120px]">
                    {anime.genres[0]}
                 </span>
              )}
           </div>
        </div>
      </div>
    </Link>
  );
};
