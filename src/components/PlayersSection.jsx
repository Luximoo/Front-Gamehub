import React, { useState } from 'react';
import { Users, Plus, Copy, Check, Edit2, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function PlayersSection({ players, teams, currentUser, isAdmin, onCreatePlayer, onUpdatePlayer, onDeletePlayer, onShowToast }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    discord: '',
    steam: '',
    riot: '',
    psn: '',
    xbox: '',
    teamId: '',
    avatar: '',
    pin: ''
  });

  const handleOpenCreateModal = () => {
    setEditingPlayerId(null);
    setFormData({ name: '', nickname: '', discord: '', steam: '', riot: '', psn: '', xbox: '', teamId: '', avatar: '', pin: '1234' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (player) => {
    setEditingPlayerId(player.id);
    setFormData({
      name: player.name || '',
      nickname: player.nickname || '',
      discord: player.discord || '',
      steam: player.steam || '',
      riot: player.riot || '',
      psn: player.psn || '',
      xbox: player.xbox || '',
      teamId: player.teamId || '',
      avatar: player.avatar || '',
      pin: player.pin || (player.role === 'admin' || player.id === 'p1' ? '6253' : '1234')
    });
    setIsModalOpen(true);
  };

  const handleToggleAdminRole = (player) => {
    const newRole = player.role === 'admin' ? 'player' : 'admin';
    onUpdatePlayer(player.id, { role: newRole });
    onShowToast(`Rol de ${player.nickname} actualizado a: ${newRole === 'admin' ? 'Administrador' : 'Jugador'}`);
  };

  const handleCopyDiscord = (discordTag, playerId) => {
    if (!discordTag) return;
    navigator.clipboard.writeText(discordTag);
    setCopiedId(playerId);
    onShowToast(`Discord tag "${discordTag}" copiado`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalAvatar = formData.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`;

    if (editingPlayerId) {
      onUpdatePlayer(editingPlayerId, { ...formData, avatar: finalAvatar });
    } else {
      onCreatePlayer({ ...formData, avatar: finalAvatar });
    }
    setIsModalOpen(false);
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: 0 }}>
            Directorio de Jugadores
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
            Lista de amigos con sus Gamertags y Discord oficial.
          </p>
        </div>

        {isAdmin && (
          <button className="btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={16} />
            Nuevo Jugador
          </button>
        )}
      </div>

      {/* Players Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {players.map((player) => {
          const playerTeam = teams.find(t => t.id === player.teamId);
          const isOwnProfile = currentUser && currentUser.id === player.id;
          const canEditThisPlayer = isOwnProfile || isAdmin;

          return (
            <div key={player.id} className="card-minimal" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
              
              {/* Profile Card Action Buttons */}
              <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                {/* Admin Grant/Revoke Button (Only visible for Admins on other players) */}
                {isAdmin && !isOwnProfile && (
                  <button
                    onClick={() => handleToggleAdminRole(player)}
                    className="btn-subtle"
                    style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                    title={player.role === 'admin' ? "Revocar permisos de admin" : "Hacer administrador a este jugador"}
                  >
                    {player.role === 'admin' ? <ShieldAlert size={14} color="var(--accent-pink)" /> : <ShieldCheck size={14} color="var(--accent-amber)" />}
                  </button>
                )}

                {/* Edit profile button: Allowed ONLY if it is own profile OR user is Admin */}
                {canEditThisPlayer && (
                  <button 
                    onClick={() => handleOpenEditModal(player)}
                    className="btn-subtle"
                    style={{ padding: '4px 8px' }}
                    title={isOwnProfile ? "Editar mi perfil" : "Editar jugador (Admin)"}
                  >
                    <Edit2 size={14} />
                  </button>
                )}

                {/* Delete player button (Admin only) */}
                {isAdmin && (
                  <button 
                    onClick={() => onDeletePlayer(player.id)}
                    className="btn-danger"
                    title="Eliminar jugador"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div>
                {/* Header Profile */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <img 
                    src={player.avatar} 
                    alt={player.nickname} 
                    style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: 0, fontWeight: 600 }}>{player.nickname}</h3>
                      {player.role === 'admin' && (
                        <span className="badge-pill badge-amber" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                          ADMIN
                        </span>
                      )}
                      {isOwnProfile && (
                        <span className="badge-pill badge-purple" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                          TÚ
                        </span>
                      )}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{player.name}</div>
                    
                    {playerTeam ? (
                      <span className="badge-pill badge-cyan" style={{ marginTop: '4px' }}>
                        <span>{playerTeam.logo}</span> {playerTeam.name}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sin Equipo</span>
                    )}
                  </div>
                </div>

                {/* Gamertags & Discord */}
                <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '12px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  
                  {/* Discord Pill with 1-click Copy */}
                  {player.discord && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                      <span style={{ color: '#818cf8', fontWeight: 600, fontSize: '0.8rem' }}>💬 Discord</span>
                      <button
                        onClick={() => handleCopyDiscord(player.discord, player.id)}
                        className="btn-subtle"
                        style={{ padding: '3px 8px', fontSize: '0.78rem' }}
                      >
                        <code>{player.discord}</code>
                        {copiedId === player.id ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                      </button>
                    </div>
                  )}

                  {player.steam && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Steam</span>
                      <span style={{ color: 'var(--text-primary)' }}>{player.steam}</span>
                    </div>
                  )}

                  {player.riot && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Riot ID</span>
                      <span style={{ color: 'var(--text-primary)' }}>{player.riot}</span>
                    </div>
                  )}

                  {player.psn && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>PSN</span>
                      <span style={{ color: 'var(--text-primary)' }}>{player.psn}</span>
                    </div>
                  )}

                  {player.xbox && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Xbox</span>
                      <span style={{ color: 'var(--text-primary)' }}>{player.xbox}</span>
                    </div>
                  )}

                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal: Create or Edit Player */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '18px', color: '#fff', fontSize: '1.2rem' }}>
              {editingPlayerId ? 'Editar Perfil de Jugador' : 'Registrar Nuevo Jugador'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Nombre Real</label>
                  <input type="text" required className="form-control" placeholder="David" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Apodo / Gamertag</label>
                  <input type="text" required className="form-control" placeholder="Davovich" value={formData.nickname} onChange={(e) => setFormData({ ...formData, nickname: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label>Equipo Fijo</label>
                <select className="form-control" value={formData.teamId} onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}>
                  <option value="">-- Sin equipo asignado --</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.logo} {t.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Discord Tag</label>
                  <input type="text" className="form-control" placeholder="Usuario#0000" value={formData.discord} onChange={(e) => setFormData({ ...formData, discord: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Steam ID</label>
                  <input type="text" className="form-control" placeholder="davovich_99" value={formData.steam} onChange={(e) => setFormData({ ...formData, steam: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Riot ID</label>
                  <input type="text" className="form-control" placeholder="Davo#LAN" value={formData.riot} onChange={(e) => setFormData({ ...formData, riot: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>PSN / Xbox</label>
                  <input type="text" className="form-control" placeholder="DavoPSN" value={formData.psn} onChange={(e) => setFormData({ ...formData, psn: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label>PIN de Seguridad (4 dígitos)</label>
                <input type="password" maxLength={4} className="form-control" placeholder="ej. 1234" value={formData.pin} onChange={(e) => setFormData({ ...formData, pin: e.target.value })} />
              </div>

              <div className="form-group">
                <label>URL Avatar (Opcional)</label>
                <input type="text" className="form-control" placeholder="https://..." value={formData.avatar} onChange={(e) => setFormData({ ...formData, avatar: e.target.value })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
