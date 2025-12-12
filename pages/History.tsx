
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/store';
import { AnimeCard } from '../components/AnimeCard';
import { Button } from '../components/ui';
import { Clock, Trash2, ArrowLeft } from 'lucide-react';
import { translations } from '../utils/translations';

export const History = () => {
  const { history, clearHistory, removeFromHistory, language } = useAppStore();
  const navigate = useNavigate();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-[#020617] pt-28 px-6 pb-20">
       <div className="container mx-auto">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 pl-0 hover:pl-2 transition-all text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5 mr-2"/> {t.watch.goBack}
          </Button>

          <div className="flex items-center justify-between mb-12 animate-fade-in-up">
            <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg shadow-blue-900/40">
                    <Clock className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-white">{t.history.title}</h1>
                    <p className="text-slate-400">{t.history.subtitle}</p>
                </div>
            </div>
            {history.length > 0 && (
                <Button variant="outline" onClick={clearHistory} className="text-red-400 border-red-900/50 hover:bg-red-900/20 hover:text-red-300">
                    <Trash2 className="w-4 h-4 mr-2" /> {t.history.clearAll}
                </Button>
            )}
          </div>
          
          {history.length === 0 ? (
             <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/5 animate-fade-in-up">
                <Clock className="w-16 h-16 mx-auto mb-6 text-slate-700" />
                <h3 className="text-2xl font-bold text-white mb-2">{t.history.emptyTitle}</h3>
                <p className="text-slate-500">{t.history.emptyDesc}</p>
             </div>
          ) : (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                {history.map((anime) => (
                   <div key={anime.id} className="relative group">
                      <AnimeCard anime={anime} />
                      <button 
                        onClick={(e) => {
                           e.preventDefault();
                           removeFromHistory(anime.id);
                        }}
                        className="absolute top-3 right-3 bg-red-600/90 backdrop-blur p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all text-white hover:bg-red-700 hover:scale-110 shadow-lg z-20"
                        title="Remove from history"
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
