
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layers, FileDown, ArrowLeft, Download } from 'lucide-react';
import { getBatchDetail } from '../services/api';
import { BatchDetail as BatchDetailType } from '../types';
import { Button, Spinner, Badge } from '../components/ui';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';

export const BatchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [batch, setBatch] = useState<BatchDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { language } = useAppStore();
  const t = translations[language];

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        if (id) {
           const res = await getBatchDetail(id);
           if (res.batch) setBatch(res.batch);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center"><Spinner /></div>;
  
  if (!batch) return (
     <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
        <h2 className="text-white text-2xl font-bold mb-4">Batch Not Found</h2>
        <Button onClick={() => navigate('/batch')}>{t.batch.back}</Button>
     </div>
  );
  
  const rawPoster = batch.poster;
  const posterUrl = Array.isArray(rawPoster) && rawPoster.length > 0 ? rawPoster[0] : typeof rawPoster === 'string' ? rawPoster : '';

  return (
    <div className="min-h-screen bg-[#020617] pt-28 px-6 pb-20">
      <div className="container mx-auto max-w-5xl">
         <Button variant="ghost" onClick={() => navigate('/batch')} className="mb-8 pl-0 hover:pl-2 transition-all">
            <ArrowLeft className="w-5 h-5 mr-2"/> {t.batch.back}
         </Button>

         <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="w-full md:w-[300px] flex-shrink-0">
               <div className="rounded-2xl overflow-hidden shadow-2xl shadow-fuchsia-900/20 border border-white/10">
                  <img 
                      src={posterUrl} 
                      alt={batch.title} 
                      loading="lazy"
                      className="w-full h-auto object-cover"
                  />
               </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-6">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <Badge className="bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30 px-3 py-1 flex items-center gap-1">
                        <Layers className="w-3 h-3"/> BATCH
                     </Badge>
                     {batch.status && <Badge variant="outline">{batch.status}</Badge>}
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">{batch.title}</h1>
               </div>

               {/* Download Section */}
               <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                     <FileDown className="text-fuchsia-400" /> {t.batch.downloadLinks}
                  </h3>
                  
                  {batch.download_links && batch.download_links.length > 0 ? (
                     <div className="space-y-6">
                        {batch.download_links.map((quality, idx) => (
                           <div key={idx} className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                              <div className="flex items-center gap-3 mb-3">
                                 <div className="w-2 h-8 rounded-full bg-fuchsia-500"/>
                                 <span className="font-bold text-lg text-slate-200">{quality.quality}</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                 {quality.links.map((link, lIdx) => (
                                    <a key={lIdx} href={link.link} target="_blank" rel="noopener noreferrer">
                                       <Badge className="bg-slate-700 hover:bg-fuchsia-600 text-slate-200 hover:text-white border-transparent px-4 py-2 cursor-pointer transition-colors text-xs sm:text-sm">
                                          <Download className="w-3 h-3 mr-2" />
                                          {link.title}
                                       </Badge>
                                    </a>
                                 ))}
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <p className="text-slate-500 italic">{t.batch.noLinks}</p>
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};