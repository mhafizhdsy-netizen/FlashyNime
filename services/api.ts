
import { Anime, AnimeDetail, EpisodeDetail, ScheduleDay, Genre, BatchDetail, QualityLinks, DownloadLink, ServerQuality, VideoServer } from '../types';

// New Base URL from instructions
const BASE_URL = 'https://www.sankavollerei.com';

// Helper to get a working proxy URL (kept for redundancy/CORS)
const getProxyUrls = (targetUrl: string) => [
  // 1. CorsProxy.io - Fast
  `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
  // 2. AllOrigins - Reliable
  `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
  // 3. Direct (if CORS allows)
  targetUrl 
];

async function fetchJson<T>(endpoint: string): Promise<T> {
  const targetUrl = `${BASE_URL}${endpoint}`;
  const urlsToTry = getProxyUrls(targetUrl);
  
  let lastError;

  for (const url of urlsToTry) {
    try {
      const controller = new AbortController();
      // Increased timeout to 20s to reduce aborts on slow connections
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      try {
        const res = await fetch(url, {
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const text = await res.text();
          try {
            const json = JSON.parse(text);
            // Check for proxy wrapper or direct response
            if (json.contents) {
               return JSON.parse(json.contents);
            }
            return json;
          } catch {
            // If parsing fails, try next proxy
            continue;
          }
        }
      } catch (innerError: any) {
        clearTimeout(timeoutId);
        // Ignore abort errors from timeout
        if (innerError.name === 'AbortError') {
             // Treat as timeout/failure for this proxy, try next
             lastError = new Error("Request timed out");
             continue;
        }
        throw innerError;
      }
    } catch (e) {
      lastError = e;
    }
  }
  
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
    isDonghua: false
  };
};

export const normalizeDonghua = (data: any): Anime => {
  if (!data) return { id: 'unknown', title: 'Unknown', poster: '', status: '', isDonghua: true } as Anime;
  
  let episode = '';
  if (data.current_episode) episode = data.current_episode.replace(/^Ep\s+/i, '');
  else if (data.episode) episode = data.episode.replace(/^Ep\s+/i, '');

  const id = data.slug || data.id || '';

  return {
    title: data.title,
    id: id,
    poster: data.poster,
    status: data.status,
    rating: data.rating || 'N/A',
    genres: data.genres ? data.genres.map((g: any) => g.name) : [],
    episode: episode,
    type: data.type || 'Donghua',
    release_day: data.released || data.released_on || '',
    last_update: data.updated_on || '',
    isDonghua: true
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
      popular: (homeData.top10?.animeList || []).map(normalizeAnime),
      batch: homeData.batch?.batchList || []
    }
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
        anime_list: d.animeList.map(normalizeAnime)
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
  return {
    latest: (data.latest_release || []).map(normalizeDonghua),
    completed: (data.completed_donghua || []).map(normalizeDonghua)
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
      anime_list: (d.donghua_list || []).map(normalizeDonghua)
    }))
  };
};

export const searchDonghua = async (query: string) => {
  const data = await fetchJson<any>(`/anime/donghua/search/${encodeURIComponent(query)}`);
  return { search_results: (data.data || []).map(normalizeDonghua) };
};

export const getDonghuaDetail = async (id: string) => {
  const d = await fetchJson<any>(`/anime/donghua/detail/${id}`);
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
  const d = await fetchJson<any>(`/anime/donghua/episode/${id}`);
  
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
