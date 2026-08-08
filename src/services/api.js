// API Client for Organizador de Torneos
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Initial Fallback Storage (in case backend server is offline during initial preview)
const initialFallback = {
  players: [
    { id: 'p1', name: 'David', nickname: 'Davovich', role: 'admin', avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80', discord: 'Davovich#1337', steam: 'davovich_99', riot: 'Davovich#LAN', psn: 'Davovich_Play', xbox: 'DavoX', teamId: 't1', selectedGames: ['g_fn','g_cr','g_lol','g_l4d2','g_fg','g_mr','g_fifa','g_rl','g_au'] },
    { id: 'p2', name: 'Felipe', nickname: 'PipeStriker', role: 'player', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', discord: 'PipeStriker#9999', steam: 'pipestriker', riot: 'PipeStriker#LAS', psn: 'Pipe_PS5', xbox: 'PipeMaster', teamId: 't1', selectedGames: ['g_fn','g_fifa','g_rl','g_fg'] },
    { id: 'p3', name: 'Carlos', nickname: 'CharliPro', role: 'player', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80', discord: 'CharliPro#4422', steam: 'charlipro_gamer', riot: 'Charli#NA1', psn: 'Charli_Sony', xbox: 'CharliOne', teamId: 't2', selectedGames: ['g_lol','g_cr','g_mr','g_au'] },
    { id: 'p4', name: 'Andrés', nickname: 'AndyNinja', role: 'player', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80', discord: 'AndyNinja#8080', steam: 'andyninja', riot: 'Andy#LAN', psn: 'AndyPSN', xbox: 'AndyXbox', teamId: 't2', selectedGames: ['g_l4d2','g_fn','g_rl','g_au'] }
  ],
  teams: [
    { id: 't1', name: 'Cyber Alpha', tag: 'ALPHA', color: '#38bdf8', logo: '🛡️', description: 'Escuadrón dominante de Fortnite, Rocket League y FIFA' },
    { id: 't2', name: 'Neon Tryhards', tag: 'TRY', color: '#f472b6', logo: '⚡', description: 'Especialistas en LoL, Clash Royale y Marvel Rivals' }
  ],
  games: [
    { id: 'g_fn', name: 'Fortnite', category: 'Battle Royale / Survival', platforms: ['PC','PS5','Xbox','Switch'], format: '1v1 Zone Wars / Battle Royale Kills', availableModes: ['Zone Wars 1v1','Battle Royale (Top + Kills)','Box Fights 2v2'], modeFormats: { 'Zone Wars 1v1': '1v1', 'Battle Royale (Top + Kills)': 'ffa', 'Box Fights 2v2': '2v2' } },
    { id: 'g_cr', name: 'Clash Royale', category: 'Estrategia / Cartas', platforms: ['iOS','Android'], format: '1v1 Duelo de Mazos', availableModes: ['1v1 Mazo Normal','1v1 Elección (Triple Draft)','1v1 Mazo de Evento'], modeFormats: { '1v1 Mazo Normal': '1v1', '1v1 Elección (Triple Draft)': '1v1', '1v1 Mazo de Evento': '1v1' } },
    { id: 'g_lol', name: 'League of Legends', category: 'MOBA', platforms: ['PC'], format: '1v1 ARAM / 5v5', availableModes: ['1v1 ARAM (1ª Sangre / 100 Farm / 1ª Torre)','5v5 Summoner\'s Rift','Custom ARAM FFA'], modeFormats: { '1v1 ARAM (1ª Sangre / 100 Farm / 1ª Torre)': '1v1', '5v5 Summoner\'s Rift': 'team', 'Custom ARAM FFA': 'ffa' } },
    { id: 'g_l4d2', name: 'Left 4 Dead 2', category: 'Coop / Versus Horror', platforms: ['PC'], format: 'Modo Versus', availableModes: ['Modo Versus (Distancia + Daño)','Campañas por Tiempo Speedrun'], modeFormats: { 'Modo Versus (Distancia + Daño)': 'team', 'Campañas por Tiempo Speedrun': 'team' } },
    { id: 'g_fg', name: 'Fall Guys', category: 'Party / Obstáculos FFA', platforms: ['PC','PS5','Xbox','Switch'], format: 'FFA', availableModes: ['FFA (Puntos por Ronda Alcanzada)','Corona Final (50 pts al Campeón)'], modeFormats: { 'FFA (Puntos por Ronda Alcanzada)': 'ffa', 'Corona Final (50 pts al Campeón)': 'ffa' } },
    { id: 'g_mr', name: 'Marvel Rivals', category: 'Hero Shooter', platforms: ['PC','PS5','Xbox'], format: '6v6 / 3v3 Custom', availableModes: ['3v3 / 6v6 Custom Match por Mapas','1v1 Duelo de Héroes'], modeFormats: { '3v3 / 6v6 Custom Match por Mapas': 'team', '1v1 Duelo de Héroes': '1v1' } },
    { id: 'g_fifa', name: 'EA SPORTS FC / FIFA', category: 'Deportes / Fútbol', platforms: ['PC','PS5','Xbox'], format: '1v1 / 2v2', availableModes: ['1v1 Partido Único (90 min)','1v1 Ida y Vuelta (Global)','2v2 Co-op Teams'], modeFormats: { '1v1 Partido Único (90 min)': '1v1', '1v1 Ida y Vuelta (Global)': '1v1', '2v2 Co-op Teams': '2v2' } },
    { id: 'g_rl', name: 'Rocket League', category: 'Vehículos / Deportes', platforms: ['PC','PS5','Xbox','Switch'], format: '1v1, 2v2 o 3v3', availableModes: ['2v2 Co-op (Mejor de 3)','1v1 Duelo Directo','3v3 (Mejor de 5)'], modeFormats: { '2v2 Co-op (Mejor de 3)': '2v2', '1v1 Duelo Directo': '1v1', '3v3 (Mejor de 5)': 'team' } },
    { id: 'g_au', name: 'Among Us', category: 'Deducción Social', platforms: ['PC','PS5','Xbox','Switch','iOS','Android'], format: 'FFA', availableModes: ['FFA (Puntos por Victoria Impostor / Tripulante)','Hide & Seek (Escondite)'], modeFormats: { 'FFA (Puntos por Victoria Impostor / Tripulante)': 'ffa', 'Hide & Seek (Escondite)': 'ffa' } }
  ],
  tournaments: []
};

// FFA auto-points by placement
const FFA_POINTS = [25, 20, 15, 10, 8, 5, 3, 2, 1];

export function getFfaPointsForPlacement(placement) {
  if (placement < 1) return 0;
  return FFA_POINTS[placement - 1] || 1;
}

// Check local storage for fallback persistence
function getLocalFallback() {
  const saved = localStorage.getItem('gamerhub_fallback_db');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { }
  }
  return JSON.parse(JSON.stringify(initialFallback));
}

function saveLocalFallback(data) {
  localStorage.setItem('gamerhub_fallback_db', JSON.stringify(data));
}

// Request Wrapper
async function request(endpoint, options = {}) {
  try {
    const method = options.method ? options.method.toUpperCase() : 'GET';
    let url = `${BASE_URL}${endpoint}`;
    
    // Add cache buster for GET requests
    if (method === 'GET') {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}_t=${Date.now()}`;
    }

    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`⚠️ Backend offline (${BASE_URL}${endpoint}). Usando almacenamiento local.`, err.message);
    return handleFallback(endpoint, options);
  }
}

// Fallback Handler
function handleFallback(endpoint, options) {
  const method = options.method ? options.method.toUpperCase() : 'GET';
  const db = getLocalFallback();
  const body = options.body ? JSON.parse(options.body) : {};

  // GET /health
  if (endpoint === '/health') return { status: 'offline-mode', service: 'Local Storage Fallback' };

  // PLAYERS
  if (endpoint === '/players' && method === 'GET') return db.players;
  if (endpoint === '/players' && method === 'POST') {
    const newP = { id: 'p_' + Date.now(), ...body };
    db.players.push(newP);
    saveLocalFallback(db);
    return newP;
  }
  if (endpoint.startsWith('/players/') && method === 'PUT') {
    const id = endpoint.replace('/players/', '');
    const idx = db.players.findIndex(p => p.id === id);
    if (idx !== -1) {
      db.players[idx] = { ...db.players[idx], ...body };
      saveLocalFallback(db);
      return db.players[idx];
    }
  }
  if (endpoint.startsWith('/players/') && method === 'DELETE') {
    const id = endpoint.replace('/players/', '');
    db.players = db.players.filter(p => p.id !== id);
    saveLocalFallback(db);
    return { success: true };
  }

  // TEAMS
  if (endpoint === '/teams' && method === 'GET') return db.teams;
  if (endpoint === '/teams' && method === 'POST') {
    const newT = { id: 't_' + Date.now(), ...body };
    db.teams.push(newT);
    saveLocalFallback(db);
    return newT;
  }
  if (endpoint.startsWith('/teams/') && method === 'DELETE') {
    const id = endpoint.replace('/teams/', '');
    db.teams = db.teams.filter(t => t.id !== id);
    saveLocalFallback(db);
    return { success: true };
  }

  // GAMES
  if (endpoint === '/games' && method === 'GET') return db.games;
  if (endpoint === '/games' && method === 'POST') {
    const newG = { id: 'g_' + Date.now(), ...body };
    db.games.push(newG);
    saveLocalFallback(db);
    return newG;
  }

  // TOURNAMENTS
  if (endpoint === '/tournaments' && method === 'GET') return db.tournaments;
  if (endpoint === '/tournaments' && method === 'POST') {
    const newTourney = {
      id: 'tourney_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      status: 'in_progress',
      participatingPlayerIds: body.participatingPlayerIds || [],
      participatingTeamIds: body.participatingTeamIds || [],
      ...body
    };
    db.tournaments.unshift(newTourney);
    saveLocalFallback(db);
    return newTourney;
  }
  if (endpoint.startsWith('/tournaments/') && !endpoint.includes('/matches/') && !endpoint.includes('/leaderboard') && method === 'DELETE') {
    const id = endpoint.replace('/tournaments/', '');
    db.tournaments = db.tournaments.filter(t => t.id !== id);
    saveLocalFallback(db);
    return { success: true };
  }

  // UPDATE MATCH (regular or FFA)
  if (endpoint.startsWith('/tournaments/') && endpoint.includes('/matches/') && method === 'POST') {
    const parts = endpoint.split('/');
    const tourneyId = parts[2];
    const matchId = parts[4];
    const t = db.tournaments.find(tour => tour.id === tourneyId);
    if (t) {
      for (let r of t.rounds) {
        const m = r.matches.find(match => match.id === matchId);
        if (m) {
          // FFA match update
          if (body.rankings) {
            m.rankings = body.rankings;
            m.status = 'completed';
          } else {
            // Regular match update
            m.score1 = parseInt(body.score1) || 0;
            m.score2 = parseInt(body.score2) || 0;
            m.pointsAwarded = parseInt(body.pointsAwarded) || 15;
            if (m.score1 > m.score2) m.winnerId = m.team1Id;
            else if (m.score2 > m.score1) m.winnerId = m.team2Id;
            else m.winnerId = 'draw';
            m.status = 'completed';
          }

          // Update round status
          const allCompleted = r.matches.every(match => match.status === 'completed');
          if (allCompleted) r.status = 'completed';

          saveLocalFallback(db);
          return { tournament: t, updatedMatch: m };
        }
      }
    }
  }

  // LEADERBOARD (supports both regular and FFA)
  if (endpoint.startsWith('/tournaments/') && endpoint.endsWith('/leaderboard') && method === 'GET') {
    const tourneyId = endpoint.split('/')[2];
    const tournament = db.tournaments.find(t => t.id === tourneyId);
    const teamScores = {};
    const playerStats = {};

    db.teams.forEach(team => {
      teamScores[team.id] = {
        teamId: team.id, teamName: team.name, teamTag: team.tag,
        teamColor: team.color, teamLogo: team.logo, totalPoints: 0,
        wins: 0, losses: 0, draws: 0, matchesPlayed: 0
      };
    });

    db.players.forEach(player => {
      playerStats[player.id] = {
        playerId: player.id, playerName: player.name, playerNickname: player.nickname,
        playerAvatar: player.avatar, teamId: player.teamId,
        teamName: (db.teams.find(t => t.id === player.teamId) || {}).name || '',
        wins1v1: 0, ffaPoints: 0, totalPoints: 0
      };
    });

    if (tournament) {
      tournament.rounds.forEach(round => {
        round.matches.forEach(match => {
          if (match.status !== 'completed') return;

          if (match.format === 'ffa' && match.rankings) {
            // FFA scoring
            match.rankings.forEach(rank => {
              const ps = playerStats[rank.playerId];
              const ts = teamScores[rank.teamId];
              if (ps) {
                ps.ffaPoints += (rank.points || 0);
                ps.totalPoints += (rank.points || 0);
              }
              if (ts) {
                ts.totalPoints += (rank.points || 0);
                ts.matchesPlayed = Math.max(ts.matchesPlayed, 1); // count FFA as 1 per round
              }
            });
          } else if (match.winnerId) {
            // Regular match scoring
            const points = match.pointsAwarded || 15;
            const t1 = teamScores[match.team1Id];
            const t2 = teamScores[match.team2Id];

            if (t1) t1.matchesPlayed++;
            if (t2) t2.matchesPlayed++;

            if (match.winnerId === match.team1Id) {
              if (t1) { t1.wins++; t1.totalPoints += points; }
              if (t2) { t2.losses++; }
              // Track player wins
              (match.team1Players || []).forEach(pid => {
                if (playerStats[pid]) { playerStats[pid].wins1v1++; playerStats[pid].totalPoints += points; }
              });
            } else if (match.winnerId === match.team2Id) {
              if (t2) { t2.wins++; t2.totalPoints += points; }
              if (t1) { t1.losses++; }
              (match.team2Players || []).forEach(pid => {
                if (playerStats[pid]) { playerStats[pid].wins1v1++; playerStats[pid].totalPoints += points; }
              });
            } else if (match.winnerId === 'draw') {
              if (t1) { t1.draws++; t1.totalPoints += Math.floor(points / 2); }
              if (t2) { t2.draws++; t2.totalPoints += Math.floor(points / 2); }
            }
          }
        });
      });
    }

    return {
      teams: Object.values(teamScores).sort((a, b) => b.totalPoints - a.totalPoints),
      players: Object.values(playerStats).sort((a, b) => b.totalPoints - a.totalPoints)
    };
  }

  return [];
}

// API methods
export const api = {
  // Health
  checkHealth: () => request('/health'),

  // Players
  getPlayers: () => request('/players'),
  createPlayer: (data) => request('/players', { method: 'POST', body: JSON.stringify(data) }),
  updatePlayer: (id, data) => request(`/players/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePlayer: (id) => request(`/players/${id}`, { method: 'DELETE' }),

  // Teams
  getTeams: () => request('/teams'),
  createTeam: (data) => request('/teams', { method: 'POST', body: JSON.stringify(data) }),
  deleteTeam: (id) => request(`/teams/${id}`, { method: 'DELETE' }),

  // Games
  getGames: () => request('/games'),
  createGame: (data) => request('/games', { method: 'POST', body: JSON.stringify(data) }),
  deleteGame: (id) => request(`/games/${id}`, { method: 'DELETE' }),

  // Tournaments
  getTournaments: () => request('/tournaments'),
  createTournament: (data) => request('/tournaments', { method: 'POST', body: JSON.stringify(data) }),
  updateTournament: (id, data) => request(`/tournaments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTournament: (id) => request(`/tournaments/${id}`, { method: 'DELETE' }),
  updateMatch: (tourneyId, matchId, data) => request(`/tournaments/${tourneyId}/matches/${matchId}`, { method: 'POST', body: JSON.stringify(data) }),
  addManualMatch: (tourneyId, roundId, data) => request(`/tournaments/${tourneyId}/rounds/${roundId}/matches`, { method: 'POST', body: JSON.stringify(data) }),
  getLeaderboard: (tourneyId) => request(`/tournaments/${tourneyId}/leaderboard`),

  // Backup & Restore
  exportBackup: () => request('/backup/export'),
  restoreBackup: (data) => request('/backup/restore', { method: 'POST', body: JSON.stringify(data) })
};
