import React, { useState } from 'react';
import { X, Server, Globe, Terminal, CheckCircle2, Copy } from 'lucide-react';

export default function DeployGuideModal({ isOpen, onClose, onShowToast }) {
  if (!isOpen) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    onShowToast('Comandos copiados al portapapeles');
  };

  const gitBackendCmds = `cd backend
git init
git add .
git commit -m "Deploy Backend API"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/tu-backend.git
git push -u origin main`;

  const gitFrontendCmds = `cd frontend
git init
git add .
git commit -m "Deploy Frontend Netlify"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/tu-frontend.git
git push -u origin main`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(0, 240, 255, 0.2)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe className="text-cyan" size={26} />
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.4rem' }}>Guía de Despliegue Gratuito (Git Separado)</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Step 1: Backend Render */}
        <div style={{ background: 'rgba(18, 22, 40, 0.8)', border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: '12px', padding: '18px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: '10px', marginBottom: '12px' }}>
            <Server className="text-pink" size={22} />
            <h4 style={{ color: 'var(--neon-pink)', margin: 0, fontSize: '1.1rem' }}>Paso 1: Subir Backend a Render (Gratis)</h4>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Abre la terminal en la carpeta <code>backend/</code> e inicializa tu repositorio Git independiente:
          </p>

          <div style={{ position: 'relative', background: '#050711', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--neon-cyan)', marginBottom: '12px' }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{gitBackendCmds}</pre>
            <button onClick={() => copyToClipboard(gitBackendCmds)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>
              <Copy size={14} />
            </button>
          </div>

          <ol style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Ve a <strong><a href="https://render.com" target="_blank" rel="noreferrer" style={{ color: 'var(--neon-cyan)' }}>Render.com</a></strong> y crea una cuenta gratuita.</li>
            <li>Haz clic en <strong>New +</strong> ➔ <strong>Web Service</strong> y conecta el repositorio <code>tu-backend</code>.</li>
            <li><strong>Start Command:</strong> <code>node server.js</code></li>
            <li>Render te dará un dominio HTTPS público tipo <code>https://tu-api.onrender.com</code>.</li>
          </ol>
        </div>

        {/* Step 2: Frontend Netlify */}
        <div style={{ background: 'rgba(18, 22, 40, 0.8)', border: '1px solid rgba(0, 255, 136, 0.2)', borderRadius: '12px', padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Globe className="text-green" size={22} />
            <h4 style={{ color: 'var(--neon-green)', margin: 0, fontSize: '1.1rem' }}>Paso 2: Subir Frontend a Netlify (Gratis)</h4>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Abre la terminal en la carpeta <code>frontend/</code> e inicializa tu repositorio Git independiente:
          </p>

          <div style={{ position: 'relative', background: '#050711', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--neon-green)', marginBottom: '12px' }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{gitFrontendCmds}</pre>
            <button onClick={() => copyToClipboard(gitFrontendCmds)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>
              <Copy size={14} />
            </button>
          </div>

          <ol style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Ve a <strong><a href="https://netlify.com" target="_blank" rel="noreferrer" style={{ color: 'var(--neon-green)' }}>Netlify.com</a></strong> e inicia sesión gratis.</li>
            <li>Haz clic en <strong>Add new site</strong> ➔ <strong>Import an existing project</strong> desde GitHub.</li>
            <li>Selecciona el repositorio <code>tu-frontend</code>.</li>
            <li><strong>Build command:</strong> <code>npm run build</code> | <strong>Publish directory:</strong> <code>dist</code></li>
            <li>En **Environment Variables** (Opcional), agrega <code>VITE_API_URL</code> con el dominio de Render.</li>
            <li>¡Listo! Tendrás tu app pública en <code>https://tu-torneo.netlify.app</code>.</li>
          </ol>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button className="btn-neon" onClick={onClose}>¡Entendido, a Desplegar!</button>
        </div>

      </div>
    </div>
  );
}
