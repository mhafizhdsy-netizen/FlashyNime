
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/store';
import { AnimeCard } from '../components/AnimeCard';
import { Button } from '../components/ui';
import { Trash2, Bookmark, ArrowLeft } from 'lucide-react';
import { translations } from '../utils/translations';

export const Watchlist = () => {
  const { watchlist, removeFromWatchlist, language } = useAppStore();
  const navigate = useNavigate();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-[#020617] pt-28 px-6 pb-20">
       <div className="container mx-auto">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 pl-0 hover:pl-2 transition-all text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5 mr-2"/> {t.watch.goBack}
          </Button>

          <div className="flex items-center gap-4 mb-12 animate-fade-in-up">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-900/40">
                <Bookmark className="w-8 h-8 text-white fill-white" />
            </div>
            <div>
                <h1 className="text-4xl font-black text-white">{t.watchlist.title}</h1>
                <p className="text-slate-400">{watchlist.length} {t.watchlist.subtitle}</p>
            </div>
          </div>
          
          {watchlist.length === 0 ? (
             <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/5 animate-fade-in-up">
                <Bookmark className="w-16 h-16 mx-auto mb-6 text-slate-700" />
                <h3 className="text-2xl font-bold text-white mb-2">{t.watchlist.emptyTitle}</h3>
                <p className="text-slate-500">{t.watchlist.emptyDesc}</p>
             </div>
          ) : (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                {watchlist.map((anime) => (
                   <div key={anime.id} className="relative group">
                      <AnimeCard anime={anime} />
                      <button 
                        onClick={(e) => {
                           e.preventDefault();
                           removeFromWatchlist(anime.id);
                        }}
                        className="absolute top-3 right-3 bg-red-600/90 backdrop-blur p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all text-white hover:bg-red-700 hover:scale-110 shadow-lg z-20"
                        title="Remove from watchlist"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                ))}
             </div>
          )}
       </div>
    </div>
  );
};
