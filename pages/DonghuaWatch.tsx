
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, AlertCircle, Server, Download, ExternalLink, Play, Clock } from 'lucide-react';
import { getDonghuaEpisode, getDonghuaDetail, normalizeDonghua } from '../services/api';
import { EpisodeDetail, VideoServer } from '../types';
import { Button, Badge, Spinner } from '../components/ui';
import { useAppStore } from '../store/store';

export const DonghuaWatch = () => {
  const { id } = useParams<{ id: string }>();
  const [episode, setEpisode] = useState<EpisodeDetail | null>(null);
  const [currentStreamUrl, setCurrentStreamUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [autoPlay, setAutoPlay] = useState<boolean>(true);
  
  // Auto-play Logic
  const [durationMs, setDurationMs] = useState<number>(15 * 60 * 1000); // Default 15 mins for Donghua
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(10);
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const autoPlayRef = useRef(autoPlay);

  const navigate = useNavigate();
  const { updateHistory, addToHistory } = useAppStore();

  useEffect(() => {
    autoPlayRef.current = autoPlay;
  }, [autoPlay]);

  const parseDuration = (durStr: string) => {
    const match = durStr.match(/(\d+)/);
    if (match && match[0]) {
      return Math.max(10000, (parseInt(match[0]) * 60 * 1000) - 45000); // Subtract 45s for credits
    }
    return 15 * 60 * 1000;
  };

  const prepareUrl = (url: string) => {
      if (!url) return '';
      try {
        const u = new URL(url);
        if (!u.searchParams.has('autoplay')) {
            u.searchParams.set('autoplay', '1');
        }
        return u.toString();
      } catch (e) {
          return url + (url.includes('?') ? '&autoplay=1' : '?autoplay=1');
      }
  };

  useEffect(() => {
    const fetchEp = async () => {
      setLoading(true);
      setShowCountdown(false);
      setCountdownSeconds(10);
      startTimeRef.current = 0;

      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

      try {
        const res = await getDonghuaEpisode(id || '');
        if (res.episode) {
          setEpisode(res.episode);
          setCurrentStreamUrl(prepareUrl(res.episode.stream_link));
          startTimeRef.current = Date.now();
          
          if (res.episode.anime_id) {
            updateHistory(res.episode.anime_id, id || '');
            const animeRes = await getDonghuaDetail(res.episode.anime_id);
            if (animeRes?.detail) {
               addToHistory({
                   ...normalizeDonghua({...animeRes.detail, slug: res.episode.anime_id}),
                   id: res.episode.anime_id,
                   english_title: animeRes.detail.english_title
               }, res.episode.title); // Pass title for history card
               
               if (animeRes.detail.duration) {
                   setDurationMs(parseDuration(animeRes.detail.duration));
               }
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEp();

    return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [id]);

  // Timer logic - robust against durationMs updates
  useEffect(() => {
    if (loading || !currentStreamUrl || !episode?.next_episode) return;
    
    if (timerRef.current) clearTimeout(timerRef.current);

    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, durationMs - elapsed);

    timerRef.current = setTimeout(() => {
        if (autoPlayRef.current) {
            setShowCountdown(true);
            setCountdownSeconds(10);
        }
    }, remaining);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [loading, currentStreamUrl, durationMs, episode]);

  // Countdown logic
  useEffect(() => {
      if (showCountdown && countdownSeconds > 0) {
          countdownIntervalRef.current = setInterval(() => {
              setCountdownSeconds(prev => prev - 1);
          }, 1000);
      } else if (showCountdown && countdownSeconds === 0) {
           handleNextEpisode();
      }
      return () => { if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current); };
  }, [showCountdown, countdownSeconds]);

  const handleNextEpisode = () => {
      if (episode?.next_episode) {
          navigate(`/donghua/watch/${episode.next_episode}`);
      }
  };

  const cancelAutoPlay = () => {
      setShowCountdown(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  const handleServerClick = (server: VideoServer) => {
    setCurrentStreamUrl(prepareUrl(server.href));
    // Reset timer logic for new video
    setShowCountdown(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    startTimeRef.current = Date.now();
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Spinner /></div>;

  if (!episode) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
       <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
       <h2 className="text-white text-xl font-bold mb-4">Episode not found</h2>
       <Button onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-20">
      <div className="w-full bg-black pt-20 md:pt-24 pb-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-b border-white/5 relative group">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
           <div className="relative w-full aspect-video bg-[#0f172a] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <iframe 
                src={currentStreamUrl}
                className="w-full h-full border-0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />

              {showCountdown && episode.next_episode && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in">
                    <h3 className="text-slate-300 text-lg mb-2">Up Next</h3>
                    <div className="text-3xl font-black text-white mb-6">Episode {parseInt(episode.title.match(/\d+/)?.[0] || '0') + 1}</div>
                    
                    <div className="relative flex items-center justify-center mb-8">
                        <svg className="w-20 h-20 rotate-[-90deg]">
                            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-800" />
                            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-violet-500 transition-all duration-1000 ease-linear" strokeDasharray="226" strokeDashoffset={226 - (226 * countdownSeconds) / 10} />
                        </svg>
                        <span className="absolute text-2xl font-bold">{countdownSeconds}</span>
                    </div>

                    <div className="flex gap-4">
                        <Button variant="secondary" onClick={cancelAutoPlay} className="rounded-full px-8">Cancel</Button>
                        <Button onClick={handleNextEpisode} className="rounded-full px-8"><Play className="w-4 h-4 mr-2 fill-white" /> Play Now</Button>
                    </div>
                </div>
              )}
           </div>
           
           <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <Button variant="secondary" onClick={() => navigate(`/donghua/detail/${episode.anime_id}`)} className="gap-2">
                    <ChevronLeft className="w-4 h-4"/> <span className="hidden sm:inline">Details</span>
                </Button>
                <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-xl border border-white/5">
                   <div className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${autoPlay ? 'bg-violet-600' : 'bg-slate-700'}`} onClick={() => setAutoPlay(!autoPlay)}>
                      <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${autoPlay ? 'translate-x-4' : 'translate-x-0'}`} />
                   </div>
                   <span className="text-sm font-bold text-slate-300 select-none cursor-pointer" onClick={() => setAutoPlay(!autoPlay)}>Auto Play</span>
                </div>
              </div>

              <div className="flex gap-4">
                 <Button 
                   variant="secondary" 
                   disabled={!episode.prev_episode}
                   onClick={() => navigate(`/donghua/watch/${episode.prev_episode}`)}
                   className="w-12 h-12 p-0 rounded-full"
                 >
                    <ChevronLeft className="w-5 h-5" />
                 </Button>
                 <Button 
                   variant="primary" 
                   disabled={!episode.next_episode}
                   onClick={() => navigate(`/donghua/watch/${episode.next_episode}`)}
                   className="w-12 h-12 p-0 rounded-full"
                 >
                    <ChevronRight className="w-5 h-5" />
                 </Button>
              </div>
           </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 md:px-6 mt-8 animate-fade-in-up">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-6">
              <div>
                 <h1 className="text-2xl md:text-3xl font-bold mb-2 text-glow">{episode.title}</h1>
              </div>

              {episode.servers && episode.servers.length > 0 && (
                <div className="glass-panel p-6 rounded-2xl">
                   <h3 className="font-bold mb-4 flex items-center gap-2 text-violet-300">
                      <Server className="w-5 h-5" /> Switch Server
                   </h3>
                   <div className="flex flex-wrap gap-2">
                      {episode.servers[0].serverList.map((srv, sIdx) => (
                        <Badge 
                          key={sIdx} 
                          onClick={() => handleServerClick(srv)}
                          className="cursor-pointer hover:bg-violet-600 transition-colors bg-slate-800 border-white/10 px-3 py-2"
                        >
                          {srv.title}
                        </Badge>
                      ))}
                   </div>
                </div>
              )}

              {episode.download_links && episode.download_links.length > 0 && (
                <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 p-6 rounded-2xl border border-cyan-500/20">
                   <h3 className="font-bold mb-6 flex items-center gap-2 text-cyan-300 text-lg">
                      <Download className="w-5 h-5" /> Download Episode
                   </h3>
                   <div className="grid gap-4">
                      {episode.download_links.map((quality, idx) => (
                        <div key={idx} className="bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center gap-4">
                           <div className="min-w-[120px]">
                              <span className="text-lg font-black text-cyan-500 block leading-tight">{quality.quality}</span>
                           </div>
                           <div className="flex flex-wrap gap-2 flex-1">
                              {quality.links.map((link, lIdx) => (
                                <a key={lIdx} href={link.link} target="_blank" rel="noopener noreferrer">
                                   <Badge className="bg-cyan-950 text-cyan-300 border-cyan-800 hover:bg-cyan-600 hover:text-white cursor-pointer py-2 px-3">
                                      {link.title} <ExternalLink className="w-3 h-3 ml-1 opacity-50"/>
                                   </Badge>
                                </a>
                              ))}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
