
export interface Anime {
  title: string;
  id: string; // Mapped from animeId, episodeId, or batchId
  poster: string;
  status: string;
  rating?: string; // Mapped from score
  genres?: string[];
  episode?: string;
  type?: string;
  release_day?: string; // Mapped from releasedOn
  last_update?: string;
  isDonghua?: boolean; // New flag to identify content type
  rank?: number; // For Top 10
}

export interface DownloadLink {
  title: string; // e.g. "Google Drive", "Mega"
  link: string;
}

export interface QualityLinks {
  quality: string; // e.g. "360p", "480p", "720p", "1080p"
  links: DownloadLink[];
}

export interface AnimeDetail extends Anime {
  japanese_title?: string;
  english_title?: string;
  score?: string;
  producer?: string;
  type: string;
  total_episodes?: number | string;
  duration?: string;
  release_date?: string;
  studio?: string;
  synopsis: string | string[]; // Can be array of paragraphs
  batch_link?: {
    id: string;
    link: string;
    text: string;
  };
  episode_list: {
    title: string | number;
    id: string; // episodeId
    date?: string;
  }[];
  recommendations?: Anime[];
}

export interface VideoServer {
  title: string;
  serverId: string; // For Anime: serverId used to fetch embed. For Donghua: direct URL or identifier
  href: string;     // Used as direct URL for Donghua
}

export interface ServerQuality {
  title: string; // e.g. "360p", "480p", "MP4"
  serverList: VideoServer[];
}

export interface EpisodeDetail {
  title: string;
  id: string;
  anime_id: string;
  stream_link: string; // Default streaming URL
  servers?: ServerQuality[]; // List of available servers by quality
  download_links?: QualityLinks[]; 
  prev_episode?: string; // id of prev
  next_episode?: string; // id of next
}

export interface BatchDetail {
  title: string;
  id: string;
  poster: string;
  status: string;
  download_links: QualityLinks[];
}

export interface Genre {
  title: string;
  genreId: string;
  href: string;
}

export interface ScheduleDay {
  day: string;
  animeList: any[]; // Raw list to be normalized
}

export interface AnimeGroup {
  startWith: string;
  animeList: Anime[];
}

export interface HomeData {
  recent: Anime[];
  popular: Anime[];
  movies: Anime[];
  top10: Anime[];
  batch?: any[];
}

export type CategoryType = 'anime' | 'donghua';
