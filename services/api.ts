
import { Anime, AnimeDetail, EpisodeDetail, ScheduleDay, Genre, BatchDetail, QualityLinks, DownloadLink, ServerQuality, VideoServer, AnimeGroup, MangaReaderData } from '../types';

// New Base URL from instructions
const BASE_URL = 'https://www.sankavollerei.com';
const CACHE_PREFIX = 'flashy-cache-';

// Helper to get a working proxy URL (kept for redundancy/CORS)
const getProxyUrls = (targetUrl: string) => [
  // 1. CodeTabs - Encoding is crucial for preserving query parameters like &page=2
  `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(targetUrl)}`,
  // 2. CorsProxy.io - Fast but can be rate-limited
  `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
  // 3. ThingProxy - A reliable alternative
  `https://thingproxy.freeboard.io/fetch/${targetUrl}`,
  // 4. AllOrigins - Also reliable, but wraps response
  `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
  // 5. Direct (if CORS allows)
  targetUrl 
];

async function fetchJson<T>(endpoint: string): Promise<T> {
  const cacheKey = `${CACHE_PREFIX}${endpoint}`;
  const targetUrl = `${BASE_URL}${endpoint}`;
  const urlsToTry = getProxyUrls(targetUrl);
  
  let lastError: any = new Error("All proxies failed to fetch the data.");

  for (const url of urlsToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Proxy request failed with status ${res.status} from ${url}`);
      }
      
      const text = await res.text();
      try {
        let json = JSON.parse(text);
        // Handle allorigins wrapper
        if (json.contents) {
           json = JSON.parse(json.contents);
        }
        
        // --- SUCCESS: Cache and return ---
        try {
          const cacheData = { data: json, timestamp: Date.now() };
          localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (cacheError) {
          console.warn(`Failed to write to cache for ${endpoint}`, cacheError);
        }
        return json;

      } catch (e) {
        throw new Error(`Proxy returned non-JSON response from ${url}`);
      }
    } catch (e) {
      lastError = e;
      // Log the error for debugging but continue to the next proxy
      console.warn(`A proxy has failed: ${url}`, e);
    }
  }
  
  // --- FAILURE: Try to use cache ---
  console.error(`Failed to fetch data from ${endpoint}. Trying to use cache. Last error:`, lastError);

  try {
    const cachedItem = localStorage.getItem(cacheKey);
    if (cachedItem) {
      const cached = JSON.parse(cachedItem);
      console.warn(`Using stale cache for ${endpoint}. Data is from ${new Date(cached.timestamp).toLocaleString()}`);
      return cached.data;
    }
  } catch (cacheError) {
    console.error(`Failed to read or parse cache for ${endpoint}`, cacheError);
  }
  
  // If loop finishes without returning, all proxies failed.
  console.error(`Failed to fetch data from ${endpoint}. Last error:`, lastError);
  throw new Error(`Failed to fetch data from ${endpoint}`);
}

// --- Helper: Parse Download Links from API Structure ---
const parseDownloads = (downloadUrlData: any): QualityLinks[] => {
  if (!downloadUrlData || !downloadUrlData.formats || !Array.isArray(downloadUrlData.formats)) {
    return [];
  }

  const results: QualityLinks[] = [];

  downloadUrlData.formats.forEach((format: any) => {
    if (format.qualities && Array.isArray(format.qualities)) {
      format.qualities.forEach((quality: any) => {
        const links: DownloadLink[] = (quality.urls || []).map((urlObj: any) => ({
          title: urlObj.title,
          link: urlObj.url
        }));

        if (links.length > 0) {
          results.push({
            quality: `${format.title} - ${quality.title}`,
            links: links
          });
        }
      });
    }
  });

  return results;
};

// --- Normalization Helpers ---

export const normalizeAnime = (data: any): Anime => {
  if (!data) return { id: 'unknown', title: 'Unknown', poster: '', status: '' } as Anime;

  // Robust ID extraction: Check specialized IDs first, then generic 'id', then 'slug'.
  let id = data.animeId || data.episodeId || data.batchId || data.id || data.slug || '';

  // Fallback: If ID is missing but 'href' exists, try to extract the slug from the URL.
  // Example href: "https://samehadaku.care/anime/jujutsu-kaisen-season-2/" -> "jujutsu-kaisen-season-2"
  if (!id && data.href) {
    try {
        // Remove trailing slash if present
        const cleanHref = data.href.endsWith('/') ? data.href.slice(0, -1) : data.href;
        const parts = cleanHref.split('/');
        if (parts.length > 0) {
            id = parts[parts.length - 1];
        }
    } catch (e) {
        console.warn("Failed to extract ID from href", data.href);
    }
  }

  let rating = 'N/A';
  if (data.score) {
    if (typeof data.score === 'object' && data.score.value) {
      rating = data.score.value;
    } else if (typeof data.score === 'string' && data.score.trim() !== '') {
      rating = data.score;
    }
  }

  return {
    title: data.title || 'Unknown',
    id: id, 
    poster: data.poster || '',
    status: data.status || '', 
    rating: rating,
    genres: data.genreList ? data.genreList.map((g: any) => g.title) : [],
    episode: data.episodes ? String(data.episodes) : '',
    type: data.type || '',
    release_day: data.releasedOn || data.releaseDate || '',
    last_update: data.releasedOn || '',
    isDonghua: false,
    rank: data.rank
  };
};

export const normalizeDonghua = (data: any): Anime => {
  if (!data) return { id: 'unknown', title: 'Unknown', poster: '', status: '', isDonghua: true } as Anime;
  
  let episode = '';
  if (data.current_episode) episode = data.current_episode.replace(/^Ep\s+/i, '');
  else if (data.episode) episode = data.episode.replace(/^Ep\s+/i, '');

  let id = data.slug || data.id || '';
  let title = data.title;
  let poster = data.poster;
  let status = data.status;
  let rating = data.rating;
  let genres = data.genres;
  let type = data.type;

  // Heuristic: If the data object represents an episode (e.g., from latest releases),
  // we need to extract the parent donghua's info for the card.
  const isLikelyEpisode = id.includes('-episode-') || data.donghua_details;

  if (isLikelyEpisode) {
    if (data.donghua_details) {
      // Prioritize explicit parent details if available
      id = data.donghua_details.slug || id.split('-episode-')[0];
      title = data.donghua_details.title || title.replace(/Episode\s*\d+.*/i, '').trim();
      poster = data.donghua_details.poster || poster;
      status = data.donghua_details.status || status;
      rating = data.donghua_details.rating || rating;
      genres = data.donghua_details.genres || genres;
      type = data.donghua_details.type || type;
    } else if (id.includes('-episode-')) {
      // Fallback to parsing from the episode's own data
      // This part is crucial for lists that don't embed parent details.
      id = id.split('-episode-')[0];
      title = title.replace(/Episode\s*\d+.*/i, '').trim();
    }
  }

  return {
    title: title,
    id: id,
    poster: poster,
    status: status,
    rating: rating || 'N/A',
    genres: genres ? genres.map((g: any) => g.name) : [],
    episode: episode, // This is the episode number from the original object
    type: type || 'Donghua',
    release_day: data.released || data.released_on || '',
    last_update: data.updated_on || '',
    isDonghua: true
  };
};

export const normalizeManga = (data: any): Anime => {
  if (!data) return { id: 'unknown', title: 'Unknown', poster: '', status: '', isManga: true } as Anime;

  const id = data.slug || '';
  const title = data.title || 'Unknown';
  // Handles multiple poster keys from different endpoints
  const poster = data.imageSrc || data.image || data.poster || '';
  const rating = data.rating || 'N/A';
  
  let latestChapter = data.latestChapter || '';
  if (!latestChapter && data.chapters && data.chapters.length > 0) {
    latestChapter = data.chapters[0].title;
  }
  
  const episode = latestChapter.replace(/Chapter\s+/i, '').replace(/Ch\.\s+/i, '').trim();

  let status = data.status || (data.info ? data.info.status : '');
  let type = data.type || (data.info ? data.info.type : '');
  if (!status && type) status = type; 
  if (!status) status = 'Manga';

  return {
    title: title,
    id: id,
    poster: poster,
    status: status,
    rating: rating,
    episode: episode,
    type: type || 'Manga',
    release_day: '',
    last_update: '',
    isManga: true,
    isDonghua: false
  };
};

// --- Anime Endpoints ---

export const getHome = async () => {
  const data = await fetchJson<any>('/anime/samehadaku/home');
  const homeData = data.data || {};
  return {
    home: {
      recent: (homeData.recent?.animeList || []).map(normalizeAnime),
      movies: (homeData.movie?.animeList || []).map(normalizeAnime),
      popular: (homeData.top10?.animeList || []).map(normalizeAnime), // Note: Keeping popular map to top10 if API structure matches generally popular items
      top10: (homeData.top10?.animeList || []).map(normalizeAnime),
      batch: homeData.batch?.batchList || []
    }
  };
};

export const getAnimeListByLetter = async () => {
  const data = await fetchJson<any>('/anime/samehadaku/list');
  return {
    list: (data.data?.list || []).map((group: any) => ({
      startWith: group.startWith,
      animeList: (group.animeList || []).map(normalizeAnime)
    })) as AnimeGroup[]
  };
};

export const getOngoingAnime = (page = 1) => 
  fetchJson<any>(`/anime/samehadaku/ongoing?page=${page}&order=popular`)
    .then(res => ({ ongoing: (res.data?.animeList || []).map(normalizeAnime), pagination: res.pagination }));

export const getCompleteAnime = (page = 1) => 
  fetchJson<any>(`/anime/samehadaku/completed?page=${page}&order=latest`)
    .then(res => ({ complete: (res.data?.animeList || []).map(normalizeAnime), pagination: res.pagination }));

export const getMovies = (page = 1) => 
  fetchJson<any>(`/anime/samehadaku/movies?page=${page}&order=update`)
    .then(res => ({ movies: (res.data?.animeList || []).map(normalizeAnime), pagination: res.pagination }));

export const getPopularAnime = (page = 1) => 
  fetchJson<any>(`/anime/samehadaku/popular?page=${page}`)
    .then(res => ({ popular: (res.data?.animeList || []).map(normalizeAnime), pagination: res.pagination }));

export const getLatestEpisodes = (page = 1) => 
  fetchJson<any>(`/anime/samehadaku/recent?page=${page}`)
    .then(res => ({ latest: (res.data?.animeList || []).map(normalizeAnime), pagination: res.pagination }));

export const searchAnime = (query: string) => 
  fetchJson<any>(`/anime/samehadaku/search?q=${encodeURIComponent(query)}&page=1`)
    .then(res => ({ search_results: (res.data?.animeList || []).map(normalizeAnime) }));

export const getAnimeDetail = (id: string) => 
  fetchJson<any>(`/anime/samehadaku/anime/${id}`)
    .then(res => {
      const d = res.data;
      const firstBatch = d.batchList && d.batchList.length > 0 
        ? { id: d.batchList[0].batchId, link: d.batchList[0].href, text: d.batchList[0].title } 
        : null;

      return {
        detail: {
          ...normalizeAnime(d),
          japanese_title: d.japanese,
          english_title: d.english,
          score: typeof d.score === 'object' ? d.score?.value : d.score,
          producer: d.producers,
          studio: d.studios,
          synopsis: d.synopsis?.paragraphs || [],
          duration: d.duration,
          total_episodes: d.episodes,
          release_date: d.aired,
          batch_link: firstBatch, 
          episode_list: (d.episodeList || []).map((ep: any) => ({
            title: `Episode ${ep.title}`,
            id: ep.episodeId,
            date: ''
          })),
          recommendations: [] 
        } as AnimeDetail
      };
    });

export const getEpisodeDetail = (id: string) => 
  fetchJson<any>(`/anime/samehadaku/episode/${id}`)
    .then(res => {
      const d = res.data;
      return {
        episode: {
          title: d.title,
          id: id,
          anime_id: d.animeId,
          stream_link: d.defaultStreamingUrl,
          servers: d.server?.qualities || [],
          download_links: parseDownloads(d.downloadUrl),
          prev_episode: d.hasPrevEpisode ? d.prevEpisode?.episodeId : null,
          next_episode: d.hasNextEpisode ? d.nextEpisode?.episodeId : null,
        } as EpisodeDetail
      };
    });

export const getBatchList = (page = 1) => 
  fetchJson<any>(`/anime/samehadaku/batch?page=${page}`)
    .then(res => ({ 
      batch_list: (res.data?.batchList || []).map(normalizeAnime),
      pagination: res.pagination 
    }));

export const getBatchDetail = (id: string) =>
  fetchJson<any>(`/anime/samehadaku/batch/${id}`)
    .then(res => {
        const d = res.data;
        return {
            batch: {
                title: d.title,
                id: id,
                poster: d.poster,
                status: d.status,
                download_links: parseDownloads(d.downloadUrl)
            } as BatchDetail
        };
    });

export const getSchedule = () => 
  fetchJson<any>('/anime/samehadaku/schedule')
    .then(res => ({ 
      schedule: (res.data?.days || []).map((d: any) => ({
        day: d.day,
        animeList: d.animeList.map(normalizeAnime)
      })) 
    }));

export const getGenres = () => 
  fetchJson<any>('/anime/samehadaku/genres')
    .then(res => ({ 
      genres: (res.data?.genreList || []).map((g: any) => ({
        name: g.title,
        id: g.genreId
      })) 
    }));

export const getAnimeByGenre = (id: string, page = 1) => 
  fetchJson<any>(`/anime/samehadaku/genres/${id}?page=${page}`)
    .then(res => ({ genre_anime: (res.data?.animeList || []).map(normalizeAnime), pagination: res.pagination }));

export const getRecommended = () => getPopularAnime(1).then(res => ({ recommended: res.popular.slice(0, 10) }));

export const getRandomAnime = () => getPopularAnime(1).then(res => ({ random: res.popular[Math.floor(Math.random() * res.popular.length)] }));

export const getServerEmbed = (serverId: string) =>
  fetchJson<any>(`/anime/samehadaku/server/${serverId}`)
    .then(res => res.data?.url);


// --- Donghua Endpoints ---

export const getDonghuaHome = async (page = 1) => {
  const data = await fetchJson<any>(`/anime/donghua/home/${page}`);
  const homeData = data.data || data;
  return {
    latest: (homeData.latest_release || []).map(normalizeDonghua),
    completed: (homeData.completed_donghua || []).map(normalizeDonghua)
  };
};

export const getDonghuaOngoing = async (page = 1) => {
  const data = await fetchJson<any>(`/anime/donghua/ongoing/${page}`);
  return { ongoing: (data.ongoing_donghua || []).map(normalizeDonghua) };
};

export const getDonghuaCompleted = async (page = 1) => {
  const data = await fetchJson<any>(`/anime/donghua/completed/${page}`);
  return { completed: (data.completed_donghua || []).map(normalizeDonghua) };
};

export const getDonghuaLatest = async (page = 1) => {
  const data = await fetchJson<any>(`/anime/donghua/latest/${page}`);
  return { latest: (data.latest_donghua || []).map(normalizeDonghua) };
};

export const getDonghuaSchedule = async () => {
  const data = await fetchJson<any>(`/anime/donghua/schedule`);
  return {
    schedule: (data.schedule || []).map((d: any) => ({
      day: d.day,
      animeList: (d.donghua_list || []).map(normalizeDonghua)
    }))
  };
};

export const searchDonghua = async (query: string) => {
  const data = await fetchJson<any>(`/anime/donghua/search/${encodeURIComponent(query)}`);
  return { search_results: (data.data || []).map(normalizeDonghua) };
};

export const getDonghuaDetail = async (id: string) => {
  const response = await fetchJson<any>(`/anime/donghua/detail/${id}`);
  const d = response.data || response; // Handle potential data wrapper
  
  if (!d || !d.title) {
    throw new Error(`Failed to get valid donghua details for id: ${id}`);
  }

  return {
    detail: {
      ...normalizeDonghua({ ...d, slug: id }), // Pass id manually as slug might be missing in top level
      japanese_title: d.alter_title,
      english_title: d.title,
      score: d.rating,
      producer: d.network,
      studio: d.studio,
      synopsis: d.synopsis,
      duration: d.duration,
      total_episodes: d.episodes_count,
      release_date: d.released,
      episode_list: (d.episodes_list || []).map((ep: any) => {
        // Extract episode number from title if possible
        let epNum = ep.episode;
        const match = ep.episode.match(/Episode\s+(\d+)/i);
        if (match) epNum = match[1];
        
        return {
          title: ep.episode,
          id: ep.slug,
          date: ''
        };
      }),
      recommendations: []
    } as AnimeDetail
  };
};

export const getDonghuaEpisode = async (id: string) => {
  const response = await fetchJson<any>(`/anime/donghua/episode/${id}`);
  const d = response.data || response; // Handle potential data wrapper
  
  if (!d || !d.episode) {
    throw new Error(`Failed to get valid donghua episode details for id: ${id}`);
  }

  // Transform servers to ServerQuality format
  const servers: ServerQuality[] = [];
  if (d.streaming) {
    const serverList: VideoServer[] = [];
    
    // Add Main URL if available
    if (d.streaming.main_url) {
      serverList.push({
        title: d.streaming.main_url.name || 'Main',
        serverId: 'main',
        href: d.streaming.main_url.url
      });
    }
    
    // Add other servers
    if (d.streaming.servers) {
      d.streaming.servers.forEach((s: any) => {
        serverList.push({
          title: s.name,
          serverId: s.name, // Use name as ID for Donghua direct links
          href: s.url
        });
      });
    }
    
    if (serverList.length > 0) {
      servers.push({ title: 'Streaming', serverList });
    }
  }

  // Transform Downloads
  const downloadLinks: QualityLinks[] = [];
  if (d.download_url) {
    Object.keys(d.download_url).forEach(key => {
      // key like "download_url_360p"
      const quality = key.replace('download_url_', '').toUpperCase();
      const linksObj = d.download_url[key];
      const links: DownloadLink[] = [];
      
      Object.keys(linksObj).forEach(sourceName => {
        links.push({
          title: sourceName,
          link: linksObj[sourceName]
        });
      });

      if (links.length > 0) {
        downloadLinks.push({ quality, links });
      }
    });
  }

  // Heuristic to fix wrong anime_id mapping (stripping episode part)
  let animeId = d.donghua_details?.slug || '';
  if (!animeId || animeId === id || animeId.includes('episode-')) {
      // Try to clean the ID if it looks like an episode ID (e.g. soul-land-2-episode-131...)
      // This is a rough fix, assuming structure "slug-episode-num..."
      if (id.includes('-episode-')) {
          animeId = id.split('-episode-')[0];
      }
  }

  return {
    episode: {
      title: d.episode,
      id: id,
      anime_id: animeId,
      stream_link: d.streaming?.main_url?.url || '',
      servers: servers,
      download_links: downloadLinks,
      prev_episode: d.navigation?.previous_episode?.slug || null,
      next_episode: d.navigation?.next_episode?.slug || null,
    } as EpisodeDetail
  };
};

export const getDonghuaGenres = async () => {
  const data = await fetchJson<any>('/anime/donghua/genres');
  return {
    genres: (data.data || []).map((g: any) => ({
      name: g.name,
      id: g.slug
    }))
  };
};

export const getDonghuaByGenre = async (id: string, page = 1) => {
  const data = await fetchJson<any>(`/anime/donghua/genres/${id}/${page}`);
  return { genre_anime: (data.data || []).map(normalizeDonghua) };
};

export const getDonghuaSeasons = async (year?: string) => {
  const targetYear = year || new Date().getFullYear().toString();
  const endpoint = `/anime/donghua/seasons/${targetYear}`;
  const data = await fetchJson<any>(endpoint);
  return { data: (data.data || []).map(normalizeDonghua) };
};

// --- Manga Endpoints ---

export const getMangaHome = async () => {
  const data = await fetchJson<any>('/comic/mangakita/home');
  return {
    trending: (data.popularToday || []).map(normalizeManga),
    latest: (data.latestReleases || []).map(normalizeManga)
  };
};

export const getMangaList = async (order: string = 'popular', page: number = 1) => {
  // Ensure order and page are URL-encoded correctly if necessary, though mostly safe for these values
  const endpoint = `/comic/mangakita/list?order=${order}&page=${page}`;
  const data = await fetchJson<any>(endpoint);
  return {
    list: (data.mangaList || []).map(normalizeManga),
    pagination: data.pagination
  };
};

export const getMangaProjects = async (page: number = 1) => {
  const endpoint = `/comic/mangakita/projects/${page}`;
  const data = await fetchJson<any>(endpoint);
  return {
    projects: (data.projects || []).map(normalizeManga),
    pagination: data.pagination
  };
};

export const getAllManga = async (page: number = 1) => {
  const endpoint = `/comic/mangakita/daftar-manga/${page}`;
  const data = await fetchJson<any>(endpoint);
  return {
    list: (data.mangaList || []).map(normalizeManga),
    pagination: data.pagination
  };
};

export const getMangaGenres = async () => {
  const data = await fetchJson<any>('/comic/mangakita/genres');
  return {
    genres: (data.genres || []).map((g: any) => ({
      name: g.name,
      id: g.slug
    }))
  };
};

export const getMangaByGenre = async (slug: string, page: number = 1) => {
  const endpoint = `/comic/mangakita/genres/${slug}/${page}`;
  const data = await fetchJson<any>(endpoint);
  return {
    list: (data.mangaList || []).map(normalizeManga),
    pagination: data.pagination
  };
};

export const getMangaRecommendations = async () => {
  const data = await fetchJson<any>('/comic/mangakita/rekomendasi');
  const recs = data.recommendations || {};
  const formatted: Record<string, Anime[]> = {};
  
  Object.keys(recs).forEach(key => {
    formatted[key] = recs[key].map(normalizeManga);
  });
  
  return formatted;
};

export const searchManga = async (query: string, page: number = 1) => {
  const endpoint = `/comic/mangakita/search/${encodeURIComponent(query)}/${page}`;
  const data = await fetchJson<any>(endpoint);
  return {
    results: (data.results || []).map(normalizeManga),
    pagination: data.pagination
  };
};

export const getMangaDetail = async (slug: string) => {
  const data = await fetchJson<any>(`/comic/mangakita/detail/${slug}`);
  const details = data.details || {};
  
  return {
    detail: {
      ...normalizeManga({ ...details, slug }),
      title: details.title,
      id: slug,
      english_title: details.title,
      japanese_title: details.alternative,
      poster: details.image,
      rating: details.rating,
      synopsis: details.synopsis,
      status: details.info?.status || 'Unknown',
      type: details.info?.type || 'Manga',
      release_date: details.info?.released || '',
      studio: details.info?.author || 'Unknown', // author as studio
      producer: details.info?.posted_by?.trim() || 'Unknown',
      genres: details.genres || [],
      episode_list: (details.chapters || []).map((ch: any) => ({
        title: ch.title,
        id: ch.slug,
        date: ch.date
      })),
      isManga: true
    } as AnimeDetail
  };
};

export const getMangaChapter = async (slug: string) => {
  const data = await fetchJson<any>(`/comic/mangakita/chapter/${slug}`);
  
  const cleanNav = (val: string) => (val && val !== '#' && val !== '#prev' && val !== '#next') ? val : null;

  return {
    data: {
      title: data.title,
      comicSlug: data.comicSlug,
      images: data.images || [],
      navigation: {
        prev: cleanNav(data.navigation?.prev),
        next: cleanNav(data.navigation?.next)
      },
      relatedSeries: (data.relatedSeries || []).map(normalizeManga)
    } as MangaReaderData
  };
};
