
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ArrowLeft } from 'lucide-react';
import { getBatchList } from '../services/api';
import { Anime } from '../types';
import { AnimeCard } from '../components/AnimeCard';
import { Button, Spinner } from '../components/ui';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';

export const BatchList = () => {
  const [batches, setBatches] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { language } = useAppStore();
  const t = translations[language];
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getBatchList(page);
        if (res.batch_list) setBatches(res.batch_list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page]);

  return (
    <div className="min-h-screen bg-[#020617] pt-28 px-6 pb-20">
       <div className="container mx-auto">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 pl-0 hover:pl-2 transition-all text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5 mr-2"/> {t.watch.goBack}
          </Button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 animate-fade-in-up">
             <div>
               <h1 className="text-4xl font-black text-white capitalize mb-2 flex items-center gap-3">
                 <Layers className="text-fuchsia-500" /> {t.batch.title}
               </h1>
               <p className="text-slate-400">{t.batch.subtitle}</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
             <div className="col-span-full">
                {loading ? (
                   <div className="flex justify-center py-20"><Spinner /></div>
                ) : (
                   <>
                      {batches.length === 0 ? (
                         <div className="text-center py-20 text-slate-500">{t.batch.noBatches}</div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                           {batches.map((batch, i) => (
                              <AnimeCard key={`${batch.id}-${i}`} anime={batch} isBatch={true} />
                           ))}
                        </div>
                      )}
                      
                      <div className="flex justify-center mt-16 gap-4">
                         <Button 
                           disabled={page === 1} 
                           onClick={() => setPage(p => p - 1)}
                           variant="secondary"
                           className="w-32"
                         >
                           {t.browse.prev}
                         </Button>
                         <span className="flex items-center text-slate-400 font-medium px-4 bg-white/5 rounded-xl">{t.browse.page} {page}</span>
                         <Button 
                           onClick={() => setPage(p => p + 1)}
                           variant="secondary"
                           className="w-32"
                         >
                           {t.browse.next}
                         </Button>
                      </div>
                   </>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};
