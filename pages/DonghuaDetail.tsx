
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, Calendar, Clock, Star, Bookmark, Share2, Check, Copy, X, Facebook, Twitter, RefreshCw, Trash2, ArrowLeft, ChevronDown } from 'lucide-react';
import { getDonghuaDetail, normalizeDonghua } from '../services/api';
import { AnimeDetail as AnimeDetailType } from '../types';
import { Button, Badge, Skeleton } from '../components/ui';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';

export const DonghuaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [anime, setAnime] = useState<AnimeDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'add' | 'remove' }>({ show: false, message: '', type: 'add' });
  
  const currentId = anime?.id || id || '';
  const inWatchlist = useAppStore((state) => state.watchlist.some((a) => a.id === currentId));
  const { addToWatchlist, removeFromWatchlist, language } = useAppStore();
  const t = translations[language];

  const shareUrl = id ? `https://flashynime.vercel.app/#/donghua/detail/${id}` : '';

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError(false);
    try {
      const res = await getDonghuaDetail(id);
      if (res?.detail) {
        setAnime(res.detail);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const toggleWatchlist = () => {
    if (!anime) return;
    if (inWatchlist) {
      removeFromWatchlist(anime.id || id!);
      setToast({ show: true, message: t.details.successRemoved, type: 'remove' });
    } else {
      const safeId = anime.id || id!; 
      const animeToSave = {
        ...normalizeDonghua({...anime, slug: safeId}),
        id: safeId,
        english_title: anime.english_title, 
        isDonghua: true
      };
      
      addToWatchlist(animeToSave);
      setToast({ show: true, message: t.details.successAdded, type: 'add' });
    }
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020617] pt-32 px-6 container mx-auto">
       <div className="flex flex-col md:flex-row gap-12">
          <Skeleton className="w-full md:w-[320px] h-[480px] rounded-2xl" />
          <div className="flex-1 space-y-6">
             <Skeleton className="w-3/4 h-12 rounded-xl" />
             <Skeleton className="w-1/3 h-8 rounded-xl" />
             <Skeleton className="w-full h-40 rounded-xl" />
          </div>
       </div>
    </div>
  );

  if (error || !anime) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
       <h2 className="text-3xl font-bold text-white mb-4">Donghua Not Found</h2>
       <p className="text-slate-400 mb-6">Could not load data for ID: {id}</p>
       <div className="flex gap-4">
         <Link to="/donghua"><Button variant="secondary">{t.watch.goBack}</Button></Link>
         <Button onClick={fetchDetail} variant="primary"><RefreshCw className="w-4 h-4 mr-2"/> {t.home.retry}</Button>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-20 overflow-x-hidden">
      {/* Back Button */}
      <div className="absolute top-24 left-6 z-40 md:left-12">
        <Button variant="glass" onClick={() => navigate(-1)} className="rounded-full w-12 h-12 p-0 shadow-xl border-white/20 bg-black/40">
           <ArrowLeft className="w-6 h-6 text-white" />
        </Button>
      </div>

      {/* Toast Notification */}
      <div className={`fixed top-24 right-4 md:right-10 z-50 transition-all duration-500 ease-out transform ${toast.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
          <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-4 flex items-center gap-4 pr-8">
              <div className={`p-2 rounded-full ${toast.type === 'add' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {toast.type === 'add' ? <Check className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
              </div>
              <div>
                  <h4 className={`font-bold text-sm ${toast.type === 'add' ? 'text-green-400' : 'text-red-400'}`}>
                    {toast.type === 'add' ? 'Success' : 'Removed'}
                  </h4>
                  <p className="text-slate-300 text-xs font-medium">{toast.message}</p>
              </div>
          </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md relative animate-scale-in shadow-2xl">
                <button onClick={() => setShowShareModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>
                
                <h3 className="text-xl font-bold text-white mb-2">{t.details.shareTitle}</h3>
                <p className="text-slate-400 text-sm mb-6">{t.details.shareDesc} {anime.title}</p>
                
                <div className="flex justify-center gap-6 mb-8">
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                        <div className="w-12 h-12 rounded-full bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2] group-hover:bg-[#1877F2] group-hover:text-white transition-all">
                            <Facebook className="w-6 h-6 fill-current" />
                        </div>
                        <span className="text-xs text-slate-400 group-hover:text-white">Facebook</span>
                    </a>
                    <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(anime.title)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                        <div className="w-12 h-12 rounded-full bg-[#1DA1F2]/10 flex items-center justify-center text-[#1DA1F2] group-hover:bg-[#1DA1F2] group-hover:text-white transition-all">
                            <Twitter className="w-6 h-6 fill-current" />
                        </div>
                        <span className="text-xs text-slate-400 group-hover:text-white">Twitter</span>
                    </a>
                    <a href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                        <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-all">
                            <Share2 className="w-6 h-6" />
                        </div>
                        <span className="text-xs text-slate-400 group-hover:text-white">WhatsApp</span>
                    </a>
                </div>

                <div className="bg-black/50 p-1.5 rounded-xl border border-white/5 flex items-center gap-2 pl-4">
                    <span className="text-slate-400 text-sm truncate flex-1 font-mono">{shareUrl}</span>
                    <Button onClick={handleCopy} className="h-9 px-4 min-w-[90px]">
                        <Copy className="w-3 h-3 mr-2" /> {t.details.copy}
                    </Button>
                </div>
            </div>
        </div>
      )}

      {/* Immersive Parallax Header */}
      <div className="relative w-full h-[65vh] overflow-hidden">
        <img 
           src={anime.poster} 
           alt={anime.title} 
           loading="lazy"
           className="w-full h-full object-cover blur-md opacity-40 scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/40 to-transparent" />
      </div>

      <div className="container mx-auto px-6 -mt-80 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Poster Column */}
          <div className="flex-shrink-0 w-full max-w-[320px] mx-auto lg:mx-0 space-y-6 animate-fade-in-up">
             <div className="relative group rounded-2xl overflow-hidden shadow-2xl shadow-violet-900/30 border border-white/10 bg-slate-800">
               <img 
                 src={anime.poster} 
                 alt={anime.title} 
                 loading="lazy"
                 className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
               />
               
               {inWatchlist && (
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white p-2 rounded-full shadow-lg shadow-emerald-600/40 animate-scale-in">
                    <Check className="w-5 h-5" />
                  </div>
               )}
             </div>
             
             {anime.episode_list && anime.episode_list.length > 0 && (
                <Link to={`/donghua/watch/${anime.episode_list[anime.episode_list.length - 1].id}`} className="block">
                  <Button className="w-full h-14 text-lg rounded-xl shadow-[0_0_20px_rgba(124,58,237,0.4)] animate-pulse-glow">
                     <Play className="fill-white w-5 h-5 mr-2" /> {t.details.startWatching}
                  </Button>
                </Link>
             )}
             
             <div className="grid grid-cols-2 gap-3">
                 <button 
                   onClick={toggleWatchlist} 
                   className={`
                      relative overflow-hidden inline-flex items-center justify-center rounded-xl text-sm font-bold tracking-wide transition-all duration-300 focus-visible:outline-none h-11 px-6 active:scale-95 w-full
                      ${inWatchlist 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20 ring-1 ring-emerald-500/50' 
                        : 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700'
                      }
                   `}
                 >
                    {inWatchlist ? (
                      <><Check className="w-4 h-4 mr-2" /> {t.details.saved}</>
                    ) : (
                      <><Bookmark className="w-4 h-4 mr-2" /> {t.details.saveToList}</>
                    )}
                 </button>
                 <Button variant="secondary" className="w-full" onClick={() => setShowShareModal(true)}>
                    <Share2 className="w-4 h-4 mr-2" /> {t.details.share}
                 </Button>
             </div>
          </div>

          {/* Details Column */}
          <div className="flex-1 pt-10 lg:pt-32 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
             <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-2 text-glow">
                {anime.english_title || anime.title}
             </h1>
             <p className="text-slate-400 text-lg mb-8 font-bold tracking-wide">
                {anime.japanese_title || anime.title}
             </p>

             <div className="flex flex-wrap gap-4 mb-8">
                {anime.score && <Badge variant="hot" className="text-sm px-3 py-1"><Star className="w-3 h-3 mr-1 fill-white"/> {anime.score}</Badge>}
                <Badge className="text-sm px-3 py-1"><Calendar className="w-3 h-3 mr-1"/> {anime.release_date || 'Unknown'}</Badge>
                <Badge className="text-sm px-3 py-1"><Clock className="w-3 h-3 mr-1"/> {anime.duration || 'N/A'}</Badge>
                <Badge className="text-sm px-3 py-1 bg-violet-500/20 text-violet-200 border-violet-500/30">{anime.type}</Badge>
                <Badge className="text-sm px-3 py-1 bg-green-500/20 text-green-200 border-green-500/30">{anime.status}</Badge>
             </div>

             <div className="space-y-8">
                {/* Synopsis Dropdown */}
                <div className="glass-panel rounded-2xl overflow-hidden transition-all duration-300 border border-white/5 bg-slate-900/40">
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full flex items-center justify-between p-6 text-left transition-colors"
                    >
                        <h3 className="text-xl font-bold text-white transition-colors">{t.details.synopsis}</h3>
                        <div className={`p-2 rounded-full bg-white/5 transition-all ${isExpanded ? 'rotate-180' : ''}`}>
                            <ChevronDown className="w-5 h-5 text-slate-300" />
                        </div>
                    </button>
                    
                    <div className={`px-6 text-slate-300 leading-relaxed text-lg transition-all duration-500 ease-in-out ${isExpanded ? 'opacity-100 max-h-[1000px] pb-8' : 'opacity-0 max-h-0 pb-0 overflow-hidden'}`}>
                       <div className="pt-2 border-t border-white/5">
                          <p>{anime.synopsis}</p>
                       </div>
                    </div>
                </div>

                <div>
                   <h3 className="text-lg font-bold mb-3 text-slate-300">{t.details.genres}</h3>
                   <div className="flex flex-wrap gap-2">
                      {anime.genres?.map((g) => (
                         <Link key={g} to={`/donghua/browse?genre=${g.toLowerCase()}`}>
                           <Badge variant="outline" className="px-4 py-2 hover:bg-violet-600 hover:border-violet-600 cursor-pointer transition-colors text-sm">{g}</Badge>
                         </Link>
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-t border-white/5">
                   {[
                     { label: t.details.studio, value: anime.studio },
                     { label: t.details.producers, value: anime.producer },
                     { label: t.details.totalEpisodes, value: anime.total_episodes },
                     { label: t.details.duration, value: anime.duration }
                   ].map((item, idx) => (
                     <div key={idx}>
                        <span className="block text-slate-500 text-xs uppercase tracking-wider font-bold mb-1">{item.label}</span>
                        <span className="text-slate-200 font-medium">{item.value || 'Unknown'}</span>
                     </div>
                   ))}
                </div>

                <div className="pt-8">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-bold">{t.details.episodes}</h3>
                      <div className="text-sm text-slate-400">{anime.episode_list?.length} {t.details.available}</div>
                   </div>
                   
                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {anime.episode_list?.map((ep) => (
                         <Link key={ep.id} to={`/donghua/watch/${ep.id}`}>
                            <div className="bg-slate-800/50 hover:bg-violet-600 hover:shadow-lg hover:shadow-violet-600/30 border border-white/5 hover:border-violet-500 transition-all p-4 rounded-xl group text-center">
                               <div className="font-bold text-white text-sm truncate">{ep.title}</div>
                            </div>
                         </Link>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
