# FlashyNime

![FlashyNime Banner](https://raw.githubusercontent.com/riioo-x/flash-nime/main/public/banner.png)

**FlashyNime** is a cutting-edge, premium streaming platform dedicated to Anime, Donghua, and Manga enthusiasts. Built with a focus on aesthetics, speed, and user experience, it features a Netflix-style modern interface, real-time schedule updates, and a comprehensive library of content.

> **Disclaimer:** This project is a front-end client. It does not host any video files or media on its servers. All content is scraped and provided by non-affiliated third-party providers.

## 🚀 Key Features

*   **Immersive UI/UX:** A sleek, dark-mode-first design built with Tailwind CSS, featuring glassmorphism effects, smooth transitions, and a responsive layout for all devices.
*   **Triple Library:** Seamlessly switch between Japanese **Anime**, Chinese **Donghua**, and **Manga/Manhwa** content.
*   **Streaming & Reading:**
    *   High-definition video player with multi-server support.
    *   Direct download links for episodes and full-season batches.
    *   Full-screen, vertical manga reader.
*   **Smart Features:**
    *   **Watchlist:** Save your favorite shows locally.
    *   **History:** Automatically tracks your watch/read progress.
    *   **Auto-Play:** Automatically queues the next episode with a countdown timer.
    *   **Schedule:** Real-time weekly release schedules for Anime & Donghua.
*   **Search & Discovery:** Advanced filtering by genre, status (ongoing/completed), season, and release year.
*   **PWA Support:** Installable as a Progressive Web App for a native-like experience.
*   **Multi-Language:** Fully localized interface in **English** and **Indonesian**.

## 🛠 Tech Stack

*   **Core:** [React 18](https://react.dev/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand) (with local storage persistence)
*   **Routing:** [React Router v6](https://reactrouter.com/)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Data Fetching:** Native Fetch API with custom proxy handling strategies.

## ⚙️ Installation & Setup

Follow these steps to set up the project locally.

### Prerequisites

*   Node.js (v18.0.0 or higher)
*   npm or yarn

### Steps

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/flashynime.git
    cd flashynime
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The app will be available at `http://localhost:5173`.

4.  **Build for production**
    ```bash
    npm run build
    ```

## 📂 Project Structure

```
flashynime/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components (Navbar, Footer, Cards, etc.)
│   │   └── ui.tsx       # Core design system components (Button, Badge, etc.)
│   ├── pages/           # Route pages (Home, Details, Watch, MangaRead etc.)
│   ├── services/        # API integration logic
│   │   └── api.ts       # Centralized API fetcher & normalization logic
│   ├── store/           # Global state management
│   │   └── store.ts     # Zustand store definition
│   ├── utils/           # Helper functions
│   │   └── translations.ts # i18n dictionaries
│   ├── types.ts         # TypeScript interface definitions
│   ├── App.tsx          # Main application component & Routing
│   └── index.tsx        # App entry point
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🔌 API Reference

FlashyNime uses a custom scraping API endpoint structure targeting `sankavollerei.com`. The API includes a robust proxy fallback mechanism to handle CORS issues.

**Base URL:** `https://www.sankavollerei.com`

### Anime (Samehadaku)
| Resource | Endpoint | Description |
| :--- | :--- | :--- |
| **Home** | `/anime/samehadaku/home` | Aggregated home data (recent, popular, movies). |
| **Detail** | `/anime/samehadaku/anime/{id}` | Full anime metadata and episode list. |
| **Episode** | `/anime/samehadaku/episode/{id}` | Stream links and server embeds. |
| **Search** | `/anime/samehadaku/search?q={query}` | Search functionality. |
| **Schedule** | `/anime/samehadaku/schedule` | Weekly release schedule. |

### Donghua
| Resource | Endpoint | Description |
| :--- | :--- | :--- |
| **Home** | `/anime/donghua/home/{page}` | Donghua specific home data. |
| **Detail** | `/anime/donghua/detail/{id}` | Full donghua metadata and episode list. |
| **Episode** | `/anime/donghua/episode/{id}` | Stream links and server embeds. |
| **Search** | `/anime/donghua/search/{query}` | Search functionality for Donghua. |

### Manga (Mangakita)
| Resource | Endpoint | Description |
| :--- | :--- | :--- |
| **Home** | `/comic/mangakita/home` | Trending and latest manga releases. |
| **Detail** | `/comic/mangakita/detail/{slug}` | Full manga metadata and chapter list. |
| **Chapter** | `/comic/mangakita/chapter/{slug}` | Image URLs for a specific chapter. |
| **Search** | `/comic/mangakita/search/{query}/{page}` | Search functionality for Manga. |
| **Genres** | `/comic/mangakita/genres` | List of all available manga genres. |


## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## ❤️ Acknowledgements

*   **Samehadaku**, **Anichin**, **Mangakita** & other sources for content availability.
*   **Vercel** for hosting infrastructure support.

---

<div align="center">
  <p>Made with ❤️ by Rio</p>
</div>
