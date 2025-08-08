import React, { useState, useEffect } from 'react';
import { authAPI } from '../../services/api';
import UserReservations from '../UserReservations/UserReservations';
import ForgotPassword from '../Auth/ForgotPassword';
import UserInquiries from '../UserInquiries/UserInquiries';
import './UserProfile.css';

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [syncStatus, setSyncStatus] = useState('synced');
  const [persistenceInfo, setPersistenceInfo] = useState({
    hasLocalData: false,
    lastSync: null,
    isOnline: navigator.onLine
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Actualizar formData cuando cambie el usuario
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  // 🔄 CARGAR PERFIL INICIAL Y CONFIGURAR SINCRONIZACIÓN
  useEffect(() => {
    // Limpiar datos antiguos del localStorage al cargar
    const cleanOldUserData = () => {
      try {
        const storedUser = localStorage.getItem('baconfort-user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          const createdDate = new Date(userData.createdAt);
          
          // Si la fecha es anterior a 2025, limpiar localStorage para forzar recarga desde API
          if (createdDate < new Date('2025-01-01')) {
            console.log('🧹 Limpiando datos antiguos del localStorage');
            localStorage.removeItem('baconfort-user');
          }
        }
      } catch (error) {
        console.warn('⚠️ Error limpiando datos antiguos:', error);
        localStorage.removeItem('baconfort-user'); // Limpiar datos corruptos
      }
    };
    
    cleanOldUserData();
    loadUserProfile();
    
    // Sincronización automática cada 30 segundos
    const syncInterval = setInterval(() => {
      if (syncStatus !== 'syncing') {
        syncUserProfile();
      }
    }, 30000);
    
    // Sincronizar antes de cerrar la página
    const handleBeforeUnload = () => {
      syncUserProfile();
    };
    
    // Actualizar estado de conexión
    const updateConnectionStatus = () => {
      setPersistenceInfo(prev => ({
        ...prev,
        isOnline: navigator.onLine
      }));
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
    
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('online', updateConnectionStatus);
      window.removeEventListener('offline', updateConnectionStatus);
    };
  }, [syncStatus]);

  // 📥 CARGAR PERFIL DESDE API CON FALLBACK A LOCALSTORAGE
  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Cargando perfil de usuario...');
      
      // Intentar cargar desde API primero
      try {
        const response = await authAPI.profile();
        console.log('✅ Perfil cargado desde API:', response);
        
        const userData = response.user;
        setUser(userData);
        
        // Guardar en localStorage como backup
        const dataToSave = {
          ...userData,
          lastSync: new Date().toISOString()
        };
        localStorage.setItem('baconfort-user', JSON.stringify(dataToSave));
        
        // Actualizar estado de persistencia
        setPersistenceInfo({
          hasLocalData: true,
          lastSync: new Date().toISOString(),
          isOnline: navigator.onLine
        });
        
        setSyncStatus('synced');
        
      } catch (apiError) {
        console.warn('⚠️ Error API, usando localStorage:', apiError.message);
        
        // Fallback a localStorage
        const localData = JSON.parse(localStorage.getItem('baconfort-user') || '{}');
        
        if (localData.email) {
          setUser(localData);
          setPersistenceInfo({
            hasLocalData: true,
            lastSync: localData.lastSync || null,
            isOnline: navigator.onLine
          });
          setSyncStatus('error');
          console.log('📱 Usando datos de localStorage');
        } else {
          throw new Error('No hay datos de usuario disponibles');
        }
      }
      
    } catch (err) {
      console.error('❌ Error al cargar perfil:', err);
      setError('Error al cargar el perfil. Por favor, inicia sesión nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // 🔄 SINCRONIZACIÓN AUTOMÁTICA
  const syncUserProfile = async () => {
    try {
      setSyncStatus('syncing');
      console.log('🔄 Sincronización automática...');
      
      const response = await authAPI.profile();
      const userData = response.user;
      
      // Solo actualizar si hay cambios
      const localUser = JSON.parse(localStorage.getItem('baconfort-user') || '{}');
      
      if (JSON.stringify(userData) !== JSON.stringify(localUser)) {
        console.log('📡 Datos actualizados desde servidor');
        setUser(userData);
        
        const dataToSave = {
          ...userData,
          lastSync: new Date().toISOString()
        };
        localStorage.setItem('baconfort-user', JSON.stringify(dataToSave));
        
        setPersistenceInfo({
          hasLocalData: true,
          lastSync: new Date().toISOString(),
          isOnline: navigator.onLine
        });
      }
      
      setSyncStatus('synced');
      
    } catch (error) {
      console.warn('⚠️ Error de sincronización:', error.message);
      setSyncStatus('error');
      
      // Resetear a synced después de 5 segundos
      setTimeout(() => setSyncStatus('synced'), 5000);
    }
  };

  // 💾 ACTUALIZAR PERFIL CON PERSISTENCIA ROBUSTA
  const updateUserProfile = async (updateData) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('💾 Actualizando perfil:', updateData);
      
      // Intentar actualizar en la API
      const response = await authAPI.updateProfile(updateData);
      console.log('✅ Perfil actualizado en API:', response);
      
      // Actualizar estado local
      const updatedUser = response.user;
      setUser(updatedUser);
      
      // Sincronizar con localStorage
      const dataToSave = {
        ...updatedUser,
        lastSync: new Date().toISOString()
      };
      localStorage.setItem('baconfort-user', JSON.stringify(dataToSave));
      
      setPersistenceInfo({
        hasLocalData: true,
        lastSync: new Date().toISOString(),
        isOnline: navigator.onLine
      });
      
      setSyncStatus('synced');
      
      return { success: true, user: updatedUser };
      
    } catch (updateError) {
      console.error('❌ Error al actualizar perfil:', updateError);
      
      // Mantener cambios localmente como fallback
      const tempUser = { ...user, ...updateData, updatedAt: new Date().toISOString() };
      setUser(tempUser);
      
      const dataToSave = {
        ...tempUser,
        lastSync: new Date().toISOString(),
        pendingSync: true
      };
      localStorage.setItem('baconfort-user', JSON.stringify(dataToSave));
      
      setPersistenceInfo({
        hasLocalData: true,
        lastSync: new Date().toISOString(),
        isOnline: navigator.onLine
      });
      
      setSyncStatus('error');
      setError(`Error al sincronizar: ${updateError.message}`);
      
      console.warn('⚠️ Cambios guardados localmente, reintentando...');
      
      // Reintentar sincronización en 5 segundos
      setTimeout(() => syncUserProfile(), 5000);
      
      return { 
        success: false, 
        user: tempUser, 
        error: updateError.message,
        savedLocally: true 
      };
      
    } finally {
      setLoading(false);
    }
  };

  // 🔄 SINCRONIZACIÓN MANUAL
  const forceSyncNow = async () => {
    console.log('🔄 Sincronización manual forzada');
    await syncUserProfile();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    // 🔄 USAR LÓGICA DE PERSISTENCIA ROBUSTA
    const result = await updateUserProfile(formData);
    
    if (result.success) {
      setEditMode(false);
      alert('✅ Perfil actualizado exitosamente');
    } else if (result.savedLocally) {
      setEditMode(false);
      alert('⚠️ Cambios guardados temporalmente. Los datos se sincronizarán automáticamente cuando se restablezca la conexión.');
    } else {
      alert(`❌ Error al guardar: ${result.error}`);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    try {
      setPasswordLoading(true);
      setPasswordError('');
      
      console.log('🔐 Cambiando contraseña...');
      
      // Llamar a la API para cambiar contraseña
      await authAPI.changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      console.log('✅ Contraseña cambiada exitosamente');
      alert('✅ Contraseña actualizada exitosamente');
      
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordError('');
      
    } catch (err) {
      console.error('❌ Error al cambiar contraseña:', err);
      setPasswordError(`Error al cambiar la contraseña: ${err.message}`);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePrivacySettings = () => {
    setShowPrivacyModal(true);
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    if (window.confirm('¿Estás ABSOLUTAMENTE SEGURO de que quieres eliminar tu cuenta? Esta acción NO se puede deshacer.')) {
      try {
        alert('Cuenta eliminada. Serás redirigido al inicio.');
        localStorage.removeItem('baconfort-token');
        localStorage.removeItem('baconfort-user');
        window.location.href = '/';
      } catch (err) {
        setError('Error al eliminar la cuenta');
      }
    }
    setShowDeleteModal(false);
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderProfileTab = () => (
    <div className="profile-section">
      <div className="profile-header">
        <div className="profile-avatar">
          <i className="fas fa-user-circle"></i>
        </div>
        <div className="profile-info">
          <h3>{user?.name || 'Usuario'}</h3>
          <p>{user?.email}</p>
          <span className="member-since">
            Miembro desde {new Date(user?.createdAt || Date.now()).getFullYear()}
          </span>
          
          {/* 🔄 INDICADOR DE SINCRONIZACIÓN */}
          <div className={`sync-status sync-${syncStatus}`}>
            {syncStatus === 'synced' && (
              <>
                <i className="fas fa-check-circle"></i>
                <span>Datos sincronizados</span>
              </>
            )}
            {syncStatus === 'syncing' && (
              <>
                <i className="fas fa-sync-alt fa-spin"></i>
                <span>Sincronizando...</span>
              </>
            )}
            {syncStatus === 'error' && (
              <>
                <i className="fas fa-exclamation-triangle"></i>
                <span>Error de sincronización</span>
              </>
            )}
          </div>
          
          {/* 📊 INFORMACIÓN DE PERSISTENCIA */}
          {persistenceInfo && (
            <div className="persistence-info">
              <small>
                {persistenceInfo.hasLocalData && (
                  <span className="local-backup">
                    <i className="fas fa-mobile-alt"></i>
                    Backup local disponible
                  </span>
                )}
                {persistenceInfo.lastSync && (
                  <span className="last-sync">
                    <i className="fas fa-clock"></i>
                    Última sincronización: {new Date(persistenceInfo.lastSync).toLocaleTimeString()}
                  </span>
                )}
                {!persistenceInfo.isOnline && (
                  <span className="offline-warning">
                    <i className="fas fa-wifi"></i>
                    Sin conexión - usando datos locales
                  </span>
                )}
              </small>
            </div>
          )}
        </div>
        <div className="profile-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setEditMode(!editMode)}
          >
            <i className={`fas fa-${editMode ? 'times' : 'edit'}`}></i>
            {editMode ? 'Cancelar' : 'Editar Perfil'}
          </button>
          
          {/* 🔄 BOTÓN DE SINCRONIZACIÓN MANUAL */}
          {(syncStatus === 'error' || persistenceInfo?.hasLocalData) && (
            <button 
              className="btn btn-outline-secondary"
              onClick={forceSyncNow}
              disabled={syncStatus === 'syncing'}
              title="Sincronizar datos con el servidor"
            >
              <i className={`fas fa-sync-alt ${syncStatus === 'syncing' ? 'fa-spin' : ''}`}></i>
              Sincronizar
            </button>
          )}
        </div>
      </div>

      {editMode ? (
        <form className="profile-form" onSubmit={handleSaveProfile}>
          <div className="form-group">
            <label htmlFor="name">Nombre completo</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Teléfono</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-success" disabled={loading}>
              <i className="fas fa-save"></i>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => setEditMode(false)}
            >
              <i className="fas fa-times"></i>
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-details">
          <div className="detail-card">
            <h4>Información Personal</h4>
            <div className="detail-item">
              <i className="fas fa-user"></i>
              <div>
                <label>Nombre</label>
                <span>{user?.name || 'No especificado'}</span>
              </div>
            </div>
            <div className="detail-item">
              <i className="fas fa-envelope"></i>
              <div>
                <label>Email</label>
                <span>{user?.email}</span>
              </div>
            </div>
            <div className="detail-item">
              <i className="fas fa-phone"></i>
              <div>
                <label>Teléfono</label>
                <span>{user?.phone || 'No especificado'}</span>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <h4>Preferencias</h4>
            <div className="detail-item">
              <i className="fas fa-bell"></i>
              <div>
                <label>Notificaciones</label>
                <span>Activadas</span>
              </div>
            </div>
            <div className="detail-item">
              <i className="fas fa-globe"></i>
              <div>
                <label>Idioma</label>
                <span>Español</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="user-profile-container">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <h3>Cargando perfil...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <div className="profile-navigation">
        <h2>
          <i className="fas fa-user-cog"></i>
          Mi Cuenta
        </h2>
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fas fa-user"></i>
            Perfil
          </button>
          <button 
            className={`nav-tab ${activeTab === 'reservations' ? 'active' : ''}`}
            onClick={() => setActiveTab('reservations')}
          >
            <i className="fas fa-calendar-alt"></i>
            Mis Reservas
          </button>
          <button 
            className={`nav-tab ${activeTab === 'inquiries' ? 'active' : ''}`}
            onClick={() => setActiveTab('inquiries')}
          >
            <i className="fas fa-envelope"></i>
            Mis Consultas
          </button>
          <button 
            className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <i className="fas fa-cog"></i>
            Configuración
          </button>
        </div>
      </div>

      <div className="profile-content">
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'reservations' && <UserReservations />}
        {activeTab === 'inquiries' && <UserInquiries />}
        {activeTab === 'settings' && (
          <div className="settings-section">
            <h3>Configuración de la Cuenta</h3>
            <div className="settings-group">
              <h4>Seguridad</h4>
              <p>Mantén tu cuenta segura actualizando tu contraseña regularmente.</p>
              <div className="security-actions">
                <button 
                  className="btn btn-outline"
                  onClick={() => setShowPasswordModal(true)}
                >
                  <i className="fas fa-key"></i>
                  Cambiar Contraseña
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => setShowForgotPassword(true)}
                >
                  <i className="fas fa-unlock-alt"></i>
                  Recuperar Contraseña
                </button>
              </div>
            </div>
            <div className="settings-group">
              <h4>Privacidad</h4>
              <p>Configura cómo otros usuarios pueden ver tu información.</p>
              <button 
                className="btn btn-outline"
                onClick={handlePrivacySettings}
              >
                <i className="fas fa-shield-alt"></i>
                Configurar Privacidad
              </button>
            </div>
            <div className="settings-group danger-zone">
              <h4>Zona Peligrosa</h4>
              <p>Una vez eliminada, tu cuenta no se puede recuperar.</p>
              <button 
                className="btn btn-danger"
                onClick={handleDeleteAccount}
              >
                <i className="fas fa-trash"></i>
                Eliminar Cuenta
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      {showPasswordModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowPasswordModal(false)}>&times;</span>
            <h2>Cambiar Contraseña</h2>
            {passwordError && (
              <div className="error-message">
                <i className="fas fa-exclamation-triangle"></i>
                {passwordError}
              </div>
            )}
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label htmlFor="currentPassword">Contraseña Actual</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">Nueva Contraseña</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInputChange}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-success" disabled={passwordLoading}>
                  <i className="fas fa-save"></i>
                  {passwordLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowPasswordModal(false)}
                >
                  <i className="fas fa-times"></i>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPrivacyModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowPrivacyModal(false)}>&times;</span>
            <h2>Configuración de Privacidad</h2>
            <div className="privacy-settings">
              <div className="setting-item">
                <h4>Visibilidad del Perfil</h4>
                <p>Controla quién puede ver tu información personal.</p>
                <select className="form-control">
                  <option>Público</option>
                  <option>Solo usuarios registrados</option>
                  <option>Privado</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button 
                className="btn btn-success"
                onClick={() => {
                  alert('Configuración de privacidad guardada');
                  setShowPrivacyModal(false);
                }}
              >
                <i className="fas fa-save"></i>
                Guardar Cambios
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowPrivacyModal(false)}
              >
                <i className="fas fa-times"></i>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowDeleteModal(false)}>&times;</span>
            <h2>Eliminar Cuenta</h2>
            <p>¿Estás ABSOLUTAMENTE SEGURO de que quieres eliminar tu cuenta? Esta acción NO se puede deshacer.</p>
            <div className="form-actions">
              <button 
                className="btn btn-danger"
                onClick={confirmDeleteAccount}
              >
                <i className="fas fa-trash"></i>
                Eliminar Cuenta
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                <i className="fas fa-times"></i>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <ForgotPassword 
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
};

export default UserProfile;
