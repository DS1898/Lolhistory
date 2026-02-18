import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChampionDataProvider } from './context/ChampionDataContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import PlayerSearchPage from './pages/PlayerSearchPage';
import PlayerProfilePage from './pages/PlayerProfilePage';
import TeamBuilderPage from './pages/TeamBuilderPage';
import ChampionsPage from './pages/ChampionsPage';

export default function App() {
  return (
    <BrowserRouter>
      <ChampionDataProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<PlayerSearchPage />} />
            <Route path="/player/:region/:gameName/:tagLine" element={<PlayerProfilePage />} />
            <Route path="/team-builder" element={<TeamBuilderPage />} />
            <Route path="/champions" element={<ChampionsPage />} />
          </Route>
        </Routes>
      </ChampionDataProvider>
    </BrowserRouter>
  );
}
