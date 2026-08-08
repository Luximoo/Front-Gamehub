import React, { useState } from 'react';
import { Gamepad2, Users, CheckCircle2, Rocket, Shield, ArrowRight } from 'lucide-react';

export default function PlayerOnboarding({ games, teams, onCompleteRegistration }) {
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    discord: '',
    steam: '',
    riot: '',
    psn: '',
    xbox: '',
    teamId: '',
    pin: '1234',
    selectedGames: []
  });

  const handleGameToggle = (gameId) => {
    setFormData(prev => {
      const exists = prev.selectedGames.includes(gameId);
      if (exists) {
        return { ...prev, selectedGames: prev.selectedGames.filter(id => id !== gameId) };
      } else {
        return { ...prev, selectedGames: [...prev.selectedGames, gameId] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nickname.trim()) return;
    onCompleteRegistration(formData);
  };

  return (
    <div style={{ maxWidth: '650px', margin: '40px auto', padding: '0 20px' }}>
      
      {/* Welcome Card Header */}
      <div className="card-minimal" style={{ padding: '28px', marginBottom: '24px', textAlign: 'center', background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.08) 0%, rgba(19, 23, 34, 0.95) 100%)' }}>
        <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-accent)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: 'var(--accent-cyan)' }}>
          <Rocket size={28} />
        </div>
        <h2 style={{ fontSize: '1.6rem', color: '#fff', margin: 0, fontWeight: 700 }}>
          ¡Bienvenido al Torneo de Amigos!
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '6px' }}>
          Completa tu registro para unirte a los equipos y seleccionar tus juegos de competencia.
        </p>
      </div>

      {/* Onboarding Form */}
      <div className="card-minimal" style={{ padding: '28px' }}>
        <form onSubmit={handleSubmit}>
          
          {/* Step 1: Basic Info */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--accent-cyan)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>1. Tu Identidad Gamer</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div className="form-group">
                <label>Tu Apodo / Gamertag *</label>
                <input 
                  type="text" 
                  required 
                  className="form-control" 
                  placeholder="ej. Davovich" 
                  value={formData.nickname} 
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })} 
                />
              </div>

              <div className="form-group">
                <label>Nombre Real</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="ej. David" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                />
              </div>
            </div>

            <div className="form-group">
              <label>PIN de Seguridad de 4 dígitos (NIP) *</label>
              <input 
                type="password" 
                maxLength={4} 
                required 
                className="form-control" 
                placeholder="1234" 
                value={formData.pin} 
                onChange={(e) => setFormData({ ...formData, pin: e.target.value })} 
              />
            </div>
          </div>

          {/* Step 2: Discord & Gamertags */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', color: '#818cf8', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>2. Contacto & Gamertags</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Discord Tag (para agruparte)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Usuario#0000" 
                  value={formData.discord} 
                  onChange={(e) => setFormData({ ...formData, discord: e.target.value })} 
                />
              </div>

              <div className="form-group">
                <label>Steam ID / Riot ID</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="ej. Davo#LAN" 
                  value={formData.riot || formData.steam} 
                  onChange={(e) => setFormData({ ...formData, riot: e.target.value, steam: e.target.value })} 
                />
              </div>
            </div>
          </div>

          {/* Step 3: Game Selection */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--accent-emerald)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>3. ¿Qué juegos vas a competir?</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
              {games.map((game) => {
                const isSelected = formData.selectedGames.includes(game.id);

                return (
                  <div
                    key={game.id}
                    onClick={() => handleGameToggle(game.id)}
                    style={{
                      background: isSelected ? 'rgba(52, 211, 153, 0.1)' : 'var(--bg-main)',
                      border: isSelected ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      padding: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      style={{ cursor: 'pointer', accentColor: 'var(--accent-emerald)' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem' }}>{game.name}</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{game.format}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 4: Fixed Team Selection */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--accent-amber)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>4. Elige tu Equipo Fijo</span>
            </h3>

            <select 
              className="form-control"
              value={formData.teamId}
              onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
            >
              <option value="">-- Unirse como independiente --</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.logo} {t.name} [{t.tag}]
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '1rem' }}
          >
            <span>¡Entrar al Torneo!</span>
            <ArrowRight size={18} />
          </button>

        </form>
      </div>

    </div>
  );
}
