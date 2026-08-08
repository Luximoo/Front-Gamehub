import React, { useState } from 'react';
import { Plus, Gamepad2, Save, Trash2, Trophy, Clock, CheckCircle2, Users, Swords, Shield, Filter, Award, Sparkles, User, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import CreateTournamentModal from './CreateTournamentModal';
import { api } from '../services/api';

export default function TournamentSection({ tournament, tournaments, teams, games, players, isAdmin, currentUser, selectedTourneyId, setSelectedTourneyId, onUpdateMatch, onCreateTournament, onDeleteTournament, onRefresh }) {
  const [matchScores, setMatchScores] = useState({});
  const [ffaScores, setFfaScores] = useState({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Filter States
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'completed'
  const [playerFilter, setPlayerFilter] = useState('all'); // 'all', 'my_matches'
  const [gameFilter, setGameFilter] = useState('all');

  // Manual Match State
  const [manualMatchRound, setManualMatchRound] = useState(null);
  const [manualP1, setManualP1] = useState('');
  const [manualP2, setManualP2] = useState('');

  // Podium / Celebration Modal State
  const [showPodiumModal, setShowPodiumModal] = useState(false);

  const handleScoreChange = (matchId, teamNum, value) => {
    setMatchScores(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], [teamNum]: parseInt(value) || 0 }
    }));
  };

  const handleSaveScore = (match) => {
    const scores = matchScores[match.id] || { 1: match.score1, 2: match.score2 };
    onUpdateMatch(tournament.id, match.id, { score1: scores[1], score2: scores[2], pointsAwarded: match.pointsAwarded || 15 });
  };

  const handleFfaPlacementChange = (matchId, playerId, placement) => {
    setFfaScores(prev => {
      const current = prev[matchId] || [];
      const filtered = current.filter(r => r.playerId !== playerId);
      return {
        ...prev,
        [matchId]: [...filtered, { playerId, placement: parseInt(placement) || 0 }]
      };
    });
  };

  const handleSaveFfa = (match) => {
    const edits = ffaScores[match.id] || [];
    
    let newRankings = match.rankings.map(r => {
      const edit = edits.find(e => e.playerId === r.playerId);
      return edit ? { ...r, placement: edit.placement } : r;
    });
    
    newRankings.sort((a, b) => {
      if (a.placement === 0) return 1;
      if (b.placement === 0) return -1;
      return a.placement - b.placement;
    });
    
    const pointScale = [25, 20, 15, 10, 8];
    newRankings = newRankings.map((r, i) => ({
      ...r,
      points: r.placement > 0 ? (pointScale[i] || 5) : 0
    }));

    onUpdateMatch(tournament.id, match.id, { rankings: newRankings, status: 'completed' });
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const handleFinishTournament = async () => {
    triggerConfetti();
    setShowPodiumModal(true);
    await api.updateTournament(tournament.id, { status: 'completed' });
  };

  const handleAddFfaMatch = async (round) => {
    const defaultRankings = tournament.participatingPlayerIds.map(pId => {
      const p = players.find(x => x.id === pId);
      return { playerId: pId, teamId: p ? p.teamId : '', placement: 0, points: 0 };
    });

    await api.addManualMatch(tournament.id, round.id, {
      format: 'ffa',
      name: `Partida ${round.matches.length + 1}`,
      rankings: defaultRankings
    });

    if (onRefresh) await onRefresh();
  };

  const handleAddManualMatchSubmit = async (e) => {
    e.preventDefault();
    if (!manualMatchRound || !manualP1 || !manualP2) return;

    const p1Obj = players.find(p => p.id === manualP1);
    const p2Obj = players.find(p => p.id === manualP2);

    await api.addManualMatch(tournament.id, manualMatchRound.id, {
      team1Id: p1Obj?.teamId || tournament.participatingTeamIds[0],
      team2Id: p2Obj?.teamId || tournament.participatingTeamIds[1],
      team1Players: [manualP1],
      team2Players: [manualP2],
      pointsAwarded: 15
    });

    setManualMatchRound(null);
    setManualP1('');
    setManualP2('');
    if (onRefresh) await onRefresh();
  };

  const getFormatBadge = (fmt) => {
    switch (fmt) {
      case '1v1': return <span className="badge-cyan" style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', background: 'rgba(34,211,238,0.1)', color: 'var(--accent-cyan)' }}>1v1</span>;
      case '2v2': return <span className="badge-purple" style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', background: 'rgba(167,139,250,0.1)', color: 'var(--accent-purple)' }}>2v2</span>;
      case 'team': return <span className="badge-amber" style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', background: 'rgba(251,191,36,0.1)', color: 'var(--accent-amber)' }}>EQUIPO</span>;
      case 'ffa': return <span className="badge-pink" style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', background: 'rgba(244,114,182,0.1)', color: 'var(--accent-pink)' }}>FFA</span>;
      default: return null;
    }
  };

  const renderPlayer = (id) => {
    const p = players.find(x => x.id === id);
    if (!p) return null;
    return (
      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <img src={p.avatar} alt={p.nickname} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{p.nickname}</span>
      </div>
    );
  };

  if (!tournament || !tournament.rounds || tournament.rounds.length === 0) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Trophy size={28} color="var(--accent-cyan)" /> Torneos</h2>
        </div>
        <div className="card-minimal" style={{ padding: '5rem 2rem', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px dashed var(--border-subtle)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Gamepad2 size={40} color="var(--text-muted)" />
          </div>
          <h3 style={{ color: 'white', marginBottom: '0.75rem', fontSize: '1.5rem' }}>No hay torneos activos</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>Organiza tu primer torneo para empezar la competencia. Gestiona rondas, partidas y clasificaciones automáticamente.</p>
          {isAdmin && (
            <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.75rem', borderRadius: '8px', background: 'var(--accent-cyan)', color: 'black', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1rem', transition: 'opacity 0.2s' }}>
              <Plus size={20} /> Crear Mi Primer Torneo
            </button>
          )}
        </div>
        <CreateTournamentModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} games={games} teams={teams} players={players} onCreateTournament={onCreateTournament} />
      </div>
    );
  }

  // Calculate filtered rounds
  const filteredRounds = tournament.rounds.filter(r => {
    if (gameFilter !== 'all' && r.gameId !== gameFilter) return false;
    return true;
  });

  const isTournamentCompleted = tournament.status === 'completed';

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <h2 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.75rem' }}>
            <Trophy size={32} color="var(--accent-cyan)" /> {tournament.name}
          </h2>
          
          <span className={`badge-pill ${isTournamentCompleted ? 'badge-amber' : 'badge-emerald'}`} style={{ fontSize: '0.85rem', padding: '4px 10px' }}>
            {isTournamentCompleted ? '🏆 FINALIZADO' : '⚡ EN PROGRESO'}
          </span>

          {tournaments && tournaments.length > 1 && (
            <select 
              value={selectedTourneyId} 
              onChange={e => setSelectedTourneyId(e.target.value)}
              style={{ padding: '0.65rem', borderRadius: '6px', background: 'var(--bg-surface)', color: 'white', border: '1px solid var(--border-subtle)', outline: 'none' }}
            >
              {tournaments.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {isAdmin && (
            <button 
              onClick={handleFinishTournament}
              className="btn-primary" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: '6px', background: 'var(--accent-amber)', color: 'black', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
            >
              <Award size={18} /> Coronar y Finalizar Torneo
            </button>
          )}

          {isAdmin && (
            <button onClick={() => onDeleteTournament(tournament.id)} className="btn-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: '6px', background: 'rgba(244,114,182,0.1)', color: 'var(--accent-pink)', border: '1px solid rgba(244,114,182,0.3)', cursor: 'pointer', fontWeight: '500' }}>
              <Trash2 size={18} /> Eliminar Torneo
            </button>
          )}
          
          {isAdmin && (
            <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: '6px', background: 'var(--accent-cyan)', color: 'black', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              <Plus size={18} /> Nuevo Torneo
            </button>
          )}
        </div>
      </div>

      {tournament.description && (
        <div style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.05rem', maxWidth: '800px', lineHeight: '1.5' }}>
          {tournament.description}
        </div>
      )}

      {/* FILTER BAR */}
      <div className="card-minimal" style={{ background: 'var(--bg-surface)', padding: '1rem 1.5rem', borderRadius: '10px', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
          <Filter size={18} color="var(--accent-cyan)" />
          Filtros:
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Status Filter */}
          <div style={{ display: 'flex', background: 'var(--bg-main)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <button onClick={() => setStatusFilter('all')} style={{ padding: '5px 12px', borderRadius: '6px', background: statusFilter === 'all' ? 'var(--bg-surface-hover)' : 'transparent', color: statusFilter === 'all' ? 'white' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>Todos</button>
            <button onClick={() => setStatusFilter('pending')} style={{ padding: '5px 12px', borderRadius: '6px', background: statusFilter === 'pending' ? 'var(--bg-surface-hover)' : 'transparent', color: statusFilter === 'pending' ? 'white' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>Pendientes ⏳</button>
            <button onClick={() => setStatusFilter('completed')} style={{ padding: '5px 12px', borderRadius: '6px', background: statusFilter === 'completed' ? 'var(--bg-surface-hover)' : 'transparent', color: statusFilter === 'completed' ? 'white' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>Completados ✅</button>
          </div>

          {/* Player Filter */}
          {currentUser && (
            <div style={{ display: 'flex', background: 'var(--bg-main)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <button onClick={() => setPlayerFilter('all')} style={{ padding: '5px 12px', borderRadius: '6px', background: playerFilter === 'all' ? 'var(--bg-surface-hover)' : 'transparent', color: playerFilter === 'all' ? 'white' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>Todos los Partidos</button>
              <button onClick={() => setPlayerFilter('my_matches')} style={{ padding: '5px 12px', borderRadius: '6px', background: playerFilter === 'my_matches' ? 'var(--bg-surface-hover)' : 'transparent', color: playerFilter === 'my_matches' ? 'var(--accent-cyan)' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <User size={13} /> Mis Partidos
              </button>
            </div>
          )}

          {/* Game Filter */}
          <select 
            value={gameFilter} 
            onChange={e => setGameFilter(e.target.value)}
            style={{ padding: '0.45rem 0.8rem', borderRadius: '6px', background: 'var(--bg-main)', color: 'white', border: '1px solid var(--border-subtle)', outline: 'none', fontSize: '0.85rem' }}
          >
            <option value="all">Todos los Juegos</option>
            {games.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {filteredRounds.map((round) => {
          let visibleMatches = round.matches.filter(m => {
            const isCompleted = m.status === 'completed' || m.score1 > 0 || m.score2 > 0 || (m.rankings && m.rankings.some(r => r.points > 0));
            if (statusFilter === 'pending' && isCompleted) return false;
            if (statusFilter === 'completed' && !isCompleted) return false;

            if (playerFilter === 'my_matches' && currentUser) {
              const inT1 = m.team1Players && m.team1Players.includes(currentUser.id);
              const inT2 = m.team2Players && m.team2Players.includes(currentUser.id);
              const inFfa = m.rankings && m.rankings.some(r => r.playerId === currentUser.id);
              if (!inT1 && !inT2 && !inFfa) return false;
            }
            return true;
          });

          const completedCount = round.matches.filter(m => m.status === 'completed' || (m.score1 > 0 || m.score2 > 0) || (m.rankings && m.rankings.some(r => r.points > 0))).length;
          
          let t1RoundPts = 0;
          let t2RoundPts = 0;
          
          return (
            <div key={round.id} className="card-minimal" style={{ background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <span className="badge-purple" style={{ padding: '0.35rem 1rem', borderRadius: '999px', background: 'var(--accent-purple)', color: 'white', fontWeight: 'bold', fontSize: '0.85rem' }}>RONDA {round.roundNumber}</span>
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🎮 {round.gameName}</span>
                  {getFormatBadge(round.format)}
                  <span className="badge-cyan" style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)' }}>{round.selectedMode}</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {isAdmin && round.format === '1v1' && (
                    <button 
                      onClick={() => setManualMatchRound(round)}
                      className="btn-subtle" 
                      style={{ padding: '4px 10px', fontSize: '0.8rem', color: 'var(--accent-cyan)', border: '1px dashed var(--accent-cyan)' }}
                    >
                      <Plus size={14} /> Partido Manual
                    </button>
                  )}

                  {isAdmin && round.format === 'ffa' && (
                    <button 
                      onClick={() => handleAddFfaMatch(round)}
                      className="btn-primary" 
                      style={{ padding: '5px 12px', fontSize: '0.8rem', background: 'rgba(244,114,182,0.2)', color: 'var(--accent-pink)', border: '1px solid var(--accent-pink)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}
                      title="Agregar otra partida/mapa a esta ronda FFA"
                    >
                      <Plus size={15} /> <span>+ Partida FFA</span>
                    </button>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    <Clock size={18} /> {completedCount} / {round.matches.length} Completados
                  </div>
                </div>
              </div>
              
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {visibleMatches.length === 0 && (
                  <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem', background: 'var(--bg-main)', borderRadius: '8px', border: '1px dashed var(--border-subtle)' }}>
                    {round.matches.length === 0 ? 'No hay partidas generadas para esta ronda.' : 'No hay partidas que coincidan con los filtros aplicados.'}
                  </div>
                )}
                
                {visibleMatches.map((match, matchIdx) => {
                  if (match.format === 'ffa') {
                    return (
                      <div key={match.id} style={{ background: 'var(--bg-main)', borderRadius: '10px', padding: '1.5rem', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                          <h4 style={{ margin: 0, color: 'var(--accent-pink)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            🎮 {match.name || `Partida ${matchIdx + 1}`}
                          </h4>
                          <span className={`badge-pill ${match.status === 'completed' ? 'badge-emerald' : 'badge-purple'}`} style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                            {match.status === 'completed' ? '✅ COMPLETADA' : '⏳ PENDIENTE'}
                          </span>
                        </div>
                        
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                          <thead>
                            <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                              <th style={{ padding: '0.75rem 0.5rem', fontWeight: '500' }}>Posición</th>
                              <th style={{ padding: '0.75rem 0.5rem', fontWeight: '500' }}>Jugador</th>
                              <th style={{ padding: '0.75rem 0.5rem', fontWeight: '500' }}>Equipo</th>
                              <th style={{ padding: '0.75rem 0.5rem', fontWeight: '500' }}>Puntos</th>
                            </tr>
                          </thead>
                          <tbody>
                            {match.rankings.map((r, i) => {
                              const p = players.find(x => x.id === r.playerId);
                              const t = teams.find(x => x.id === r.teamId);
                              const localEdit = ffaScores[match.id]?.find(x => x.playerId === r.playerId);
                              const displayPlacement = localEdit ? localEdit.placement : r.placement;
                              
                              return (
                                <tr key={r.playerId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                  <td style={{ padding: '0.75rem 0.5rem' }}>
                                    {isAdmin ? (
                                      <input 
                                        type="number" 
                                        min="1" 
                                        value={displayPlacement || ''} 
                                        onChange={e => handleFfaPlacementChange(match.id, r.playerId, e.target.value)}
                                        style={{ width: '60px', padding: '0.4rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'white', borderRadius: '4px', outline: 'none' }}
                                      />
                                    ) : (
                                      <span style={{ fontWeight: 'bold', color: r.placement === 1 ? 'var(--accent-amber)' : 'white', fontSize: '1.1rem', paddingLeft: '0.5rem' }}>{r.placement || '-'}</span>
                                    )}
                                  </td>
                                  <td style={{ padding: '0.75rem 0.5rem' }}>
                                    {p && <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><img src={p.avatar} alt="" style={{ width:'28px', height:'28px', borderRadius:'50%', objectFit: 'cover' }}/> <span style={{ fontWeight: '500' }}>{p.nickname}</span></div>}
                                  </td>
                                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>{t?.name || 'N/A'}</td>
                                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 'bold', color: 'var(--accent-cyan)', fontSize: '1.1rem' }}>{r.points || 0}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        {isAdmin && (
                          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => handleSaveFfa(match)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', background: 'var(--accent-cyan)', color: 'black', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                              <Save size={18} /> Guardar Clasificación
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  }

                  const t1 = teams.find(t => t.id === match.team1Id);
                  const t2 = teams.find(t => t.id === match.team2Id);
                  
                  if (match.score1 > match.score2) t1RoundPts += match.pointsAwarded || 15;
                  if (match.score2 > match.score1) t2RoundPts += match.pointsAwarded || 15;

                  const localS1 = matchScores[match.id]?.['1'] ?? match.score1;
                  const localS2 = matchScores[match.id]?.['2'] ?? match.score2;
                  
                  const isCompleted = match.status === 'completed' || match.score1 > 0 || match.score2 > 0;

                  return (
                    <div key={match.id} style={{ display: 'flex', alignItems: 'stretch', background: 'var(--bg-main)', borderRadius: '10px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                      <div style={{ flex: 1, padding: '1.25rem', borderRight: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                          {t1?.logo ? <span style={{ fontSize: '1.5rem' }}>{t1.logo}</span> : <Shield size={24} color="var(--text-secondary)" />}
                          <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>{t1?.name || 'Equipo 1'}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {match.team1Players?.map(id => renderPlayer(id))}
                        </div>
                      </div>

                      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.015)', minWidth: '180px' }}>
                        {isAdmin ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <input type="number" value={localS1} onChange={e => handleScoreChange(match.id, 1, e.target.value)} style={{ width: '60px', textAlign: 'center', padding: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'white', borderRadius: '6px', fontSize: '1.25rem', fontWeight: 'bold', outline: 'none' }} />
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>VS</span>
                            <input type="number" value={localS2} onChange={e => handleScoreChange(match.id, 2, e.target.value)} style={{ width: '60px', textAlign: 'center', padding: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'white', borderRadius: '6px', fontSize: '1.25rem', fontWeight: 'bold', outline: 'none' }} />
                          </div>
                        ) : (
                          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'white', letterSpacing: '4px', marginBottom: '1rem' }}>
                            {match.score1} - {match.score2}
                          </div>
                        )}
                        
                        {isAdmin && (localS1 !== match.score1 || localS2 !== match.score2) && (
                          <button onClick={() => handleSaveScore(match)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 1rem', background: 'var(--accent-cyan)', color: 'black', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            <Save size={16} /> Guardar
                          </button>
                        )}
                        
                        {!isAdmin && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: isCompleted ? 'var(--accent-emerald)' : 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>
                            {isCompleted ? <><CheckCircle2 size={16} /> Completado</> : <><Clock size={16} /> Pendiente</>}
                          </div>
                        )}
                      </div>

                      <div style={{ flex: 1, padding: '1.25rem', borderLeft: '1px solid var(--border-subtle)', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginBottom: '1.25rem' }}>
                          <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>{t2?.name || 'Equipo 2'}</span>
                          {t2?.logo ? <span style={{ fontSize: '1.5rem' }}>{t2.logo}</span> : <Shield size={24} color="var(--text-secondary)" />}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end' }}>
                          {match.team2Players?.map(id => renderPlayer(id))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {round.matches.length > 0 && !round.matches.some(m => m.format === 'ffa') && (() => {
                const firstMatch = round.matches[0];
                const rt1 = teams.find(t => t.id === firstMatch?.team1Id);
                const rt2 = teams.find(t => t.id === firstMatch?.team2Id);
                return (
                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    <span>{rt1?.logo} {rt1?.name || 'Equipo 1'}: <strong style={{ color: 'var(--accent-cyan)', marginLeft: '0.5rem', fontSize: '1.1rem' }}>{t1RoundPts}</strong></span>
                    <span>{rt2?.logo} {rt2?.name || 'Equipo 2'}: <strong style={{ color: 'var(--accent-pink)', marginLeft: '0.5rem', fontSize: '1.1rem' }}>{t2RoundPts}</strong></span>
                  </div>
                );
              })()}

            </div>
          );
        })}
      </div>

      {/* MODAL: MANUAL 1v1 MATCH CREATION */}
      {manualMatchRound && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ background: 'var(--bg-main)', borderRadius: '12px', padding: '2rem', maxWidth: '450px', width: '90%', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem' }}>Agregar Partido Manual 1v1</h3>
              <button onClick={() => setManualMatchRound(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddManualMatchSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Jugador 1 (Equipo 1)</label>
                <select required className="form-control" value={manualP1} onChange={e => setManualP1(e.target.value)}>
                  <option value="">-- Seleccionar Jugador --</option>
                  {players.filter(p => tournament.participatingPlayerIds.includes(p.id)).map(p => (
                    <option key={p.id} value={p.id}>{p.nickname} ({p.name})</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Jugador 2 (Equipo 2)</label>
                <select required className="form-control" value={manualP2} onChange={e => setManualP2(e.target.value)}>
                  <option value="">-- Seleccionar Jugador --</option>
                  {players.filter(p => tournament.participatingPlayerIds.includes(p.id) && p.id !== manualP1).map(p => (
                    <option key={p.id} value={p.id}>{p.nickname} ({p.name})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-outline" onClick={() => setManualMatchRound(null)}>Cancelar</button>
                <button type="submit" className="btn-primary">Crear Enfrentamiento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PODIUM / CHAMPION CELEBRATION */}
      {showPodiumModal && (
        <div className="modal-overlay">
          <div className="modal-content card-minimal" style={{ background: 'var(--bg-main)', borderRadius: '16px', padding: '2.5rem', maxWidth: '500px', width: '90%', border: '1px solid var(--accent-amber)', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(251, 191, 36, 0.25)' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(251, 191, 36, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Trophy size={40} color="var(--accent-amber)" />
            </div>

            <h2 style={{ color: 'white', fontSize: '2rem', margin: '0 0 0.5rem 0', fontWeight: '800' }}>¡TORNEO FINALIZADO!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Felicitaciones a los ganadores del torneo {tournament.name}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.8rem' }}>🥇</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 800, color: 'white', fontSize: '1.1rem' }}>Campeón del Torneo</div>
                    <div style={{ color: 'var(--accent-amber)', fontSize: '0.9rem' }}>¡Gran Desempeño!</div>
                  </div>
                </div>
                <Sparkles color="var(--accent-amber)" size={24} />
              </div>
            </div>

            <button 
              onClick={() => setShowPodiumModal(false)} 
              className="btn-primary" 
              style={{ width: '100%', padding: '0.85rem', background: 'var(--accent-amber)', color: 'black', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }}
            >
              ¡Cerrar Podio!
            </button>
          </div>
        </div>
      )}

      <CreateTournamentModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} games={games} teams={teams} players={players} onCreateTournament={onCreateTournament} />
    </div>
  );
}
