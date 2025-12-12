
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Code, Database, Shield, Globe } from 'lucide-react';
import { Button } from '../components/ui';

export const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] pt-28 px-6 pb-20">
      <div className="container mx-auto max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8 pl-0 hover:pl-2 transition-all text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5 mr-2"/> Back
        </Button>

        <div className="text-center mb-16 animate-fade-in-up">
           <div className="inline-flex items-center gap-3 mb-6 p-4 rounded-2xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30">
              <Zap className="w-10 h-10 text-violet-400 fill-violet-400" />
              <span className="text-4xl font-black tracking-tighter text-white">
                 Flashy<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Nime</span>
              </span>
           </div>
           <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
             A next-generation anime streaming platform built for speed, aesthetics, and user experience.
           </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-20 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
           <div className="bg-slate-900/50 border border-white/5 p-8 rounded-3xl backdrop-blur-sm">
              <Shield className="w-8 h-8 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Privacy Focused</h3>
              <p className="text-slate-400 leading-relaxed">
                 We do not track your personal data or store any files on our servers. All content is provided by third-party non-affiliated providers.
              </p>
           </div>
           <div className="bg-slate-900/50 border border-white/5 p-8 rounded-3xl backdrop-blur-sm">
              <Globe className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Global Content</h3>
              <p className="text-slate-400 leading-relaxed">
                 Access a massive library of Anime, Donghua, and Movies sourced from reliable providers, updated in real-time.
              </p>
           </div>
        </div>

        {/* API Documentation Section */}
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
           <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-fuchsia-500/10 rounded-xl border border-fuchsia-500/20">
                 <Code className="w-6 h-6 text-fuchsia-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">API Documentation</h2>
           </div>

           <div className="space-y-12">
              <div className="prose prose-invert max-w-none text-slate-300">
                 <p>
                    FlashyNime uses a custom scraping API that interfaces with <strong>Samehadaku</strong>, <strong>Donghua sources</strong>, and others. 
                    Developers can use the following endpoints to access our data.
                 </p>
                 <div className="bg-slate-950 rounded-xl p-4 border border-white/10 font-mono text-sm text-slate-400 mb-6">
                    Base URL: <span className="text-violet-400">https://www.sankavollerei.com</span>
                 </div>
              </div>

              {/* Anime Section */}
              <div className="space-y-4">
                 <h3 className="text-2xl font-bold text-white mb-4 pl-2 border-l-4 border-violet-500">Anime Endpoints (Samehadaku)</h3>

                 {/* Home */}
                 <div className="bg-slate-900/80 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="bg-slate-800/50 px-6 py-4 border-b border-white/5 flex items-center gap-3">
                       <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">GET</span>
                       <code className="text-sm font-bold text-white">/anime/samehadaku/home</code>
                    </div>
                    <div className="p-6">
                       <p className="text-slate-400 text-sm mb-4">Fetches the aggregated home page data including recent releases, popular anime, movies, and completed series.</p>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Database className="w-3 h-3" /> Returns: JSON Object (HomeData)
                       </div>
                    </div>
                 </div>

                 {/* Ongoing */}
                 <div className="bg-slate-900/80 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="bg-slate-800/50 px-6 py-4 border-b border-white/5 flex items-center gap-3">
                       <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">GET</span>
                       <code className="text-sm font-bold text-white">/anime/samehadaku/ongoing?page={'{page}'}</code>
                    </div>
                    <div className="p-6">
                       <p className="text-slate-400 text-sm mb-4">Get a list of currently airing anime sorted by popularity.</p>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Database className="w-3 h-3" /> Returns: JSON Array (AnimeList)
                       </div>
                    </div>
                 </div>

                 {/* Completed */}
                 <div className="bg-slate-900/80 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="bg-slate-800/50 px-6 py-4 border-b border-white/5 flex items-center gap-3">
                       <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">GET</span>
                       <code className="text-sm font-bold text-white">/anime/samehadaku/completed?page={'{page}'}</code>
                    </div>
                    <div className="p-6">
                       <p className="text-slate-400 text-sm mb-4">Get a list of completed anime series sorted by latest update.</p>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Database className="w-3 h-3" /> Returns: JSON Array (AnimeList)
                       </div>
                    </div>
                 </div>

                 {/* Movies */}
                 <div className="bg-slate-900/80 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="bg-slate-800/50 px-6 py-4 border-b border-white/5 flex items-center gap-3">
                       <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">GET</span>
                       <code className="text-sm font-bold text-white">/anime/samehadaku/movies?page={'{page}'}</code>
                    </div>
                    <div className="p-6">
                       <p className="text-slate-400 text-sm mb-4">Get a list of anime movies.</p>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Database className="w-3 h-3" /> Returns: JSON Array (AnimeList)
                       </div>
                    </div>
                 </div>

                 {/* Popular */}
                 <div className="bg-slate-900/80 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="bg-slate-800/50 px-6 py-4 border-b border-white/5 flex items-center gap-3">
                       <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">GET</span>
                       <code className="text-sm font-bold text-white">/anime/samehadaku/popular?page={'{page}'}</code>
                    </div>
                    <div className="p-6">
                       <p className="text-slate-400 text-sm mb-4">Get the most popular anime of the season.</p>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Database className="w-3 h-3" /> Returns: JSON Array (AnimeList)
                       </div>
                    </div>
                 </div>

                 {/* Recent */}
                 <div className="bg-slate-900/80 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="bg-slate-800/50 px-6 py-4 border-b border-white/5 flex items-center gap-3">
                       <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">GET</span>
                       <code className="text-sm font-bold text-white">/anime/samehadaku/recent?page={'{page}'}</code>
                    </div>
                    <div className="p-6">
                       <p className="text-slate-400 text-sm mb-4">Get the latest released episodes.</p>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Database className="w-3 h-3" /> Returns: JSON Array (AnimeList)
                       </div>
                    </div>
                 </div>

                 {/* Schedule */}
                 <div className="bg-slate-900/80 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="bg-slate-800/50 px-6 py-4 border-b border-white/5 flex items-center gap-3">
                       <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">GET</span>
                       <code className="text-sm font-bold text-white">/anime/samehadaku/schedule</code>
                    </div>
                    <div className="p-6">
                       <p className="text-slate-400 text-sm mb-4">Get the full weekly release schedule.</p>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Database className="w-3 h-3" /> Returns: JSON Object (ScheduleDay[])
                       </div>
                    </div>
                 </div>

                 {/* Genres */}
                 <div className="bg-slate-900/80 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="bg-slate-800/50 px-6 py-4 border-b border-white/5 flex items-center gap-3">
                       <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">GET</span>
                       <code className="text-sm font-bold text-white">/anime/samehadaku/genres</code>
                    </div>
                    <div className="p-6">
                       <p className="text-slate-400 text-sm mb-4">Get the list of all available genres.</p>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Database className="w-3 h-3" /> Returns: JSON Array (GenreList)
                       </div>
                    </div>
                 </div>

                 <div className="bg-slate-900/80 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="bg-slate-800/50 px-6 py-4 border-b border-white/5 flex items-center gap-3">
                       <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">GET</span>
                       <code className="text-sm font-bold text-white">/anime/samehadaku/genres/{'{id}'}?page={'{page}'}</code>
                    </div>
                    <div className="p-6">
                       <p className="text-slate-400 text-sm mb-4">Get anime list by specific genre ID.</p>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Database className="w-3 h-3" /> Returns: JSON Array (AnimeList)
                       </div>
                    </div>
                 </div>

                 {/* Search */}
                 <div className="bg-slate-900/80 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="bg-slate-800/50 px-6 py-4 border-b border-white/5 flex items-center gap-3">
                       <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">GET</span>
                       <code className="text-sm font-bold text-white">/anime/samehadaku/search</code>
                    </div>
                    <div className="p-6">
                       <p className="text-slate-400 text-sm mb-4">Search for anime by title. Query parameter: <code className="bg-slate-800 px-1 rounded">?q=query</code></p>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Database className="w-3 h-3" /> Returns: JSON Object (SearchResults)
                       </div>
                    </div>
                 </div>

                 {/* Detail */}
                 <div className="bg-slate-900/80 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="bg-slate-800/50 px-6 py-4 border-b border-white/5 flex items-center gap-3">
                       <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">GET</span>
                       <code className="text-sm font-bold text-white">/anime/samehadaku/anime/{'{id}'}</code>
                    </div>
                    <div className="p-6">
                       <p className="text-slate-400 text-sm mb-4">Retrieves detailed information about a specific anime, including synopsis, genres, and episode list.</p>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Database className="w-3 h-3" /> Returns: JSON Object (AnimeDetail)
                       </div>
                    </div>
                 </div>

                 {/* Episode */}
                 <div className="bg-slate-900/80 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="bg-slate-800/50 px-6 py-4 border-b border-white/5 flex items-center gap-3">
                       <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">GET</span>
                       <code className="text-sm font-bold text-white">/anime/samehadaku/episode/{'{id}'}</code>
                    </div>
                    <div className="p-6">
                       <p className="text-slate-400 text-sm mb-4">Fetches streaming links, server embeds, and download options for a specific episode.</p>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Database className="w-3 h-3" /> Returns: JSON Object (EpisodeDetail)
                       </div>
                    </div>
                 </div>

                 {/* Server */}
                 <div className="bg-slate-900/80 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="bg-slate-800/50 px-6 py-4 border-b border-white/5 flex items-center gap-3">
                       <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">GET</span>
                       <code className="text-sm font-bold text-white">/anime/samehadaku/server/{'{serverId}'}</code>
                    </div>
                    <div className="p-6">
                       <p className="text-slate-400 text-sm mb-4">Get the real embed URL for a specific video server.</p>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Database className="w-3 h-3" /> Returns: JSON Object (ServerData)
                       </div>
                    </div>
                 </div>

                 {/* Batches */}
                 <div className="bg-slate-900/80 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="bg-slate-800/50 px-6 py-4 border-b border-white/5 flex items-center gap-3">
                       <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">GET</span>
                       <code className="text-sm font-bold text-white">/anime/samehadaku/batch?page={'{page}'}</code>
                    </div>
                    <div className="p-6">
                       <p className="text-slate-400 text-sm mb-4">Get a list of available anime batches (full season downloads).</p>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Database className="w-3 h-3" /> Returns: JSON Array (BatchList)
                       </div>
                    </div>
                 </div>

                 <div className="bg-slate-900/80 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="bg-slate-800/50 px-6 py-4 border-b border-white/5 flex items-center gap-3">
                       <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">GET</span>
                       <code className="text-sm font-bold text-white">/anime/samehadaku/batch/{'{id}'}</code>
                    </div>
                    <div className="p-6">
                       <p className="text-slate-400 text-sm mb-4">Get detailed information and download links for a specific batch.</p>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Database className="w-3 h-3" /> Returns: JSON Object (BatchDetail)
                       </div>
                    </div>
                 </div>
              </div>

              {/* Donghua Section */}
              <div className="space-y-4">
                 <h3 className="text-2xl font-bold text-white mb-4 pl-2 border-l-4 border-fuchsia-500">Donghua Endpoints</h3>

                 {/* Home */}
                 <div className="bg-slate-900/80 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="bg-slate-800/50 px-6 py-4 border-b border-white/5 flex items-center gap-3">
                       <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">GET</span>
                       <code className="text-sm font-bold text-white">/anime/donghua/home/{'{page}'}</code>
                    </div>
                    <div className="p-6">
                       <p className="text-slate-400 text-sm mb-4">Fetches the donghua home page data including latest releases and completed donghua.</p>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Database className="w-3 h-3" /> Returns: JSON Object (DonghuaHome)
                       </div>
                    </div>
                 </div>

                 {/* Ongoing */}
                 <div className="bg-slate-900/80 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="bg-slate-800/50 px-6 py-4 border-b border-white/5 flex items-center gap-3">
                       <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">GET</span>
                       <code className="text-sm font-bold text-white">/anime/donghua/ongoing/{'{page}'}</code>
                    </div>
                    <div className="p-6">
                       <p className="text-slate-400 text-sm mb-4">Get a list of currently airing donghua.</p>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Database className="w-3 h-3" /> Returns: JSON Array (DonghuaList)
                       </div>
                    </div>
                 </div>

                 {/* Completed */}
                 <div className="bg-slate-900/80 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="bg-slate-800/50 px-6 py-4 border-b border-white/5 flex items-center gap-3">
                       <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">GET</span>
                       <code className="text-sm font-bold text-white">/anime/donghua/completed/{'{page}'}</code>
                    </div>
                    <div className="p-6">
                       <p className="text-slate-400 text-sm mb-4">Get a list of completed donghua series.</p>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Database className="w-3 h-3" /> Returns: JSON Array (DonghuaList)
                       </div>
                    </div>
                 </div>

                 {/* Latest */}
                 <div className="bg-slate-900/80 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="bg-slate-800/50 px-6 py-4 border-b border-white/5 flex items-center gap-3">
                       <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">GET</span>
                       <code className="text-sm font-bold text-white">/anime/donghua/latest/{'{page}'}</code>
                    </div>
                    <div className="p-6">
                       <p className="text-slate-400 text-sm mb-4">Get the most recently updated donghua episodes.</p>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Database className="w-3 h-3" /> Returns: JSON Array (DonghuaList)
                       </div>
                    </div>
                 </div>

                 {/* Schedule */}
                 <div className="bg-slate-900/80 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="bg-slate-800/50 px-6 py-4 border-b border-white/5 flex items-center gap-3">
                       <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">GET</span>
                       <code className="text-sm font-bold text-white">/anime/donghua/schedule</code>
                    </div>
                    <div className="p-6">
                       <p className="text-slate-400 text-sm mb-4">Get the weekly release schedule for donghua.</p>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Database className="w-3 h-3" /> Returns: JSON Object (ScheduleDay[])
                       </div>
                    </div>
                 </div>

                 {/* Search */}
                 <div className="bg-slate-900/80 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="bg-slate-800/50 px-6 py-4 border-b border-white/5 flex items-center gap-3">
                       <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">GET</span>
                       <code className="text-sm font-bold text-white">/anime/donghua/search/{'{query}'}</code>
                    </div>
                    <div className="p-6">
                       <p className="text-slate-400 text-sm mb-4">Search for donghua by title.</p>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Database className="w-3 h-3" /> Returns: JSON Object (SearchResults)
                       </div>
                    </div>
                 </div>

                 {/* Detail */}
                 <div className="bg-slate-900/80 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="bg-slate-800/50 px-6 py-4 border-b border-white/5 flex items-center gap-3">
                       <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">GET</span>
                       <code className="text-sm font-bold text-white">/anime/donghua/detail/{'{id}'}</code>
                    </div>
                    <div className="p-6">
                       <p className="text-slate-400 text-sm mb-4">Retrieves detailed information about a specific donghua.</p>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Database className="w-3 h-3" /> Returns: JSON Object (DonghuaDetail)
                       </div>
                    </div>
                 </div>

                 {/* Episode */}
                 <div className="bg-slate-900/80 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="bg-slate-800/50 px-6 py-4 border-b border-white/5 flex items-center gap-3">
                       <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">GET</span>
                       <code className="text-sm font-bold text-white">/anime/donghua/episode/{'{id}'}</code>
                    </div>
                    <div className="p-6">
                       <p className="text-slate-400 text-sm mb-4">Fetches streaming links and download options for a specific donghua episode.</p>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Database className="w-3 h-3" /> Returns: JSON Object (DonghuaEpisode)
                       </div>
                    </div>
                 </div>

                 {/* Genres */}
                 <div className="bg-slate-900/80 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="bg-slate-800/50 px-6 py-4 border-b border-white/5 flex items-center gap-3">
                       <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">GET</span>
                       <code className="text-sm font-bold text-white">/anime/donghua/genres</code>
                    </div>
                    <div className="p-6">
                       <p className="text-slate-400 text-sm mb-4">Get the list of all available donghua genres.</p>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Database className="w-3 h-3" /> Returns: JSON Array (GenreList)
                       </div>
                    </div>
                 </div>

                 {/* By Genre */}
                 <div className="bg-slate-900/80 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="bg-slate-800/50 px-6 py-4 border-b border-white/5 flex items-center gap-3">
                       <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">GET</span>
                       <code className="text-sm font-bold text-white">/anime/donghua/genres/{'{id}'}/{'{page}'}</code>
                    </div>
                    <div className="p-6">
                       <p className="text-slate-400 text-sm mb-4">Get donghua list by specific genre ID.</p>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Database className="w-3 h-3" /> Returns: JSON Array (DonghuaList)
                       </div>
                    </div>
                 </div>

                 {/* Seasons */}
                 <div className="bg-slate-900/80 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="bg-slate-800/50 px-6 py-4 border-b border-white/5 flex items-center gap-3">
                       <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">GET</span>
                       <code className="text-sm font-bold text-white">/anime/donghua/seasons/{'{year}'}</code>
                    </div>
                    <div className="p-6">
                       <p className="text-slate-400 text-sm mb-4">Get donghua series released in a specific year.</p>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Database className="w-3 h-3" /> Returns: JSON Array (DonghuaList)
                       </div>
                    </div>
                 </div>
              </div>

           </div>
        </div>
      </div>
    </div>
  );
};
