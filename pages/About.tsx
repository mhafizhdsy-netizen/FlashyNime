
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Code, Database, Shield, Globe, Play, Check, AlertCircle, Copy, Terminal, ChevronDown } from 'lucide-react';
import { Button, Spinner, Badge } from '../components/ui';

// Proxy configuration duplicated from api.ts for standalone playground functionality
const BASE_URL = 'https://www.sankavollerei.com';
const getProxyUrls = (targetUrl: string) => [
  `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(targetUrl)}`,
  `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
  `https://thingproxy.freeboard.io/fetch/${targetUrl}`,
  `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
  targetUrl
];

type ParamType = { name: string; placeholder: string; required?: boolean; default?: string; type?: 'path' | 'query' };
type EndpointConfig = { name: string; path: string; method: string; desc: string; params: ParamType[] };

const apiConfig: Record<string, EndpointConfig[]> = {
  anime: [
    { name: 'Home', path: '/anime/samehadaku/home', method: 'GET', desc: 'Get aggregated home data.', params: [] },
    { name: 'Ongoing', path: '/anime/samehadaku/ongoing', method: 'GET', desc: 'Get currently airing anime.', params: [{ name: 'page', placeholder: '1', default: '1', type: 'query' }] },
    { name: 'Completed', path: '/anime/samehadaku/completed', method: 'GET', desc: 'Get completed anime.', params: [{ name: 'page', placeholder: '1', default: '1', type: 'query' }] },
    { name: 'Movies', path: '/anime/samehadaku/movies', method: 'GET', desc: 'Get anime movies.', params: [{ name: 'page', placeholder: '1', default: '1', type: 'query' }] },
    { name: 'Popular', path: '/anime/samehadaku/popular', method: 'GET', desc: 'Get popular anime.', params: [{ name: 'page', placeholder: '1', default: '1', type: 'query' }] },
    { name: 'Recent Episodes', path: '/anime/samehadaku/recent', method: 'GET', desc: 'Get recently released episodes.', params: [{ name: 'page', placeholder: '1', default: '1', type: 'query' }] },
    { name: 'Schedule', path: '/anime/samehadaku/schedule', method: 'GET', desc: 'Get weekly schedule.', params: [] },
    { name: 'Genres', path: '/anime/samehadaku/genres', method: 'GET', desc: 'Get all genres.', params: [] },
    { name: 'Search', path: '/anime/samehadaku/search', method: 'GET', desc: 'Search anime.', params: [{ name: 'q', placeholder: 'naruto', required: true, type: 'query' }] },
    { name: 'Detail', path: '/anime/samehadaku/anime/{id}', method: 'GET', desc: 'Get anime details.', params: [{ name: 'id', placeholder: 'slug-id', required: true, type: 'path' }] },
    { name: 'Episode', path: '/anime/samehadaku/episode/{id}', method: 'GET', desc: 'Get episode stream links.', params: [{ name: 'id', placeholder: 'slug-episode-1', required: true, type: 'path' }] },
    { name: 'Batch List', path: '/anime/samehadaku/batch', method: 'GET', desc: 'Get list of batches.', params: [{ name: 'page', placeholder: '1', default: '1', type: 'query' }] },
    { name: 'Batch Detail', path: '/anime/samehadaku/batch/{id}', method: 'GET', desc: 'Get batch downloads.', params: [{ name: 'id', placeholder: 'slug-batch', required: true, type: 'path' }] },
  ],
  donghua: [
    { name: 'Home', path: '/anime/donghua/home/{page}', method: 'GET', desc: 'Get donghua home data.', params: [{ name: 'page', placeholder: '1', default: '1', type: 'path' }] },
    { name: 'Ongoing', path: '/anime/donghua/ongoing/{page}', method: 'GET', desc: 'Get ongoing donghua.', params: [{ name: 'page', placeholder: '1', default: '1', type: 'path' }] },
    { name: 'Latest', path: '/anime/donghua/latest/{page}', method: 'GET', desc: 'Get latest episodes.', params: [{ name: 'page', placeholder: '1', default: '1', type: 'path' }] },
    { name: 'Detail', path: '/anime/donghua/detail/{id}', method: 'GET', desc: 'Get donghua detail.', params: [{ name: 'id', placeholder: 'slug', required: true, type: 'path' }] },
    { name: 'Search', path: '/anime/donghua/search/{query}', method: 'GET', desc: 'Search donghua.', params: [{ name: 'query', placeholder: 'soul land', required: true, type: 'path' }] },
    { name: 'Episode', path: '/anime/donghua/episode/{id}', method: 'GET', desc: 'Get episode details.', params: [{ name: 'id', placeholder: 'episode-slug', required: true, type: 'path' }] },
  ],
  manga: [
    { name: 'Home', path: '/comic/mangakita/home', method: 'GET', desc: 'Get manga home.', params: [] },
    { name: 'List', path: '/comic/mangakita/list', method: 'GET', desc: 'Get manga list.', params: [{ name: 'page', placeholder: '1', default: '1', type: 'query' }, { name: 'order', placeholder: 'popular', default: 'popular', type: 'query' }] },
    { name: 'Search', path: '/comic/mangakita/search/{query}/{page}', method: 'GET', desc: 'Search manga.', params: [{ name: 'query', placeholder: 'one piece', required: true, type: 'path' }, { name: 'page', placeholder: '1', default: '1', type: 'path' }] },
    { name: 'Detail', path: '/comic/mangakita/detail/{slug}', method: 'GET', desc: 'Get manga info.', params: [{ name: 'slug', placeholder: 'manga-slug', required: true, type: 'path' }] },
    { name: 'Chapter', path: '/comic/mangakita/chapter/{slug}', method: 'GET', desc: 'Get chapter images.', params: [{ name: 'slug', placeholder: 'chapter-slug', required: true, type: 'path' }] },
  ]
};

const ApiPlayground = () => {
  const [category, setCategory] = useState<string>('anime');
  const [selectedEndpointIndex, setSelectedEndpointIndex] = useState<number>(0);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const activeEndpoints = apiConfig[category];
  const endpoint = activeEndpoints[selectedEndpointIndex];

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setSelectedEndpointIndex(0);
    setParamValues({});
    setResponse(null);
    setStatus(null);
  };

  const handleEndpointChange = (idx: number) => {
    setSelectedEndpointIndex(idx);
    setParamValues({});
    setResponse(null);
    setStatus(null);
  };

  const executeRequest = async () => {
    setLoading(true);
    setResponse(null);
    setStatus(null);
    const startTime = Date.now();

    try {
      let finalPath = endpoint.path;
      const queryParams = new URLSearchParams();

      endpoint.params.forEach(p => {
        const val = paramValues[p.name] || p.default || '';
        if (p.type === 'path') {
          finalPath = finalPath.replace(`{${p.name}}`, encodeURIComponent(val));
        } else {
          if (val) queryParams.append(p.name, val);
        }
      });

      const queryString = queryParams.toString();
      const fullPath = queryString ? `${finalPath}?${queryString}` : finalPath;
      const targetUrl = `${BASE_URL}${fullPath}`;
      
      // Use proxy rotation logic
      const urlsToTry = getProxyUrls(targetUrl);
      let success = false;
      let lastJson = null;

      for (const url of urlsToTry) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000);
          
          const res = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (res.ok) {
            const text = await res.text();
            let json = JSON.parse(text);
            if (json.contents) json = JSON.parse(json.contents); // Handle AllOrigins
            
            lastJson = json;
            setStatus(res.status);
            success = true;
            break;
          }
        } catch (e) {
          console.warn(`Proxy failed: ${url}`);
        }
      }

      if (success && lastJson) {
        setResponse(lastJson);
      } else {
        setStatus(500);
        setResponse({ error: "All proxies failed to fetch data." });
      }

    } catch (err: any) {
      setStatus(500);
      setResponse({ error: err.message });
    } finally {
      setDuration(Date.now() - startTime);
      setLoading(false);
    }
  };

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
       <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-fuchsia-500/10 rounded-xl border border-fuchsia-500/20">
             <Terminal className="w-6 h-6 text-fuchsia-400" />
          </div>
          <h2 className="text-3xl font-bold text-white">API Playground</h2>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Panel */}
          <div className="lg:col-span-5 bg-slate-900/80 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
             {/* Category Tabs */}
             <div className="flex border-b border-white/5 bg-slate-950/50">
                {Object.keys(apiConfig).map(cat => (
                   <button
                     key={cat}
                     onClick={() => handleCategoryChange(cat)}
                     className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${category === cat ? 'text-violet-400 bg-white/5 border-b-2 border-violet-500' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                   >
                     {cat}
                   </button>
                ))}
             </div>

             <div className="p-6 space-y-6">
                {/* Endpoint Select */}
                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-400 uppercase">Endpoint</label>
                   <div className="relative">
                      <select 
                        value={selectedEndpointIndex}
                        onChange={(e) => handleEndpointChange(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-white/10 text-white text-sm rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                      >
                         {activeEndpoints.map((ep, idx) => (
                            <option key={idx} value={idx}>{ep.method} - {ep.name}</option>
                         ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"/>
                   </div>
                   <p className="text-xs text-slate-500 mt-2">{endpoint.desc}</p>
                   <div className="flex items-center gap-2 mt-2 font-mono text-xs bg-black/30 p-2 rounded-lg border border-white/5 text-emerald-400">
                      <span className="font-bold text-violet-400">{endpoint.method}</span>
                      {endpoint.path}
                   </div>
                </div>

                {/* Parameters */}
                {endpoint.params.length > 0 && (
                   <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-400 uppercase">Parameters</label>
                      {endpoint.params.map(param => (
                         <div key={param.name} className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs">
                               <span className="font-mono text-slate-300">{param.name}</span>
                               <span className={`text-[10px] uppercase ${param.required ? 'text-red-400' : 'text-slate-600'}`}>{param.required ? 'Required' : 'Optional'}</span>
                            </div>
                            <input 
                               type="text"
                               placeholder={param.placeholder}
                               value={paramValues[param.name] || ''}
                               onChange={(e) => setParamValues({...paramValues, [param.name]: e.target.value})}
                               className="bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                            />
                         </div>
                      ))}
                   </div>
                )}

                <Button onClick={executeRequest} disabled={loading} className="w-full gap-2">
                   {loading ? <Spinner /> : <Play className="w-4 h-4 fill-white" />}
                   Send Request
                </Button>
             </div>
          </div>

          {/* Response Panel */}
          <div className="lg:col-span-7 h-full min-h-[500px] flex flex-col bg-[#0b1221] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
             <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-950/50">
                <span className="text-sm font-bold text-slate-400">Response</span>
                <div className="flex items-center gap-3">
                   {status && (
                      <Badge variant={status === 200 ? 'outline' : 'hot'} className={status === 200 ? 'text-emerald-400 border-emerald-500/30' : ''}>
                         {status} {status === 200 ? 'OK' : 'Error'}
                      </Badge>
                   )}
                   {duration && (
                      <span className="text-xs text-slate-500 font-mono">{duration}ms</span>
                   )}
                   <button onClick={copyResponse} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white" title="Copy JSON">
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                   </button>
                </div>
             </div>
             
             <div className="flex-1 relative overflow-hidden">
                {response ? (
                   <pre className="absolute inset-0 p-6 overflow-auto custom-scrollbar text-xs font-mono leading-relaxed text-blue-100 selection:bg-violet-500/30">
                      {JSON.stringify(response, null, 2)}
                   </pre>
                ) : (
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 p-6 text-center">
                      {loading ? (
                         <div className="flex flex-col items-center gap-4">
                            <Spinner />
                            <span className="text-sm animate-pulse">Fetching data from the void...</span>
                         </div>
                      ) : (
                         <>
                            <Code className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-sm max-w-xs">Select an endpoint and parameters, then hit Send Request to see the magic happen.</p>
                         </>
                      )}
                   </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};

export const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] pt-28 px-6 pb-20">
      <div className="container mx-auto max-w-6xl">
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

        {/* Replaced static docs with Playground */}
        <ApiPlayground />
      </div>
    </div>
  );
};
