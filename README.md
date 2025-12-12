# FlashyNime

![FlashyNime Banner](https://via.placeholder.com/1200x600/020617/7c3aed?text=FlashyNime+Streaming+Platform)

**FlashyNime** is a cutting-edge, premium streaming platform dedicated to Anime and Donghua enthusiasts. Built with a focus on aesthetics, speed, and user experience, it features a Netflix-style modern interface, real-time schedule updates, and a comprehensive library of content.

> **Disclaimer:** This project is a front-end client. It does not host any video files or media on its servers. All content is scraped and provided by non-affiliated third-party providers.

## 🚀 Key Features

*   **Immersive UI/UX:** A sleek, dark-mode-first design built with Tailwind CSS, featuring glassmorphism effects, smooth transitions, and a responsive layout for all devices.
*   **Dual Library:** Seamlessly switch between Japanese **Anime** and Chinese **Donghua** content.
*   **Streaming & Download:**
    *   High-definition video player with multi-server support.
    *   Direct download links for episodes.
    *   **Batch Downloads:** Download full seasons in a single click.
*   **Smart Features:**
    *   **Watchlist:** Save your favorite shows locally.
    *   **History:** Automatically tracks your watch progress.
    *   **Auto-Play:** Automatically queues the next episode with a countdown timer.
    *   **Schedule:** Real-time weekly release schedules.
*   **Search & Discovery:** Advanced filtering by genre, status (ongoing/completed), season, and release year.
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
│   ├── components/      # Reusable UI components (Navbar, Footer, AnimeCard, etc.)
│   │   └── ui.tsx       # Core design system components (Button, Badge, etc.)
│   ├── pages/           # Route pages (Home, Details, Watch, Browse, etc.)
│   ├── services/        # API integration logic
│   │   └── api.ts       # Centralized API fetcher & normalization logic
│   ├── store/           # Global state management
│   │   └── store.ts     # Zustand store definition
│   ├── utils/           # Helper functions
│   │   └── translations.ts # i18n dictionaries
│   ├── types.ts         # TypeScript interface definitions
│   ├── App.tsx          # Main application component & Routing
│   └── index.css        # Tailwind directives & global styles
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🔌 API Reference

FlashyNime uses a custom scraping API endpoint structure targeting `sankavollerei.com`.

| Resource | Endpoint | Description |
| :--- | :--- | :--- |
| **Home** | `/anime/samehadaku/home` | Aggregated home data (recent, popular, movies). |
| **Detail** | `/anime/samehadaku/anime/{id}` | Full anime metadata and episode list. |
| **Episode** | `/anime/samehadaku/episode/{id}` | Stream links and server embeds. |
| **Search** | `/anime/samehadaku/search?q={query}` | Search functionality. |
| **Donghua** | `/anime/donghua/home/{page}` | Donghua specific home data. |

*Note: The API logic includes a robust proxy fallback mechanism (CorsProxy.io, AllOrigins) to handle CORS issues in browser environments.*

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## ❤️ Acknowledgements

*   **Samehadaku** & **Donghua Sources** for content availability.
*   **Vercel** for hosting infrastructure support.

---

<div align="center">
  <p>Made with ❤️ by Rio</p>
</div>
