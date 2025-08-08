import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import './SimpleUserManager.css';

function SimpleUserManager() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'guest'
  });

  useEffect(() => {
    loadUsersDirectly();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterRole]);

  const filterUsers = () => {
    let filtered = [...users];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por rol
    if (filterRole !== 'all') {
      filtered = filtered.filter(u => u.role === filterRole);
    }

    setFilteredUsers(filtered);
  };

  const loadUsersDirectly = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await usersAPI.getAll();
      
      if (response.success) {
        setUsers(response.data);
      } else {
        setError(response.error || 'Error desconocido');
      }
    } catch (err) {
      console.error('❌ SimpleUserManager: Error cargando usuarios:', err);
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (userId) => {
    const userToEdit = users.find(u => u._id === userId);
    if (userToEdit) {
      setEditingUser({ ...userToEdit });
    }
  };

  const handleSaveUser = async () => {
    if (!editingUser.name.trim() || !editingUser.email.trim()) {
      alert('Nombre y email son obligatorios');
      return;
    }

    // Verificar email único
    const emailExists = users.find(u => 
      u._id !== editingUser._id && 
      u.email.toLowerCase() === editingUser.email.toLowerCase()
    );

    if (emailExists) {
      alert('Este email ya está en uso por otro usuario');
      return;
    }

    try {
      const response = await usersAPI.update(editingUser._id, editingUser);
      
      if (response.success) {
        setEditingUser(null);
        loadUsersDirectly();
        alert('Usuario actualizado exitosamente');
      } else {
        alert(`Error: ${response.error}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await usersAPI.delete(userId);
      
      if (response.success) {
        setShowDeleteConfirm(null);
        loadUsersDirectly();
        alert('Usuario eliminado exitosamente');
      } else {
        alert(`Error: ${response.error}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    const userToChange = users.find(u => u._id === userId);
    if (!userToChange) return;

    try {
      const updatedUser = { ...userToChange, role: newRole };
      const response = await usersAPI.update(userId, updatedUser);
      
      if (response.success) {
        loadUsersDirectly();
        alert('Rol actualizado exitosamente');
      } else {
        alert(`Error: ${response.error}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      alert('Todos los campos son obligatorios');
      return;
    }

    // Verificar email único
    const emailExists = users.find(u => 
      u.email.toLowerCase() === newUser.email.toLowerCase()
    );

    if (emailExists) {
      alert('Este email ya está en uso');
      return;
    }

    try {
      const response = await fetch('http://localhost:3002/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newUser.name.trim(),
          email: newUser.email.trim(),
          password: newUser.password,
          role: newUser.role
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setShowCreateUser(false);
        setNewUser({ name: '', email: '', password: '', role: 'guest' });
        loadUsersDirectly();
        alert(`Usuario creado exitosamente. Se ha enviado un email de bienvenida a ${newUser.email}.`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="user-manager">
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
          Cargando usuarios...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-manager">
        <div className="error">
          <i className="fas fa-exclamation-triangle"></i>
          Error: {error}
          <button onClick={loadUsersDirectly} className="btn-retry">
            <i className="fas fa-redo"></i>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Estadísticas
  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const guestUsers = users.filter(u => u.role === 'guest').length;

  return (
    <div className="user-manager">
      <div className="user-manager-header">
        <h2 className="section-title">
          <i className="fas fa-users"></i>
          Gestión de Usuarios
        </h2>
      </div>
      
      {/* Estadísticas */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-content">
              <span className="stat-number">{totalUsers}</span>
              <span className="stat-label">Total de Usuarios</span>
            </div>
          </div>
          
          <div className="stat-card admins">
            <div className="stat-icon">
              <i className="fas fa-crown"></i>
            </div>
            <div className="stat-content">
              <span className="stat-number">{adminUsers}</span>
              <span className="stat-label">Administradores</span>
            </div>
          </div>
          
          <div className="stat-card users">
            <div className="stat-icon">
              <i className="fas fa-user"></i>
            </div>
            <div className="stat-content">
              <span className="stat-number">{guestUsers}</span>
              <span className="stat-label">Usuarios Regulares</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de búsqueda y filtros */}
      <div className="controls-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id="user-search"
              name="user-search"
            />
          </div>
        </div>
        
        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="role-filter" className="filter-label">Filtrar por rol:</label>
            <select 
              id="role-filter"
              name="role-filter"
              className="filter-select"
              value={filterRole} 
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">Todos los roles</option>
              <option value="admin">Administradores</option>
              <option value="guest">Usuarios</option>
            </select>
          </div>
          
          <button 
            onClick={() => setShowCreateUser(true)} 
            className="create-user-btn"
            title="Crear nuevo usuario"
          >
            <i className="fas fa-plus"></i>
            Crear Usuario
          </button>
          
          <button onClick={loadUsersDirectly} className="refresh-btn">
            <i className="fas fa-sync-alt"></i>
            Actualizar
          </button>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="table-section">
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th className="th-user">Usuario</th>
                <th className="th-email">Email</th>
                <th className="th-role">Rol</th>
                <th className="th-date">Fecha de Registro</th>
                <th className="th-actions">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id} className="table-row">
                  <td className="td-user">
                    <div className="user-cell">
                      <div className="user-avatar">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="avatar-image" />
                        ) : (
                          <div className="avatar-placeholder">
                            <i className="fas fa-user"></i>
                          </div>
                        )}
                      </div>
                      <div className="user-info">
                        <div className="user-name">{user.name}</div>
                        <div className="user-status">
                          <span className={`status-indicator ${user.isActive !== false ? 'active' : 'inactive'}`}>
                            <i className={`fas fa-circle ${user.isActive !== false ? 'text-success' : 'text-danger'}`}></i>
                            {user.isActive !== false ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="td-email">
                    <span className="email-text">{user.email}</span>
                  </td>
                  
                  <td className="td-role">
                    <select 
                      value={user.role} 
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className={`role-select role-${user.role}`}
                      title={`Cambiar rol de ${user.name}`}
                    >
                      <option value="guest">Usuario</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </td>
                  
                  <td className="td-date">
                    <span className="date-text">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      }) : 'N/A'}
                    </span>
                  </td>
                  
                  <td className="td-actions">
                    <div className="actions-group">
                      <button 
                        onClick={() => handleEditUser(user._id)}
                        className="action-btn edit-btn"
                        title="Editar usuario"
                        aria-label={`Editar usuario ${user.name}`}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      
                      <button 
                        onClick={() => setShowDeleteConfirm(user._id)}
                        className="action-btn delete-btn"
                        title="Eliminar usuario"
                        aria-label={`Eliminar usuario ${user.name}`}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>No se encontraron usuarios</h3>
              <p>No hay usuarios que coincidan con los filtros aplicados</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de edición */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar Usuario</h3>
            <div className="form-group">
              <label htmlFor="edit-name">Nombre:</label>
              <input
                id="edit-name"
                name="edit-name"
                type="text"
                value={editingUser.name}
                onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-email">Email:</label>
              <input
                id="edit-email"
                name="edit-email"
                type="email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-role">Rol:</label>
              <select
                id="edit-role"
                name="edit-role"
                value={editingUser.role}
                onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
              >
                <option value="guest">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={handleSaveUser} className="btn-save">
                <i className="fas fa-save"></i> Guardar
              </button>
              <button onClick={() => setEditingUser(null)} className="btn-cancel">
                <i className="fas fa-times"></i> Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmar Eliminación</h3>
            <p>¿Estás seguro de que quieres eliminar este usuario?</p>
            <div className="modal-actions">
              <button 
                onClick={() => handleDeleteUser(showDeleteConfirm)} 
                className="btn-delete"
              >
                <i className="fas fa-trash"></i> Eliminar
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(null)} 
                className="btn-cancel"
              >
                <i className="fas fa-times"></i> Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de creación de usuario */}
      {showCreateUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Crear Nuevo Usuario</h3>
            <div className="form-group">
              <label htmlFor="new-name">Nombre:</label>
              <input
                id="new-name"
                name="new-name"
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label htmlFor="new-email">Email:</label>
              <input
                id="new-email"
                name="new-email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label htmlFor="new-password">Contraseña:</label>
              <input
                id="new-password"
                name="new-password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label htmlFor="new-role">Rol:</label>
              <select
                id="new-role"
                name="new-role"
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              >
                <option value="guest">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={handleCreateUser} className="btn-create">
                <i className="fas fa-plus"></i> Crear Usuario
              </button>
              <button onClick={() => setShowCreateUser(false)} className="btn-cancel">
                <i className="fas fa-times"></i> Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SimpleUserManager;
