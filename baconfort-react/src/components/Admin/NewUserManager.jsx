import React, { useState, useEffect } from 'react';
import { useUsers } from '../../context/UsersContext';
import './UserManager.css';

function NewUserManager() {
  const { 
    users, 
    loading, 
    error, 
    loadUsers, 
    updateUser, 
    deleteUser, 
    totalUsers, 
    adminUsers, 
    guestUsers 
  } = useUsers();

  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

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

    const result = await updateUser(editingUser._id, editingUser);
    
    if (result.success) {
      setEditingUser(null);
      alert('Usuario actualizado exitosamente');
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleDeleteUser = async (userId) => {
    const result = await deleteUser(userId);
    
    if (result.success) {
      setShowDeleteConfirm(null);
      alert('Usuario eliminado exitosamente');
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    const userToChange = users.find(u => u._id === userId);
    if (!userToChange) return;

    const updatedUser = { ...userToChange, role: newRole };
    const result = await updateUser(userId, updatedUser);
    
    if (result.success) {
      alert('Rol actualizado exitosamente');
    } else {
      alert(`Error: ${result.error}`);
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
          <button onClick={loadUsers} className="btn-retry">
            <i className="fas fa-redo"></i>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-manager">
      <div className="user-manager-header">
        <h2>
          <i className="fas fa-users"></i>
          Gestión de Usuarios
        </h2>
        
        <div className="stats-row">
          <div className="stat-card">
            <i className="fas fa-users"></i>
            <div>
              <span className="stat-number">{totalUsers}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-crown"></i>
            <div>
              <span className="stat-number">{adminUsers}</span>
              <span className="stat-label">Admins</span>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-user"></i>
            <div>
              <span className="stat-number">{guestUsers}</span>
              <span className="stat-label">Usuarios</span>
            </div>
          </div>
        </div>
      </div>

      <div className="user-controls">
        <div className="search-filters">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-box">
            <label>Filtrar por rol:</label>
            <select 
              value={filterRole} 
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="admin">Administradores</option>
              <option value="guest">Usuarios</option>
            </select>
          </div>
        </div>

        <button onClick={loadUsers} className="btn-refresh">
          <i className="fas fa-sync-alt"></i>
          Actualizar
        </button>
      </div>

      <div className="users-table">
        <div className="table-header">
          <div className="col-user">Usuario</div>
          <div className="col-email">Email</div>
          <div className="col-role">Rol</div>
          <div className="col-date">Fecha de Registro</div>
          <div className="col-actions">Acciones</div>
        </div>

        {filteredUsers.map(user => (
          <div key={user._id} className="table-row">
            <div className="col-user">
              <div className="user-info">
                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <i className="fas fa-user"></i>
                  )}
                </div>
                <div className="user-details">
                  <span className="user-name">{user.name}</span>
                  <span className="user-status">
                    {user.isActive ? (
                      <><i className="fas fa-circle text-success"></i> Activo</>
                    ) : (
                      <><i className="fas fa-circle text-danger"></i> Inactivo</>
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="col-email">{user.email}</div>
            
            <div className="col-role">
              <select 
                value={user.role} 
                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                className={`role-select ${user.role}`}
              >
                <option value="guest">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            
            <div className="col-date">
              {new Date(user.createdAt).toLocaleDateString()}
            </div>
            
            <div className="col-actions">
              <button 
                onClick={() => handleEditUser(user._id)}
                className="btn-edit"
                title="Editar usuario"
              >
                <i className="fas fa-edit"></i>
              </button>
              
              <button 
                onClick={() => setShowDeleteConfirm(user._id)}
                className="btn-delete"
                title="Eliminar usuario"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="no-users">
            <i className="fas fa-users"></i>
            <p>No se encontraron usuarios con los filtros aplicados</p>
          </div>
        )}
      </div>

      {/* Modal de edición */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar Usuario</h3>
            <div className="form-group">
              <label>Nombre:</label>
              <input
                type="text"
                value={editingUser.name}
                onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Rol:</label>
              <select
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
    </div>
  );
}

export default NewUserManager;
