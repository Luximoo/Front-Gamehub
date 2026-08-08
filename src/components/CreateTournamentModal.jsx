import React, { useState, useEffect } from 'react';
import { X, Swords, ArrowRight, ArrowLeft, CheckCircle2, Gamepad2, Users, Shield, Shuffle, UserPlus } from 'lucide-react';

export default function CreateTournamentModal({ isOpen, onClose, games = [], teams = [], players = [], onCreateTournament }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('Gran Torneo Multijuego');
  const [description, setDescription] = useState('');
  const [basePoints, setBasePoints] = useState(15);
  
  const [selectedPlayerIds, setSelectedPlayerIds] = useState(new Set());
  const [selectedGames, setSelectedGames] = useState({});
  
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setName('Gran Torneo Multijuego');
      setDescription('');
      setBasePoints(15);
      setSelectedPlayerIds(new Set(players.map(p => p.id)));
      setSelectedGames({});
    }
  }, [isOpen, players]);

  if (!isOpen) return null;

  const togglePlayer = (id) => {
    const next = new Set(selectedPlayerIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedPlayerIds(next);
  };

  const selectAll = () => setSelectedPlayerIds(new Set(players.map(p => p.id)));
  const deselectAll = () => setSelectedPlayerIds(new Set());

  const selectedPlayers = players.filter(p => selectedPlayerIds.has(p.id));
  
  const activeTeams = teams.filter(t => selectedPlayers.some(p => p.teamId === t.id));

  const handleGameCheck = (gameId, checked, game) => {
    if (checked) {
      const mode = game.availableModes?.[0] || '';
      const format = game.modeFormats?.[mode] || '1v1';
      setSelectedGames(prev => ({
        ...prev,
        [gameId]: { checked: true, mode, format, oneVoneType: 'round_robin' }
      }));
    } else {
      const next = { ...selectedGames };
      delete next[gameId];
      setSelectedGames(next);
    }
  };

  const handleModeChange = (gameId, mode, game) => {
    const format = game.modeFormats?.[mode] || '1v1';
    setSelectedGames(prev => ({
      ...prev,
      [gameId]: { ...prev[gameId], mode, format }
    }));
  };

  const handleFinish = () => {
    const rounds = [];
    const activeGames = Object.entries(selectedGames).filter(([_, conf]) => conf.checked);
    
    activeGames.forEach(([gameId, conf], gameIdx) => {
      const game = games.find(g => g.id === gameId);
      if (!game) return;
      
      const format = conf.format;
      const matches = [];
      const t1 = activeTeams[0];
      const t2 = activeTeams[1];
      
      const t1Players = t1 ? selectedPlayers.filter(p => p.teamId === t1.id) : [];
      const t2Players = t2 ? selectedPlayers.filter(p => p.teamId === t2.id) : [];
      
      if (format === '1v1') {
        if (conf.oneVoneType === 'round_robin' && t1 && t2) {
          t1Players.forEach((p1, i) => {
            t2Players.forEach((p2, j) => {
              matches.push({
                id: `m_${Date.now()}_${gameIdx}_${matches.length}`,
                team1Id: t1.id,
                team2Id: t2.id,
                team1Players: [p1.id],
                team2Players: [p2.id],
                score1: 0, score2: 0, winnerId: '', pointsAwarded: basePoints, status: 'pending'
              });
            });
          });
        }
      } else if (format === '2v2' && t1 && t2) {
        matches.push({
          id: `m_${Date.now()}_${gameIdx}_0`,
          team1Id: t1.id,
          team2Id: t2.id,
          team1Players: t1Players.slice(0, 2).map(p => p.id),
          team2Players: t2Players.slice(0, 2).map(p => p.id),
          score1: 0, score2: 0, winnerId: '', pointsAwarded: basePoints, status: 'pending'
        });
      } else if (format === 'team' && t1 && t2) {
        matches.push({
          id: `m_${Date.now()}_${gameIdx}_0`,
          team1Id: t1.id,
          team2Id: t2.id,
          team1Players: t1Players.map(p => p.id),
          team2Players: t2Players.map(p => p.id),
          score1: 0, score2: 0, winnerId: '', pointsAwarded: basePoints, status: 'pending'
        });
      } else if (format === 'ffa') {
        matches.push({
          id: `m_${Date.now()}_${gameIdx}_1`,
          name: `Partida 1`,
          format: 'ffa',
          rankings: selectedPlayers.map(p => ({ playerId: p.id, teamId: p.teamId, placement: 0, points: 0 })),
          status: 'pending'
        });
      }
      
      rounds.push({
        id: `r_${Date.now()}_${gameIdx}`,
        roundNumber: gameIdx + 1,
        gameId: game.id,
        gameName: game.name,
        selectedMode: conf.mode,
        format: format,
        status: 'pending',
        matches
      });
    });

    onCreateTournament({
      name,
      description,
      participatingPlayerIds: Array.from(selectedPlayerIds),
      participatingTeamIds: activeTeams.map(t => t.id),
      rounds
    });
    onClose();
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

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div className="modal-content" style={{ background: 'var(--bg-main)', borderRadius: '12px', padding: '2rem', maxWidth: '600px', width: '90%', border: '1px solid var(--border-subtle)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)' }}>
            <Swords size={24} /> Crear Torneo
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          {[1, 2, 3, 4].map(s => (
            <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', background: s <= step ? 'var(--accent-cyan)' : 'var(--bg-surface)' }} />
          ))}
        </div>

        <div style={{ minHeight: '300px' }}>
          {step === 1 && (
            <div>
              <h3 style={{ marginBottom: '1.5rem', color: 'white', marginTop: 0 }}>Paso 1: Información General</h3>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nombre del Torneo</label>
                <input type="text" className="form-control" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'white', outline: 'none' }} value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Descripción</label>
                <textarea className="form-control" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'white', minHeight: '80px', outline: 'none', resize: 'vertical' }} value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Puntos Base por Victoria</label>
                <input type="number" className="form-control" style={{ width: '120px', padding: '0.75rem', borderRadius: '6px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'white', outline: 'none' }} value={basePoints} onChange={e => setBasePoints(parseInt(e.target.value) || 0)} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: 'white' }}>Paso 2: Jugadores Participantes</h3>
                <span className="badge-cyan" style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', background: 'rgba(34,211,238,0.1)', color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>{selectedPlayerIds.size} Seleccionados</span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <button onClick={selectAll} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'transparent', color: 'white', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <CheckCircle2 size={16} /> Seleccionar Todos
                </button>
                <button onClick={deselectAll} className="btn-subtle" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <X size={16} /> Deseleccionar Todos
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {players.map(p => (
                  <div key={p.id} className="card-minimal" onClick={() => togglePlayer(p.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: '8px', border: `1px solid ${selectedPlayerIds.has(p.id) ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`, cursor: 'pointer', transition: 'border-color 0.2s' }}>
                    <input type="checkbox" checked={selectedPlayerIds.has(p.id)} readOnly style={{ cursor: 'pointer', accentColor: 'var(--accent-cyan)' }} />
                    <img src={p.avatar} alt={p.nickname} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ color: 'white', fontWeight: '500', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontSize: '0.95rem' }}>{p.nickname}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {teams.find(t => t.id === p.teamId)?.name || 'Sin equipo'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 style={{ marginBottom: '1.5rem', color: 'white', marginTop: 0 }}>Paso 3: Confirmación de Equipos</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {teams.map(t => {
                  const tPlayers = selectedPlayers.filter(p => p.teamId === t.id);
                  return (
                    <div key={t.id} className="card-minimal" style={{ background: 'var(--bg-surface)', borderRadius: '8px', padding: '1.25rem', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        {t.logo ? (
                          <img src={t.logo} alt={t.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Shield size={20} color="var(--text-secondary)" />
                          </div>
                        )}
                        <div>
                          <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>{t.name}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t.tag}</div>
                        </div>
                      </div>
                      
                      {tPlayers.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {tPlayers.map(p => (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-main)', padding: '0.35rem 0.75rem', borderRadius: '999px', border: '1px solid var(--border-subtle)' }}>
                              <img src={p.avatar} alt={p.nickname} style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} />
                              <span style={{ color: 'white', fontSize: '0.85rem' }}>{p.nickname}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ color: 'var(--accent-pink)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <X size={16} /> Sin jugadores seleccionados
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 style={{ marginBottom: '1.5rem', color: 'white', marginTop: 0 }}>Paso 4: Juegos y Modos</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {games.map(game => {
                  const conf = selectedGames[game.id];
                  const isChecked = !!conf;
                  return (
                    <div key={game.id} className="card-minimal" style={{ background: 'var(--bg-surface)', borderRadius: '8px', padding: '1.25rem', border: `1px solid ${isChecked ? 'var(--accent-cyan)' : 'var(--border-subtle)'}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <input type="checkbox" checked={isChecked} onChange={e => handleGameCheck(game.id, e.target.checked, game)} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-cyan)' }} />
                        <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem', flex: 1 }}>{game.name}</div>
                        {isChecked && getFormatBadge(conf.format)}
                      </div>
                      
                      {isChecked && (
                        <div style={{ marginTop: '1rem', marginLeft: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', minWidth: '80px' }}>Modo:</label>
                            <select 
                              className="form-control" 
                              style={{ padding: '0.5rem', borderRadius: '6px', background: 'var(--bg-main)', color: 'white', border: '1px solid var(--border-subtle)', outline: 'none', flex: 1 }}
                              value={conf.mode}
                              onChange={e => handleModeChange(game.id, e.target.value, game)}
                            >
                              {game.availableModes?.map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                          
                          {conf.format === '1v1' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', minWidth: '80px' }}>Asignación:</label>
                              <select 
                                className="form-control"
                                style={{ padding: '0.5rem', borderRadius: '6px', background: 'var(--bg-main)', color: 'white', border: '1px solid var(--border-subtle)', outline: 'none', flex: 1 }}
                                value={conf.oneVoneType}
                                onChange={e => setSelectedGames(prev => ({ ...prev, [game.id]: { ...prev[game.id], oneVoneType: e.target.value } }))}
                              >
                                <option value="round_robin">Round Robin (todos contra todos)</option>
                                <option value="manual">Asignación Manual</option>
                              </select>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button 
            className="btn-outline" 
            onClick={() => setStep(s => Math.max(1, s - 1))} 
            disabled={step === 1}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'transparent', color: step === 1 ? 'var(--text-muted)' : 'white', cursor: step === 1 ? 'not-allowed' : 'pointer', fontWeight: '500' }}
          >
            <ArrowLeft size={18} /> Atrás
          </button>
          
          {step < 4 ? (
            <button 
              className="btn-primary" 
              onClick={() => setStep(s => Math.min(4, s + 1))}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '6px', background: 'var(--accent-cyan)', color: 'black', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
            >
              Siguiente <ArrowRight size={18} />
            </button>
          ) : (
            <button 
              className="btn-primary" 
              onClick={handleFinish}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '6px', background: 'var(--accent-purple)', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
            >
              ¡Generar y Crear Torneo! <CheckCircle2 size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
