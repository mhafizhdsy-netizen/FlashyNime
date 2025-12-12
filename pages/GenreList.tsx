
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag, Sparkles } from 'lucide-react';
import { getGenres, getDonghuaGenres } from '../services/api';
import { Genre } from '../types';
import { Button, Spinner } from '../components/ui';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';

interface GenreListProps {
  type: 'anime' | 'donghua';
}

export const GenreList: React.FC<GenreListProps> = ({ type }) => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { language } = useAppStore();
  const t = translations[language];

  useEffect(() => {
    setLoading(true);
    const fetchFn = type === 'anime' ? getGenres : getDonghuaGenres;
    fetchFn()
      .then(res => setGenres(res.genres || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [type]);

  const handleGenreClick = (id: string) => {
    if (type === 'anime') {
      navigate(`/browse?genre=${id}`);
    } else {
      navigate(`/donghua/browse?genre=${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] pt-28 px-6 pb-20">
      <div className="container mx-auto max-w-6xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 pl-0 hover:pl-2 transition-all text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5 mr-2"/> {t.watch.goBack}
        </Button>

        <div className="mb-12 animate-fade-in-up">
           <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-2xl ${type === 'anime' ? 'bg-violet-500/20 text-violet-400' : 'bg-fuchsia-500/20 text-fuchsia-400'}`}>
                 <Tag className="w-8 h-8" />
              </div>
              <h1 className="text-4xl font-black text-white capitalize">{type === 'anime' ? t.genres.animeTitle : t.genres.donghuaTitle}</h1>
           </div>
           <p className="text-slate-400 text-lg">{t.genres.subtitle}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            {genres.map((genre, idx) => (
              <button
                key={genre.id}
                onClick={() => handleGenreClick(genre.id)}
                className={`
                  group relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 text-left
                  ${type === 'anime' 
                    ? 'bg-slate-900/50 border-white/5 hover:border-violet-500/50 hover:bg-violet-600/10' 
                    : 'bg-slate-900/50 border-white/5 hover:border-fuchsia-500/50 hover:bg-fuchsia-600/10'
                  }
                `}
                style={{ animationDelay: `${idx * 20}ms` }}
              >
                <div className="relative z-10 flex items-center justify-between">
                   <span className={`font-bold text-lg ${type === 'anime' ? 'text-slate-200 group-hover:text-violet-300' : 'text-slate-200 group-hover:text-fuchsia-300'}`}>
                      {genre.name}
                   </span>
                   <Sparkles className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${type === 'anime' ? 'text-violet-400' : 'text-fuchsia-400'}`} />
                </div>
                
                {/* Decorative background blob */}
                <div className={`absolute -bottom-4 -right-4 w-16 h-16 rounded-full blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100 ${type === 'anime' ? 'bg-violet-600/20' : 'bg-fuchsia-600/20'}`} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
