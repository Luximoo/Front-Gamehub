import React from 'react';
import { Trophy, Sparkles, Award, Flame, Star, Gamepad2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LeaderboardSection({ teamLeaderboard, playerStats, tournament, teams, players }) {
  const leaderboard = teamLeaderboard || [];
  const top1 = leaderboard.length > 0 ? leaderboard[0] : null;
  const mvp = playerStats && playerStats.length > 0 ? playerStats[0] : null;

  const triggerConfetti = () => {
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    setTimeout(() => confetti({ particleCount: 80, spread: 120, origin: { y: 0.4 } }), 300);
  };

  // Calculate per-game breakdown from tournament rounds
  const gameBreakdown = [];
  if (tournament && tournament.rounds) {
    tournament.rounds.forEach(round => {
      const completedMatches = round.matches.filter(m => m.status === 'completed');
      if (completedMatches.length === 0) return;

      let team1Pts = 0;
      let team2Pts = 0;
      const teamIds = tournament.participatingTeamIds || [];
      const t1Id = teamIds[0];
      const t2Id = teamIds[1];

      completedMatches.forEach(match => {
        if (match.format === 'ffa' && match.rankings) {
          match.rankings.forEach(r => {
            if (r.teamId === t1Id) team1Pts += (r.points || 0);
            if (r.teamId === t2Id) team2Pts += (r.points || 0);
          });
        } else if (match.winnerId) {
          const pts = match.pointsAwarded || 15;
          if (match.winnerId === t1Id) team1Pts += pts;
          else if (match.winnerId === t2Id) team2Pts += pts;
          else if (match.winnerId === 'draw') {
            team1Pts += Math.floor(pts / 2);
            team2Pts += Math.floor(pts / 2);
          }
        }
      });

      const t1Info = teams.find(t => t.id === t1Id) || {};
      const t2Info = teams.find(t => t.id === t2Id) || {};

      gameBreakdown.push({
        gameName: round.gameName,
        mode: round.selectedMode,
        format: round.format,
        team1Name: t1Info.name || 'Equipo 1',
        team1Logo: t1Info.logo || '🛡️',
        team1Pts,
        team2Name: t2Info.name || 'Equipo 2',
        team2Logo: t2Info.logo || '⚡',
        team2Pts,
        winnerId: team1Pts > team2Pts ? t1Id : (team2Pts > team1Pts ? t2Id : 'draw')
      });
    });
  }

  const formatBadge = (format) => {
    const configs = {
      '1v1': { label: '1v1', cls: 'badge-cyan' },
      '2v2': { label: '2v2', cls: 'badge-purple' },
      'team': { label: 'EQUIPO', cls: 'badge-amber' },
      'ffa': { label: 'FFA', cls: 'badge-emerald' }
    };
    const cfg = configs[format] || { label: format, cls: 'badge-cyan' };
    return <span className={`badge-pill ${cfg.cls}`} style={{ fontSize: '0.7rem' }}>{cfg.label}</span>;
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1000px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Trophy color="var(--accent-amber)" size={26} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: 0 }}>Tabla General de Posiciones</h2>
          </div>
          {tournament && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Torneo activo: <strong style={{ color: 'var(--accent-cyan)' }}>{tournament.name}</strong>
            </span>
          )}
        </div>

        {top1 && top1.totalPoints > 0 && (
          <button className="btn-primary" onClick={triggerConfetti} style={{ gap: '6px' }}>
            <Sparkles size={16} />
            Celebrar Campeón
          </button>
        )}
      </div>

      {/* Champion Highlight */}
      {top1 && top1.totalPoints > 0 && (
        <div className="card-minimal" style={{ padding: '24px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(167,139,250,0.05) 100%)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '3rem' }}>{top1.teamLogo}</span>
            <div style={{ flex: 1 }}>
              <span className="badge-pill badge-amber" style={{ marginBottom: '6px', display: 'inline-block' }}>👑 CAMPEÓN ACTUAL</span>
              <h3 style={{ fontSize: '1.4rem', color: '#fff', margin: '4px 0' }}>{top1.teamName}</h3>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '6px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)' }}>🏆 {top1.wins} victorias</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>📊 {top1.matchesPlayed} partidas</span>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-amber)' }}>{top1.totalPoints}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>PTS</div>
            </div>
          </div>
        </div>
      )}

      {/* Team Leaderboard Table */}
      <div className="card-minimal" style={{ overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} color="var(--accent-purple)" />
            Clasificación por Equipos
          </h3>
        </div>

        {leaderboard.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Trophy size={36} style={{ marginBottom: '10px', opacity: 0.4 }} />
            <p>No hay datos de clasificación aún. Crea un torneo y registra resultados.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={thStyle}>#</th>
                <th style={{ ...thStyle, textAlign: 'left' }}>Equipo</th>
                <th style={thStyle}>Partidas</th>
                <th style={thStyle}>V</th>
                <th style={thStyle}>E</th>
                <th style={thStyle}>D</th>
                <th style={thStyle}>PTS</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, i) => (
                <tr key={entry.teamId} style={{ borderBottom: '1px solid var(--border-subtle)', background: i === 0 ? 'rgba(251,191,36,0.05)' : 'transparent' }}>
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 700, color: i === 0 ? 'var(--accent-amber)' : (i === 1 ? 'var(--text-secondary)' : 'var(--text-muted)'), fontSize: '0.9rem' }}>
                      #{i + 1}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.3rem' }}>{entry.teamLogo}</span>
                      <div>
                        <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{entry.teamName}</span>
                        <span style={{ marginLeft: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>[{entry.teamTag}]</span>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>{entry.matchesPlayed}</td>
                  <td style={{ ...tdStyle, color: 'var(--accent-emerald)' }}>{entry.wins}</td>
                  <td style={{ ...tdStyle, color: 'var(--text-secondary)' }}>{entry.draws}</td>
                  <td style={{ ...tdStyle, color: 'var(--accent-pink)' }}>{entry.losses}</td>
                  <td style={{ ...tdStyle, fontWeight: 800, color: 'var(--accent-amber)', fontSize: '1rem' }}>{entry.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MVP Individual */}
      {mvp && mvp.totalPoints > 0 && (
        <div className="card-minimal" style={{ overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={18} color="var(--accent-amber)" />
              MVP Individual — Top Jugadores
            </h3>
          </div>

          <div style={{ padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
              {playerStats.filter(ps => ps.totalPoints > 0).slice(0, 6).map((ps, i) => {
                const playerInfo = players.find(p => p.id === ps.playerId);
                return (
                  <div key={ps.playerId} style={{ background: i === 0 ? 'rgba(251,191,36,0.08)' : 'var(--bg-main)', border: i === 0 ? '1px solid rgba(251,191,36,0.2)' : '1px solid var(--border-subtle)', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                      <img src={playerInfo?.avatar || ps.playerAvatar} alt={ps.playerNickname} style={{ width: '38px', height: '38px', borderRadius: '50%', border: i === 0 ? '2px solid var(--accent-amber)' : '2px solid var(--border-subtle)' }} />
                      {i === 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', fontSize: '0.9rem' }}>👑</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ps.playerNickname}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ps.teamName}</div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '3px' }}>
                        {ps.wins1v1 > 0 && <span style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)' }}>⚔️ {ps.wins1v1}W</span>}
                        {ps.ffaPoints > 0 && <span style={{ fontSize: '0.7rem', color: 'var(--accent-pink)' }}>🎯 {ps.ffaPoints}pts FFA</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: i === 0 ? 'var(--accent-amber)' : 'var(--accent-cyan)' }}>{ps.totalPoints}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>PTS</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Game-by-Game Breakdown */}
      {gameBreakdown.length > 0 && (
        <div className="card-minimal" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Gamepad2 size={18} color="var(--accent-cyan)" />
              Desglose por Juego
            </h3>
          </div>

          <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {gameBreakdown.map((gb, i) => (
              <div key={i} style={{ background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{gb.team1Logo}</span>
                  <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>{gb.team1Name}</span>
                  <span style={{ fontWeight: 800, color: gb.team1Pts > gb.team2Pts ? 'var(--accent-emerald)' : 'var(--text-muted)', fontSize: '1rem' }}>{gb.team1Pts}</span>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>🎮 {gb.gameName}</div>
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                    {formatBadge(gb.format)}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                  <span style={{ fontWeight: 800, color: gb.team2Pts > gb.team1Pts ? 'var(--accent-emerald)' : 'var(--text-muted)', fontSize: '1rem' }}>{gb.team2Pts}</span>
                  <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>{gb.team2Name}</span>
                  <span style={{ fontSize: '1.2rem' }}>{gb.team2Logo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

const thStyle = {
  padding: '10px 14px',
  fontSize: '0.78rem',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  fontWeight: 600,
  textAlign: 'center'
};

const tdStyle = {
  padding: '12px 14px',
  fontSize: '0.88rem',
  color: 'var(--text-secondary)',
  textAlign: 'center'
};
