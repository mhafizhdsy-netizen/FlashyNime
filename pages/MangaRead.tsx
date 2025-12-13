
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { getMangaChapter, getMangaDetail } from '../services/api';
import { MangaReaderData, AnimeDetail } from '../types';
import { Button, Spinner } from '../components/ui';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';

export const MangaRead = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<MangaReaderData | null>(null);
  const [chapterList, setChapterList] = useState<AnimeDetail['episode_list']>([]);
  const [navSlugs, setNavSlugs] = useState<{ prev: string | null; next: string | null }>({ prev: null, next: null });
  const [loading, setLoading] = useState(true);
  
  const { language } = useAppStore();
  const t = translations[language];

  useEffect(() => {
    const fetchChapterAndNav = async () => {
        if (!slug) return;
        setLoading(true);
        setData(null);
        setChapterList([]);
        setNavSlugs({ prev: null, next: null });

        try {
            const chapterRes = await getMangaChapter(slug);
            if (chapterRes.data) {
                setData(chapterRes.data);
                
                // Fetch the full manga detail to get the chapter list for navigation
                const detailRes = await getMangaDetail(chapterRes.data.comicSlug);
                if (detailRes.detail && detailRes.detail.episode_list) {
                    const chapters = detailRes.detail.episode_list;
                    setChapterList(chapters);

                    // Find current chapter index to determine next/prev
                    const currentIndex = chapters.findIndex(ch => ch.id === slug);
                    if (currentIndex !== -1) {
                        // The API lists chapters newest to oldest, so "previous" in the list is the "next" chapter to read
                        const nextSlug = currentIndex > 0 ? chapters[currentIndex - 1].id : null;
                        const prevSlug = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1].id : null;
                        setNavSlugs({ prev: prevSlug, next: nextSlug });
                    }
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    fetchChapterAndNav();
    window.scrollTo(0, 0);
}, [slug]);

  if (loading) return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center pt-20">
          <div className="text-center">
              <Spinner />
              <p className="text-slate-400 mt-4">Loading Chapter...</p>
          </div>
      </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-center">
       <h2 className="text-white text-xl font-bold mb-4">Chapter not found</h2>
       <Button onClick={() => navigate('/manga')}>Back to Manga</Button>
    </div>
  );

  const NavigationButtons = () => (
    <div className="flex justify-between items-center gap-4">
        <Button 
            variant="secondary" 
            disabled={!navSlugs.prev} 
            onClick={() => navSlugs.prev && navigate(`/manga/read/${navSlugs.prev}`)}
            className="w-full md:w-48"
        >
            <ChevronLeft className="w-4 h-4 mr-2" /> {t.manga.prevChapter}
        </Button>
        <Link to={`/manga/detail/${data.comicSlug}`}>
            <Button variant="ghost" className="w-12 h-12 p-0 rounded-full hover:bg-white/10">
                <BookOpen className="w-6 h-6" />
            </Button>
        </Link>
        <Button 
            variant="primary" 
            disabled={!navSlugs.next} 
            onClick={() => navSlugs.next && navigate(`/manga/read/${navSlugs.next}`)}
            className="w-full md:w-48 bg-gradient-to-r from-rose-600 to-pink-600 border-none shadow-rose-900/20"
        >
            {t.manga.nextChapter} <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-10">
       <div className="container mx-auto max-w-4xl pt-28 px-0 md:px-4">
          
          <div className="px-4 md:px-0 mb-8 space-y-6">
             <h1 className="text-2xl md:text-4xl font-bold text-center text-slate-200">{data.title}</h1>
             <NavigationButtons />
          </div>

          {/* Reader Content */}
          <div className="flex flex-col bg-black shadow-2xl min-h-screen">
             {data.images.map((img, idx) => (
                 <img 
                    key={idx} 
                    src={img} 
                    alt={`Page ${idx + 1}`} 
                    className="w-full h-auto block" 
                    loading="lazy"
                 />
             ))}
          </div>
          
          <div className="mt-10 px-4 md:px-0">
             <NavigationButtons />
          </div>
       </div>
    </div>
  );
};
