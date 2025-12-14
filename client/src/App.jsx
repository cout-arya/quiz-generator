import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HostDashboard from './pages/HostDashboard';
import PlayerGame from './pages/PlayerGame';
import HostLogin from './pages/HostLogin';
import PlayerJoin from './pages/PlayerJoin';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/host/login" element={<HostLogin />} />
      <Route path="/player/join" element={<PlayerJoin />} />
      <Route path="/host" element={<HostDashboard />} />
      <Route path="/game/:pin" element={<PlayerGame />} />
    </Routes>
  );
}

export default App;
