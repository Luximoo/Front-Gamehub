import React, { useState } from 'react';
import { LogIn, UserPlus, Shield, X, Lock, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login({ players, teams, onLogin, loadError }) {
  const navigate = useNavigate();
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const handleProfileClick = (p) => {
    setSelectedPlayer(p);
    setPinInput('');
    setPinError(false);
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (!selectedPlayer) return;

    // Expected PIN: p.pin if set, otherwise '6253' for admin and '1234' for normal players
    const isAdmin = selectedPlayer.role === 'admin' || selectedPlayer.id === 'p1';
    const expectedPin = selectedPlayer.pin || (isAdmin ? '6253' : '1234');

    if (pinInput === expectedPin) {
      onLogin(selectedPlayer.id);
      setSelectedPlayer(null);
    } else {
      setPinError(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '2rem' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <LogIn color="var(--accent-cyan)" size={36} />
          GamerHub
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Selecciona tu perfil para entrar
        </p>
      </div>

      <div className="card-minimal" style={{ maxWidth: '800px', width: '100%', padding: '2rem' }}>
        
        {players.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <p>No hay jugadores registrados.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {players.map(p => {
              const team = teams.find(t => t.id === p.teamId);
              const isAdmin = p.role === 'admin' || p.id === 'p1';

              return (
                <div 
                  key={p.id}
                  onClick={() => handleProfileClick(p)}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <img src={p.avatar} alt={p.nickname} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-subtle)' }} />
                  
                  {isAdmin ? (
                    <span style={{ position: 'absolute', top: '10px', right: '10px' }} title="Administrador">
                      <Shield size={16} color="var(--accent-amber)" />
                    </span>
                  ) : (
                    <span style={{ position: 'absolute', top: '10px', right: '10px' }} title="Protegido con PIN">
                      <KeyRound size={14} color="var(--text-muted)" />
                    </span>
                  )}
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, color: 'white', fontSize: '1.1rem' }}>{p.nickname}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.name}</div>
                  </div>
                  
                  {team && (
                    <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', width: '100%', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {team.logo} {team.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>

      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>¿Eres nuevo por aquí?</p>
        <button 
          onClick={() => navigate('/register')}
          className="btn-outline" 
          style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <UserPlus size={18} />
          Registrarse como nuevo jugador
        </button>
      </div>

      {selectedPlayer && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="modal-content card-minimal" style={{ background: 'var(--bg-main)', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '360px', border: '1px solid var(--border-subtle)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={selectedPlayer.avatar} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--accent-cyan)' }} />
                <div>
                  <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem' }}>{selectedPlayer.nickname}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {selectedPlayer.role === 'admin' || selectedPlayer.id === 'p1' ? <><Shield size={12} color="var(--accent-amber)" /> Admin</> : 'Jugador'}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedPlayer(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handlePinSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
                  Ingresa tu PIN de seguridad (NIP)
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="password" 
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      setPinError(false);
                    }}
                    placeholder="****"
                    autoFocus
                    maxLength={4}
                    style={{ 
                      width: '100%', 
                      padding: '1rem 1rem 1rem 2.5rem', 
                      background: 'var(--bg-surface)', 
                      border: `1px solid ${pinError ? 'var(--accent-pink)' : 'var(--border-subtle)'}`, 
                      color: 'white', 
                      borderRadius: '8px', 
                      fontSize: '1.5rem', 
                      textAlign: 'center',
                      letterSpacing: '8px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }} 
                  />
                </div>
                {pinError && <div style={{ color: 'var(--accent-pink)', fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center' }}>PIN incorrecto</div>}
              </div>
              
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '8px', background: 'var(--accent-cyan)', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                <LogIn size={18} /> Entrar
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
