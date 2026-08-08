import React, { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Swords, Users, Shield, Gamepad2, Rocket, UserPlus, ShieldCheck, LogOut, Download, Upload, LogIn } from 'lucide-react';

export default function Navbar({ currentUser, isAdmin, onLogout, onExportBackup, onRestoreBackup }) {
  const location = useLocation();
  const fileInputRef = useRef(null);

  const tabs = [
    { id: 'leaderboard', path: '/leaderboard', label: 'Tabla General', icon: Trophy },
    { id: 'tournament', path: '/tournament', label: 'Torneo', icon: Swords },
    { id: 'teams', path: '/teams', label: 'Equipos', icon: Shield },
    { id: 'players', path: '/players', label: 'Jugadores', icon: Users },
    { id: 'games', path: '/games', label: 'Juegos', icon: Gamepad2 }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          onRestoreBackup(json);
        } catch (err) {
          alert('El archivo seleccionado no es un JSON válido.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <header style={{
      background: 'rgba(19, 23, 34, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '10px 24px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Brand Link */}
        <Link to="/leaderboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'var(--bg-muted)',
            border: '1px solid var(--border-subtle)',
            padding: '7px',
            borderRadius: '10px',
            color: 'var(--accent-cyan)',
            display: 'flex'
          }}>
            <Rocket size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#fff', letterSpacing: '-0.02em' }}>
              Gamer<span style={{ color: 'var(--accent-cyan)' }}>Hub</span>
            </h1>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Organizador de Torneos
            </span>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-main)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path || (location.pathname === '/' && tab.path === '/leaderboard');
            return (
              <Link
                key={tab.id}
                to={tab.path}
                style={{
                  textDecoration: 'none',
                  background: isActive ? 'var(--bg-surface-hover)' : 'transparent',
                  border: isActive ? '1px solid var(--border-subtle)' : '1px solid transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 600 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={15} color={isActive ? 'var(--accent-cyan)' : 'currentColor'} />
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions / User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          {/* Admin Data Backup & Restore Buttons */}
          {isAdmin && (
            <div style={{ display: 'flex', gap: '6px', marginRight: '6px' }}>
              <button 
                onClick={onExportBackup} 
                className="btn-subtle" 
                style={{ padding: '5px 9px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                title="Descargar respaldo JSON"
              >
                <Download size={13} color="var(--accent-cyan)" />
                <span>Exportar DB</span>
              </button>
              
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="btn-subtle" 
                style={{ padding: '5px 9px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                title="Subir y restaurar respaldo JSON"
              >
                <Upload size={13} color="var(--accent-amber)" />
                <span>Restaurar</span>
              </button>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".json" 
                style={{ display: 'none' }} 
              />
            </div>
          )}

          {/* User Profile Badge or Login */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface)', padding: '4px 10px 4px 6px', borderRadius: '20px', border: '1px solid var(--border-subtle)' }}>
              <img src={currentUser.avatar} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {currentUser.nickname}
                  {isAdmin && <ShieldCheck size={12} color="var(--accent-amber)" />}
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {isAdmin ? 'Admin' : 'Jugador'}
                </span>
              </div>

              <button 
                onClick={onLogout} 
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginLeft: '6px', padding: '4px', display: 'flex', alignItems: 'center' }}
                title="Cerrar sesión"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <LogIn size={14} /> Entrar
              </Link>
              <Link to="/register" className="btn-subtle" style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <UserPlus size={14} /> Registro
              </Link>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
