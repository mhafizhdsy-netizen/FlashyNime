
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, Tv, Film, Layers } from 'lucide-react';
import { Anime } from '../types';
import { Badge } from './ui';

interface AnimeCardProps {
  anime: Anime;
  isDonghua?: boolean; // Prop override
  isBatch?: boolean;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, isDonghua = false, isBatch = false }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Use anime property if available, otherwise fallback to prop
  const isContentDonghua = anime.isDonghua !== undefined ? anime.isDonghua : isDonghua;

  let linkPrefix = '/anime';
  if (isContentDonghua) linkPrefix = '/donghua/detail';
  if (isBatch) linkPrefix = '/batch';

  const displayTitle = (anime as any).english_title || anime.title;
  const animeId = anime.id || ''; 
  
  return (
    <Link to={`${linkPrefix}/${animeId}`} className="block group w-full h-full">
      <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden bg-slate-800 transition-all duration-500 group-hover:shadow-[0_0_25px_rgba(124,58,237,0.4)] group-hover:scale-[1.02] ring-1 ring-white/10 group-hover:ring-violet-500/50">
        
        {/* Loading Skeleton */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-slate-800 z-0">
             <div className="w-full h-full animate-pulse bg-gradient-to-b from-slate-700/50 to-slate-800/50" />
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
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

        {/* Gradient Overlay - Always there for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

        {/* Hover Reveal Overlay */}
        <div className="absolute inset-0 bg-violet-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
           <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-300 delay-75 shadow-lg shadow-black/20">
              <Play className="w-6 h-6 fill-white ml-1" />
           </div>
        </div>

        {/* Badges: Episode, Score, Type */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
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
            {anime.type && !isBatch && (
                <span className="px-2 py-1 rounded-md bg-violet-600/80 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 shadow-lg uppercase">
                    {anime.type}
                </span>
            )}
        </div>
        
        {anime.rating && anime.rating !== 'N/A' && (
             <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/90 backdrop-blur-md text-[10px] font-bold text-black shadow-lg">
                <Star className="w-3 h-3 fill-black" /> {anime.rating}
             </div>
        )}

        {/* Content Panel */}
        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
           <h3 className="text-white font-bold text-base leading-snug line-clamp-2 mb-1 drop-shadow-md group-hover:text-violet-300 transition-colors">
             {displayTitle}
           </h3>
           <div className="flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 h-0 group-hover:h-auto items-center mt-1">
              {anime.type && !isBatch && (
                 <span className="text-[10px] uppercase font-bold text-slate-300 bg-white/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                    {anime.type === 'Movie' ? <Film className="w-3 h-3"/> : <Tv className="w-3 h-3"/>}
                    {anime.type}
                 </span>
              )}
              {anime.status && (
                 <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${anime.status.toLowerCase() === 'ongoing' ? 'text-green-300 bg-green-500/20' : 'text-blue-300 bg-blue-500/20'}`}>
                    {anime.status}
                 </span>
              )}
           </div>
        </div>
      </div>
    </Link>
  );
};
