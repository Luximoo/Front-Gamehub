import React, { useState } from 'react';
import { Shield, Plus, Users, Trash2 } from 'lucide-react';

export default function TeamsSection({ teams, players, isAdmin, onCreateTeam, onDeleteTeam }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    tag: '',
    color: '#38bdf8',
    logo: '🛡️',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateTeam(formData);
    setFormData({ name: '', tag: '', color: '#38bdf8', logo: '🛡️', description: '' });
    setIsModalOpen(false);
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: 0 }}>
            Equipos Fijos
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
            Equipos predeterminados para competir en el torneo multijuego.
          </p>
        </div>

        {isAdmin && (
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            Crear Equipo
          </button>
        )}
      </div>

      {/* Teams Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {teams.map((team) => {
          const teamMembers = players.filter(p => p.teamId === team.id);

          return (
            <div key={team.id} className="card-minimal" style={{ padding: '20px', position: 'relative' }}>
              
              {/* Delete button (Admin) */}
              {isAdmin && (
                <button 
                  onClick={() => onDeleteTeam(team.id)}
                  className="btn-danger"
                  style={{ position: 'absolute', top: '16px', right: '16px' }}
                  title="Eliminar equipo"
                >
                  <Trash2 size={14} />
                </button>
              )}

              {/* Title Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <span style={{ fontSize: '2.2rem', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', padding: '6px 12px', borderRadius: '12px' }}>
                  {team.logo || '🛡️'}
                </span>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: 0, fontWeight: 700 }}>{team.name}</h3>
                  <span className="badge-pill badge-cyan" style={{ marginTop: '2px' }}>[{team.tag}]</span>
                </div>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                {team.description || 'Sin descripción'}
              </p>

              {/* Members */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px', fontWeight: 600 }}>
                  INTEGRANTES ({teamMembers.length})
                </div>

                {teamMembers.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No hay jugadores asignados.</div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {teamMembers.map(m => (
                      <span key={m.id} style={{ background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <img src={m.avatar} alt={m.nickname} style={{ width: '16px', height: '16px', borderRadius: '50%' }} />
                        {m.nickname}
                      </span>
                    ))}
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal: Create Team */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '18px', color: '#fff', fontSize: '1.2rem' }}>Crear Nuevo Equipo Fijo</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre del Equipo</label>
                <input type="text" required className="form-control" placeholder="Cyber Alpha" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>TAG corto</label>
                  <input type="text" required className="form-control" placeholder="ALPHA" value={formData.tag} onChange={(e) => setFormData({ ...formData, tag: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Emoji / Icono</label>
                  <input type="text" className="form-control" placeholder="🛡️" value={formData.logo} onChange={(e) => setFormData({ ...formData, logo: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea className="form-control" rows="2" placeholder="Especialistas en FC 24 y Rocket League" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Equipo</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
