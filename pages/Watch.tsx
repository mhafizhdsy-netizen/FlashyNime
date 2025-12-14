
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Download, MessageSquare, AlertCircle, Server, FileDown, ExternalLink, Settings, Play, X, Clock, ArrowLeft } from 'lucide-react';
import { getEpisodeDetail, getServerEmbed, getAnimeDetail, getBatchDetail, normalizeAnime } from '../services/api';
import { EpisodeDetail, VideoServer, BatchDetail } from '../types';
import { Button, Badge, Spinner } from '../components/ui';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';

export const Watch = () => {
  const { id } = useParams<{ id: string }>();
  const [episode, setEpisode] = useState<EpisodeDetail | null>(null);
  const [batch, setBatch] = useState<BatchDetail | null>(null);
  const [currentStreamUrl, setCurrentStreamUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [serverLoading, setServerLoading] = useState(false);
  const [autoPlay, setAutoPlay] = useState<boolean>(true);
  
  // Auto-play Logic State
  const [durationMs, setDurationMs] = useState<number>(24 * 60 * 1000); // Default 24 mins
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(10);
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const autoPlayRef = useRef(autoPlay);

  const navigate = useNavigate();
  const { updateHistory, addToHistory, language } = useAppStore();
  const t = translations[language];

  // Sync autoPlay state to ref to use in timeout without resetting the effect
  useEffect(() => {
    autoPlayRef.current = autoPlay;
  }, [autoPlay]);

  // Helper to parse duration string (e.g. "24 min" -> ms)
  const parseDuration = (durStr: string) => {
    const match = durStr.match(/(\d+)/);
    if (match && match[0]) {
      // Subtract 1 minute roughly for credits/buffer to trigger auto-play suggestion earlier
      return Math.max(10000, (parseInt(match[0]) * 60 * 1000) - 60000); 
    }
    return 24 * 60 * 1000;
  };

  // Helper to append autoplay to iframe URL
  const prepareUrl = (url: string) => {
      if (!url) return '';
      try {
        const u = new URL(url);
        // Avoid duplicates
        if (!u.searchParams.has('autoplay')) {
            u.searchParams.set('autoplay', '1');
        }
        return u.toString();
      } catch (e) {
          return url + (url.includes('?') ? '&autoplay=1' : '?autoplay=1');
      }
  };

  // Fetch Episode Data
  useEffect(() => {
    const fetchEp = async () => {
      setLoading(true);
      setShowCountdown(false);
      setCountdownSeconds(10);
      startTimeRef.current = 0; // Reset start time for new episode

      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

      try {
        const res = await getEpisodeDetail(id || '');
        if (res.episode) {
          setEpisode(res.episode);
          setCurrentStreamUrl(prepareUrl(res.episode.stream_link)); // Set default
          startTimeRef.current = Date.now(); // Mark start time

          if (res.episode.anime_id) {
            // Update mapping so "Continue Watching" knows where to go
            updateHistory(res.episode.anime_id, id || '');
            
            // Fetch Anime Detail to populate history list with rich metadata
            fetchExtraInfo(res.episode.anime_id, res.episode.title);
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

  // Fetch Batch & Duration Data
  const fetchExtraInfo = async (animeId: string, currentEpisodeTitle: string) => {
    try {
        const animeRes = await getAnimeDetail(animeId);
        
        if (animeRes?.detail) {
            const animeForHistory = {
                ...normalizeAnime(animeRes.detail),
                id: animeId,
                english_title: animeRes.detail.english_title
            };
            
            // Pass the current episode title (e.g. "Episode 5") to history
            // so the card displays the *last watched* episode number
            addToHistory(animeForHistory, currentEpisodeTitle);
            
             // Set duration for auto-play timer
            if (animeRes.detail.duration) {
                setDurationMs(parseDuration(animeRes.detail.duration));
            }

            if (animeRes.detail.batch_link?.id) {
                const batchRes = await getBatchDetail(animeRes.detail.batch_link.id);
                if (batchRes.batch) {
                    setBatch(batchRes.batch);
                }
            }
        }
    } catch (e) {
        console.error("Failed to fetch extra info", e);
    }
  };

  // Start "End of Episode" Simulation Timer
  // Uses durationMs but calculates remaining time based on startTimeRef to avoid resets
  useEffect(() => {
    if (loading || !currentStreamUrl || !episode?.next_episode) return;
    
    if (timerRef.current) clearTimeout(timerRef.current);

    // Calculate time elapsed since video started loading
    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, durationMs - elapsed);

    // Set new timer
    timerRef.current = setTimeout(() => {
        // Check ref inside callback to avoid stale closure issues
        if (autoPlayRef.current) {
            setShowCountdown(true);
            setCountdownSeconds(10);
        }
    }, remaining);

    return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [loading, currentStreamUrl, durationMs, episode]); // Removed autoPlay from deps

  // Handle Countdown Decrement
  useEffect(() => {
      if (showCountdown && countdownSeconds > 0) {
          countdownIntervalRef.current = setInterval(() => {
              setCountdownSeconds(prev => prev - 1);
          }, 1000);
      } else if (showCountdown && countdownSeconds === 0) {
           handleNextEpisode();
      }

      return () => {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      };
  }, [showCountdown, countdownSeconds]);

  const handleNextEpisode = () => {
      if (episode?.next_episode) {
          navigate(`/watch/${episode.next_episode}`);
      }
  };

  const cancelAutoPlay = () => {
      setShowCountdown(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  const handleServerClick = async (server: VideoServer) => {
    setServerLoading(true);
    // Reset auto-play timers on server switch
    setShowCountdown(false); 
    if (timerRef.current) clearTimeout(timerRef.current);
    startTimeRef.current = Date.now(); // Reset start time for new server

    try {
      const embedUrl = await getServerEmbed(server.serverId);
      if (embedUrl) {
        setCurrentStreamUrl(prepareUrl(embedUrl));
      }
    } catch (e) {
      console.error("Failed to load server", e);
    } finally {
      setServerLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Spinner /></div>;

  if (!episode) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
       <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
       <h2 className="text-white text-xl font-bold mb-4">{t.watch.episodeNotFound}</h2>
       <Button onClick={() => navigate(-1)}>{t.watch.goBack}</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-20">
      
      {/* Floating Back Button */}
      <div className="absolute top-24 left-4 z-40 md:left-8">
        <Button 
            variant="glass" 
            onClick={() => navigate(-1)} 
            className="rounded-full w-10 h-10 md:w-12 md:h-12 p-0 shadow-xl border-white/10 bg-black/50 hover:bg-black/70 backdrop-blur-md transition-transform hover:scale-110"
            title={t.watch.goBack}
        >
           <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </Button>
      </div>

      {/* Theater Mode Player */}
      <div className="w-full bg-black pt-24 pb-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-b border-white/5 relative group">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
           <div className="relative w-full aspect-video bg-[#0f172a] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              {serverLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Spinner />
                </div>
              ) : (
                <>
                    <iframe 
                    src={currentStreamUrl}
                    className="w-full h-full border-0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                    
                    {/* Next Episode Countdown Overlay */}
                    {showCountdown && episode.next_episode && (
                        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in">
                            <h3 className="text-slate-300 text-lg mb-2">{t.watch.upNext}</h3>
                            <div className="text-3xl md:text-5xl font-black text-white mb-6 text-center max-w-2xl leading-tight px-4">
                                Episode {parseInt(episode.title) + 1}
                            </div>
                            
                            <div className="relative flex items-center justify-center mb-8">
                                <svg className="w-20 h-20 rotate-[-90deg]">
                                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-800" />
                                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-violet-500 transition-all duration-1000 ease-linear" strokeDasharray="226" strokeDashoffset={226 - (226 * countdownSeconds) / 10} />
                                </svg>
                                <span className="absolute text-2xl font-bold">{countdownSeconds}</span>
                            </div>

                            <div className="flex gap-4">
                                <Button variant="secondary" onClick={cancelAutoPlay} className="rounded-full px-8">
                                    {t.watch.cancel}
                                </Button>
                                <Button onClick={handleNextEpisode} className="rounded-full px-8">
                                    <Play className="w-4 h-4 mr-2 fill-white" /> {t.watch.playNow}
                                </Button>
                            </div>
                        </div>
                    )}
                </>
              )}
           </div>
           
           {/* Control Bar */}
           <div className="flex flex-row justify-between items-center mt-6 gap-4">
              
              {/* Auto Play Toggle */}
              <div className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-full border border-white/5 transition-all cursor-pointer group/autoplay" onClick={() => setAutoPlay(!autoPlay)}>
                   <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 ${autoPlay ? 'bg-green-500' : 'bg-slate-600'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${autoPlay ? 'translate-x-4' : 'translate-x-0'}`} />
                   </div>
                   <span className="text-xs font-bold text-slate-400 group-hover/autoplay:text-white uppercase tracking-wider select-none hidden sm:inline">
                        {t.watch.autoPlay}
                   </span>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-3">
                 <Button 
                   variant="secondary" 
                   disabled={!episode.prev_episode}
                   onClick={() => navigate(`/watch/${episode.prev_episode}`)}
                   className="rounded-full h-10 w-10 md:w-auto md:px-5 border-white/5 bg-white/5 hover:bg-white/10 p-0 md:gap-2"
                   title="Previous Episode"
                 >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">Prev</span>
                 </Button>

                 <Button 
                   variant="primary" 
                   disabled={!episode.next_episode}
                   onClick={() => navigate(`/watch/${episode.next_episode}`)}
                   className="rounded-full h-10 w-10 md:w-auto md:px-5 shadow-lg shadow-violet-600/20 bg-gradient-to-r from-violet-600 to-fuchsia-600 border-none p-0 md:gap-2 hover:scale-105"
                   title="Next Episode"
                 >
                    <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">Next</span>
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
                 <p className="text-slate-400 font-mono text-sm flex items-center gap-4">
                    <span>ID: {episode.id}</span>
                    {durationMs && <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> ~{Math.round(durationMs / 60000)}m</span>}
                 </p>
              </div>

              {/* Server List */}
              {episode.servers && episode.servers.length > 0 && (
                <div className="glass-panel p-6 rounded-2xl">
                   <h3 className="font-bold mb-4 flex items-center gap-2 text-violet-300">
                      <Server className="w-5 h-5" /> {t.watch.switchServer}
                   </h3>
                   <div className="space-y-4">
                      {episode.servers.map((quality, idx) => (
                        <div key={idx}>
                          <h4 className="text-xs text-slate-500 uppercase font-bold mb-2">{quality.title}</h4>
                          <div className="flex flex-wrap gap-2">
                            {quality.serverList.map((srv, sIdx) => (
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
                      ))}
                   </div>
                </div>
              )}

              {/* Episode Download Section */}
              {episode.download_links && episode.download_links.length > 0 && (
                <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 p-6 rounded-2xl border border-cyan-500/20">
                   <h3 className="font-bold mb-6 flex items-center gap-2 text-cyan-300 text-lg">
                      <Download className="w-5 h-5" /> {t.watch.download}
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

           <div className="lg:col-span-1 space-y-6">
              {/* Batch Download Section */}
              {batch && batch.download_links && batch.download_links.length > 0 && (
                  <div className="bg-gradient-to-br from-fuchsia-900/20 to-purple-900/20 p-6 rounded-2xl border border-fuchsia-500/20 shadow-lg shadow-fuchsia-900/10">
                     <h3 className="font-bold mb-2 flex items-center gap-2 text-fuchsia-300 text-lg">
                        <FileDown className="w-5 h-5" /> {t.watch.batchDownload}
                     </h3>
                     <p className="text-sm text-slate-400 mb-6">{t.watch.batchDesc}</p>
                     
                     <div className="space-y-4">
                        {batch.download_links.map((quality, idx) => (
                            <div key={idx} className="space-y-2">
                                <span className="text-xs font-bold text-fuchsia-200/70 block uppercase tracking-wider">{quality.quality}</span>
                                <div className="flex flex-wrap gap-2">
                                    {quality.links.map((link, lIdx) => (
                                        <a key={lIdx} href={link.link} target="_blank" rel="noopener noreferrer">
                                            <Badge className="bg-fuchsia-950 text-fuchsia-300 border-fuchsia-800 hover:bg-fuchsia-600 hover:text-white cursor-pointer transition-colors">
                                                {link.title}
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
