import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LeaderboardSection from './components/LeaderboardSection';
import TournamentSection from './components/TournamentSection';
import TeamsSection from './components/TeamsSection';
import PlayersSection from './components/PlayersSection';
import GamesSection from './components/GamesSection';
import PlayerOnboarding from './components/PlayerOnboarding';
import Login from './components/Login';
import { api } from './services/api';
import { CheckCircle2, RefreshCw, LogOut } from 'lucide-react';

// PrivateRoute component
const PrivateRoute = ({ children, currentUser }) => {
  if (currentUser === undefined) return null; // loading
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(undefined);

  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [games, setGames] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTourneyId, setSelectedTourneyId] = useState(null);
  
  const [teamLeaderboard, setTeamLeaderboard] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [loadError, setLoadError] = useState(null);

  // Get current active tournament object
  const currentTournament = tournaments.find(t => t.id === selectedTourneyId) || (tournaments.length > 0 ? tournaments[0] : null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = async () => {
    try {
      setLoadError(null);
      const [p, t, g, tour] = await Promise.all([
        api.getPlayers(),
        api.getTeams(),
        api.getGames(),
        api.getTournaments()
      ]);
      setPlayers(p || []);
      setTeams(t || []);
      setGames(g || []);
      setTournaments(tour || []);

      const activeTourney = (tour && tour.find(t => t.id === selectedTourneyId)) || (tour && tour.length > 0 ? tour[0] : null);

      if (activeTourney) {
        if (!selectedTourneyId) setSelectedTourneyId(activeTourney.id);
        const lb = await api.getLeaderboard(activeTourney.id);
        // New leaderboard format returns { teams, players }
        if (lb && lb.teams) {
          setTeamLeaderboard(lb.teams || []);
          setPlayerStats(lb.players || []);
        } else if (Array.isArray(lb)) {
          // Backward compatibility with old format
          setTeamLeaderboard(lb);
          setPlayerStats([]);
        } else {
          setTeamLeaderboard([]);
          setPlayerStats([]);
        }
      } else {
        setTeamLeaderboard([]);
        setPlayerStats([]);
      }

      let savedUserId = localStorage.getItem('gamerhub_user_id');
      if (savedUserId && p && p.length > 0) {
        const found = p.find(player => player.id === savedUserId);
        if (found) {
          setCurrentUser(found);
          const isUserAdmin = found.role === 'admin' || found.id === 'p1';
          setIsAdmin(isUserAdmin);
        } else {
          setCurrentUser(null);
          setIsAdmin(false);
        }
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }


    } catch (err) {
      console.error('Error cargando datos:', err);
      setLoadError(err.message || String(err));
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedTourneyId]);

  const handleLogin = (playerId) => {
    localStorage.setItem('gamerhub_user_id', playerId);
    const found = players.find(p => p.id === playerId);
    if (found) {
      setCurrentUser(found);
      setIsAdmin(found.role === 'admin' || found.id === 'p1');
      showToast(`¡Bienvenido de vuelta, ${found.nickname}!`);
      navigate('/leaderboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gamerhub_user_id');
    setCurrentUser(null);
    setIsAdmin(false);
    navigate('/login');
  };

  const handleOnboardingComplete = async (playerData) => {
    const newPlayer = await api.createPlayer({
      ...playerData,
      role: 'player',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`
    });

    localStorage.setItem('gamerhub_user_id', newPlayer.id);
    setCurrentUser(newPlayer);
    setIsAdmin(false);
    showToast(`¡Bienvenido ${newPlayer.nickname}! Te has registrado con éxito`);
    await loadData();
    navigate('/leaderboard');
  };

  // Handlers for Player CRUD
  const handleCreatePlayer = async (playerData) => {
    const newP = await api.createPlayer(playerData);
    showToast(`Jugador "${newP.nickname}" registrado`);
    loadData();
  };

  const handleUpdatePlayer = async (id, playerData) => {
    await api.updatePlayer(id, playerData);
    showToast('Perfil actualizado');
    loadData();
  };

  const handleDeletePlayer = async (id) => {
    await api.deletePlayer(id);
    showToast('Jugador eliminado');
    loadData();
  };

  // Handlers for Team CRUD
  const handleCreateTeam = async (teamData) => {
    const newT = await api.createTeam(teamData);
    showToast(`Equipo "${newT.name}" creado`);
    loadData();
  };

  const handleDeleteTeam = async (id) => {
    await api.deleteTeam(id);
    showToast('Equipo eliminado');
    loadData();
  };

  // Handlers for Game CRUD
  const handleCreateGame = async (gameData) => {
    const newG = await api.createGame(gameData);
    showToast(`Juego "${newG.name}" agregado`);
    loadData();
  };

  const handleDeleteGame = async (id) => {
    await api.deleteGame(id);
    showToast('Juego eliminado');
    loadData();
  };

  // Match Update (regular or FFA)
  const handleUpdateMatch = async (tourneyId, matchId, matchData) => {
    await api.updateMatch(tourneyId, matchId, matchData);
    showToast('Marcador guardado');
    loadData();
  };

  // Tournament Create (receives wizard data)
  const handleCreateTournament = async (tournamentData) => {
    const created = await api.createTournament(tournamentData);
    showToast(`¡Torneo "${created.name || 'Multijuego'}" creado con éxito!`);
    if (created && created.id) {
      setSelectedTourneyId(created.id);
    }
    await loadData();
  };

  // Tournament Delete
  const handleDeleteTournament = async (tourneyId) => {
    await api.deleteTournament(tourneyId);
    showToast('Torneo eliminado');
    setSelectedTourneyId(null);
    await loadData();
  };

  // Backup & Restore
  const handleExportBackup = async () => {
    try {
      const data = await api.exportBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gamerhub_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('¡Copia de seguridad descargada!');
    } catch (err) {
      showToast('Error al exportar datos');
    }
  };

  const handleRestoreBackup = async (backupData) => {
    try {
      await api.restoreBackup(backupData);
      showToast('¡Base de datos restaurada con éxito!');
      await loadData();
    } catch (err) {
      showToast('Error al restaurar respaldo');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar */}
      <Navbar 
        currentUser={currentUser}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        onExportBackup={handleExportBackup}
        onRestoreBackup={handleRestoreBackup}
      />

      {/* Client Routes */}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={currentUser ? <Navigate to="/leaderboard" replace /> : <Navigate to="/login" replace />} />
          
          <Route 
            path="/login" 
            element={<Login players={players} teams={teams} onLogin={handleLogin} loadError={loadError} />} 
          />

          <Route 
            path="/leaderboard" 
            element={
              <PrivateRoute currentUser={currentUser}>
                <LeaderboardSection 
                  teamLeaderboard={teamLeaderboard}
                  playerStats={playerStats}
                  tournament={currentTournament} 
                  teams={teams}
                  players={players}
                />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/tournament" 
            element={
              <PrivateRoute currentUser={currentUser}>
                <TournamentSection 
                  tournament={currentTournament} 
                  tournaments={tournaments}
                  teams={teams} 
                  games={games}
                  players={players}
                  isAdmin={isAdmin}
                  currentUser={currentUser}
                  selectedTourneyId={selectedTourneyId}
                  setSelectedTourneyId={setSelectedTourneyId}
                  onUpdateMatch={handleUpdateMatch}
                  onCreateTournament={handleCreateTournament}
                  onDeleteTournament={handleDeleteTournament}
                  onRefresh={loadData}
                />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/teams" 
            element={
              <PrivateRoute currentUser={currentUser}>
                <TeamsSection 
                  teams={teams} 
                  players={players}
                  isAdmin={isAdmin}
                  onCreateTeam={handleCreateTeam}
                  onDeleteTeam={handleDeleteTeam}
                />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/players" 
            element={
              <PrivateRoute currentUser={currentUser}>
                <PlayersSection 
                  players={players} 
                  teams={teams}
                  currentUser={currentUser}
                  isAdmin={isAdmin}
                  onCreatePlayer={handleCreatePlayer}
                  onUpdatePlayer={handleUpdatePlayer}
                  onDeletePlayer={handleDeletePlayer}
                  onShowToast={showToast}
                />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/games" 
            element={
              <PrivateRoute currentUser={currentUser}>
                <GamesSection 
                  games={games}
                  isAdmin={isAdmin}
                  onCreateGame={handleCreateGame}
                  onDeleteGame={handleDeleteGame}
                />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/register" 
            element={
              <PlayerOnboarding 
                games={games} 
                teams={teams} 
                onCompleteRegistration={handleOnboardingComplete} 
              />
            } 
          />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/leaderboard" replace />} />
        </Routes>
      </main>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="toast-notification">
          <CheckCircle2 color="var(--accent-emerald)" size={18} />
          {toastMessage}
        </div>
      )}

      {/* Footer & User Status bar */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        <div>
          GamerHub &copy; 2026 — Torneos de Amigos Multijuego
        </div>

        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              👤 Conectado como: <strong style={{ color: 'var(--accent-cyan)' }}>{currentUser.nickname}</strong> {currentUser.role === 'admin' && <span className="badge-pill badge-amber" style={{ marginLeft: '4px' }}>ADMIN</span>}
            </span>
            <button 
              onClick={handleLogout} 
              className="btn-subtle"
              style={{ padding: '3px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <LogOut size={12} />
              Cerrar Sesión
            </button>
          </div>
        )}
      </footer>

    </div>
  );
}
