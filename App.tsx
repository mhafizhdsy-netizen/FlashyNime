
import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Detail } from './pages/Details';
import { Watch } from './pages/Watch';
import { Browse } from './pages/Browse';
import { Search } from './pages/Search';
import { Schedule } from './pages/Schedule';
import { Watchlist } from './pages/Watchlist';
import { History } from './pages/History';
import { BatchList } from './pages/BatchList';
import { BatchDetail } from './pages/BatchDetail';
import { About } from './pages/About';
import { GenreList } from './pages/GenreList';

// Donghua Pages
import { Donghua } from './pages/Donghua';
import { DonghuaDetail } from './pages/DonghuaDetail';
import { DonghuaWatch } from './pages/DonghuaWatch';
import { DonghuaBrowse } from './pages/DonghuaBrowse';
import { DonghuaSchedule } from './pages/DonghuaSchedule';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-violet-500/30">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Anime Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/anime/:id" element={<Detail />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/movies" element={<Browse />} />
            <Route path="/popular" element={<Browse />} />
            <Route path="/search" element={<Search />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/batch" element={<BatchList />} />
            <Route path="/batch/:id" element={<BatchDetail />} />
            <Route path="/genres" element={<GenreList type="anime" />} />
            
            {/* Donghua Routes */}
            <Route path="/donghua" element={<Donghua />} />
            <Route path="/donghua/detail/:id" element={<DonghuaDetail />} />
            <Route path="/donghua/watch/:id" element={<DonghuaWatch />} />
            <Route path="/donghua/browse" element={<DonghuaBrowse />} />
            <Route path="/donghua/schedule" element={<DonghuaSchedule />} />
            <Route path="/donghua/genres" element={<GenreList type="donghua" />} />

            {/* Shared Routes */}
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/history" element={<History />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
