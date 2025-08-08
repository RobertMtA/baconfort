import React from 'react';
import { useAdmin } from '../../context/AdminContext-STATEFUL';
import './AdminSessionInfo.css';

const AdminSessionInfo = () => {
  const { adminUser, sessionId, logout } = useAdmin();

  if (!adminUser) return null;

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  return (
    <div className="admin-session-info">
      <div className="session-details">
        <div className="admin-avatar">
          <i className="fas fa-user-shield"></i>
        </div>
        <div className="admin-info">
          <span className="admin-name">{adminUser.name}</span>
          <span className="admin-email">{adminUser.email}</span>
          <span className="session-time">
            Conectado: {formatTime(adminUser.loginTime)}
          </span>
        </div>
      </div>
      <button 
        className="logout-btn"
        onClick={logout}
        title="Cerrar sesión"
      >
        <i className="fas fa-sign-out-alt"></i>
      </button>
    </div>
  );
};

export default AdminSessionInfo;
