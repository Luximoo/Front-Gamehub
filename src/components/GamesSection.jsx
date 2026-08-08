import React, { useState } from 'react';
import { Gamepad2, Plus, Trash2 } from 'lucide-react';

export default function GamesSection({ games, isAdmin, onCreateGame, onDeleteGame }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    format: '1v1',
    platforms: 'PC, PS5, Xbox',
    banner: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateGame({
      name: formData.name,
      category: formData.category,
      format: formData.format,
      platforms: formData.platforms.split(',').map(p => p.trim()),
      banner: formData.banner || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80'
    });
    setFormData({ name: '', category: '', format: '1v1', platforms: 'PC, PS5, Xbox', banner: '' });
    setIsModalOpen(false);
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: 0 }}>
            Biblioteca de Juegos
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
            Videojuegos disponibles para las rondas del torneo multijuego.
          </p>
        </div>

        {isAdmin && (
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            Agregar Juego
          </button>
        )}
      </div>

      {/* Games Catalog Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {games.map((game) => (
          <div key={game.id} className="card-minimal" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            
            {/* Banner */}
            <div style={{ position: 'relative', height: '140px', overflow: 'hidden' }}>
              <img src={game.banner} alt={game.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, var(--bg-surface) 100%)' }}></div>
              
              {isAdmin && (
                <button 
                  onClick={() => onDeleteGame(game.id)}
                  className="btn-danger"
                  style={{ position: 'absolute', top: '10px', right: '10px' }}
                  title="Eliminar juego"
                >
                  <Trash2 size={14} />
                </button>
              )}

              <div style={{ position: 'absolute', bottom: '10px', left: '14px', right: '14px' }}>
                <span className="badge-pill badge-purple" style={{ fontSize: '0.7rem' }}>{game.category}</span>
                <h3 style={{ fontSize: '1.1rem', color: '#fff', margin: '2px 0 0 0', fontWeight: 700 }}>{game.name}</h3>
              </div>
            </div>

            {/* Info */}
            <div style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Formato:</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>{game.format}</div>
              </div>

              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {(game.platforms || []).map((p, i) => (
                  <span key={i} style={{ background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem' }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Modal: Create Game */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '18px', color: '#fff', fontSize: '1.2rem' }}>Agregar Juego al Catálogo</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre del Juego</label>
                <input type="text" required className="form-control" placeholder="EA SPORTS FC 24" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Categoría</label>
                  <input type="text" className="form-control" placeholder="Deportes" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Formato</label>
                  <input type="text" className="form-control" placeholder="1v1 / 2v2" value={formData.format} onChange={(e) => setFormData({ ...formData, format: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label>Plataformas</label>
                <input type="text" className="form-control" placeholder="PC, PS5, Xbox, Switch" value={formData.platforms} onChange={(e) => setFormData({ ...formData, platforms: e.target.value })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Juego</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
