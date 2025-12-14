import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { searchAnime, searchDonghua, searchManga, normalizeAnime } from '../services/api';
import { Anime } from '../types';
import { AnimeCard } from '../components/AnimeCard';
import { MangaCard } from '../components/MangaCard';
import { Button, Spinner } from '../components/ui';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';

export const Search = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'anime' | 'donghua' | 'manga'>('anime');
  
  const navigate = useNavigate();
  const { language } = useAppStore();
  const t = translations[language];

  // Sync state when URL parameters change (e.g. searching from Navbar while already on Search page)
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery !== null && urlQuery !== query) {
        setQuery(urlQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 2) {
        setLoading(true);
        try {
          if (activeTab === 'anime') {
             const res = await searchAnime(query);
             setResults(res.search_results ? res.search_results.map(normalizeAnime) : []);
          } else if (activeTab === 'donghua') {
             const res = await searchDonghua(query);
             setResults(res.search_results || []);
          } else { // Manga
             const res = await searchManga(query);
             setResults(res.results || []);
          }
        } catch (error) {
          console.error(error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 600);
    return () => clearTimeout(delayDebounceFn);
  }, [query, activeTab]);

  const handleTabChange = (tab: 'anime' | 'donghua' | 'manga') => {
    setActiveTab(tab);
    // Do not clear query on tab change to allow searching same keyword in different category
    // setQuery(''); 
    // Just trigger re-search via effect
  };

  return (
    <div className="min-h-screen bg-[#020617] pt-28 px-6 pb-20">
       <div className="container mx-auto max-w-5xl">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 pl-0 hover:pl-2 transition-all text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5 mr-2"/> {t.watch.goBack}
          </Button>

          <div className="text-center mb-10 animate-fade-in-up">
             <h1 className="text-4xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">{t.search.title}</h1>
             <p className="text-slate-400">{t.search.subtitle}</p>
          </div>

          <div className="relative mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
             <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <SearchIcon className="h-6 w-6 text-slate-500" />
             </div>
             <input
               type="text"
               className="block w-full pl-14 pr-6 py-5 bg-slate-900/80 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-lg shadow-xl backdrop-blur-md transition-all"
               placeholder={t.search.placeholder}
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               autoFocus={!initialQuery} // Only autofocus if we didn't arrive with a search term
             />
          </div>

          <div className="flex justify-center gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
             <Button 
               variant={activeTab === 'anime' ? 'primary' : 'secondary'}
               onClick={() => handleTabChange('anime')}
               className="w-32 rounded-full"
             >
               {t.search.type.anime}
             </Button>
             <Button 
               variant={activeTab === 'donghua' ? 'primary' : 'secondary'}
               onClick={() => handleTabChange('donghua')}
               className="w-32 rounded-full"
             >
               {t.search.type.donghua}
             </Button>
             <Button 
               variant={activeTab === 'manga' ? 'primary' : 'secondary'}
               onClick={() => handleTabChange('manga')}
               className="w-32 rounded-full"
             >
               {t.search.type.manga}
             </Button>
          </div>

          {loading ? (
             <div className="flex justify-center py-20"><Spinner /></div>
          ) : (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {results.length > 0 ? (
                   results.map((item, idx) => (
                      <div key={`${item.id}-${idx}`} className="animate-scale-in" style={{ animationDelay: `${idx * 50}ms` }}>
                          {activeTab === 'manga' ? (
                            <MangaCard manga={item} />
                          ) : (
                            <AnimeCard 
                               anime={item} 
                               isDonghua={activeTab === 'donghua'}
                            />
                          )}
                      </div>
                   ))
                ) : (
                   query.length > 2 && (
                      <div className="col-span-full text-center py-20 text-slate-500">
                         {t.search.noResults} "{query}" in {activeTab}
                      </div>
                   )
                )}
             </div>
          )}
       </div>
    </div>
  );
};