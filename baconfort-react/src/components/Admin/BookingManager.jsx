import { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext-STATEFUL';
import './BookingManager.css';

function BookingManager() {
  const { data, updateData } = useAdmin();
  const [bookings, setBookings] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    property: 'all',
    dateRange: 'all'
  });
  const [newBooking, setNewBooking] = useState({
    propertyId: '',
    guestName: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    status: 'pending',
    notes: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  // Cargar reservas del localStorage
  useEffect(() => {
    const savedBookings = localStorage.getItem('baconfort_bookings');
    if (savedBookings) {
      try {
        setBookings(JSON.parse(savedBookings));
      } catch (error) {
        console.error('Error cargando reservas:', error);
        setBookings([]);
      }
    }
  }, []);

  // Guardar reservas en localStorage
  const saveBookings = (updatedBookings) => {
    setBookings(updatedBookings);
    localStorage.setItem('baconfort_bookings', JSON.stringify(updatedBookings));
  };

  const addBooking = () => {
    if (!newBooking.propertyId || !newBooking.guestName || !newBooking.email) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    const booking = {
      id: Date.now().toString(),
      ...newBooking,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedBookings = [...bookings, booking];
    saveBookings(updatedBookings);
    
    setNewBooking({
      propertyId: '',
      guestName: '',
      email: '',
      phone: '',
      checkIn: '',
      checkOut: '',
      guests: 1,
      status: 'pending',
      notes: ''
    });
    setShowAddForm(false);
  };

  const updateBookingStatus = (bookingId, newStatus) => {
    const updatedBookings = bookings.map(booking =>
      booking.id === bookingId
        ? { ...booking, status: newStatus, updatedAt: new Date().toISOString() }
        : booking
    );
    saveBookings(updatedBookings);
  };

  const deleteBooking = (bookingId) => {
    if (window.confirm('¿Estás seguro de eliminar esta reserva?')) {
      const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
      saveBookings(updatedBookings);
    }
  };

  const getPropertyName = (propertyId) => {
    const property = data?.properties?.[propertyId];
    return property?.title || propertyId;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pendiente', className: 'status-pending' },
      confirmed: { label: 'Confirmada', className: 'status-confirmed' },
      cancelled: { label: 'Cancelada', className: 'status-cancelled' },
      completed: { label: 'Completada', className: 'status-completed' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`status-badge ${config.className}`}>{config.label}</span>;
  };

  const filteredBookings = bookings.filter(booking => {
    if (filters.status !== 'all' && booking.status !== filters.status) return false;
    if (filters.property !== 'all' && booking.propertyId !== filters.property) return false;
    return true;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };

  return (
    <div className="booking-manager">
      <div className="booking-header">
        <h3><i className="fas fa-calendar-alt"></i> Gestión de Reservas</h3>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary"
        >
          <i className="fas fa-plus"></i> Nueva Reserva
        </button>
      </div>

      {/* Estadísticas */}
      <div className="booking-stats">
        <div className="stat-card">
          <i className="fas fa-list-alt"></i>
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card">
          <i className="fas fa-clock"></i>
          <span className="stat-number">{stats.pending}</span>
          <span className="stat-label">Pendientes</span>
        </div>
        <div className="stat-card">
          <i className="fas fa-check-circle"></i>
          <span className="stat-number">{stats.confirmed}</span>
          <span className="stat-label">Confirmadas</span>
        </div>
        <div className="stat-card">
          <i className="fas fa-times-circle"></i>
          <span className="stat-number">{stats.cancelled}</span>
          <span className="stat-label">Canceladas</span>
        </div>
      </div>

      {/* Formulario de nueva reserva */}
      {showAddForm && (
        <div className="add-booking-form">
          <h4>Nueva Reserva</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Propiedad *</label>
              <select
                value={newBooking.propertyId}
                onChange={(e) => setNewBooking(prev => ({ ...prev, propertyId: e.target.value }))}
                required
              >
                <option value="">Seleccionar propiedad</option>
                {Object.values(data?.properties || {}).map(property => (
                  <option key={property.id} value={property.id}>
                    {property.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Nombre del huésped *</label>
              <input
                type="text"
                value={newBooking.guestName}
                onChange={(e) => setNewBooking(prev => ({ ...prev, guestName: e.target.value }))}
                placeholder="Nombre completo"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={newBooking.email}
                onChange={(e) => setNewBooking(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@ejemplo.com"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="tel"
                value={newBooking.phone}
                onChange={(e) => setNewBooking(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+54 9 11 1234-5678"
              />
            </div>
            
            <div className="form-group">
              <label>Check-in *</label>
              <input
                type="date"
                value={newBooking.checkIn}
                onChange={(e) => setNewBooking(prev => ({ ...prev, checkIn: e.target.value }))}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Check-out *</label>
              <input
                type="date"
                value={newBooking.checkOut}
                onChange={(e) => setNewBooking(prev => ({ ...prev, checkOut: e.target.value }))}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Huéspedes</label>
              <select
                value={newBooking.guests}
                onChange={(e) => setNewBooking(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num} huésped{num > 1 ? 'es' : ''}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Estado</label>
              <select
                value={newBooking.status}
                onChange={(e) => setNewBooking(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmada</option>
                <option value="cancelled">Cancelada</option>
                <option value="completed">Completada</option>
              </select>
            </div>
          </div>
          
          <div className="form-group full-width">
            <label>Notas</label>
            <textarea
              value={newBooking.notes}
              onChange={(e) => setNewBooking(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Comentarios adicionales..."
              rows="3"
            />
          </div>
          
          <div className="form-actions">
            <button onClick={addBooking} className="btn btn-success">
              <i className="fas fa-save"></i> Guardar Reserva
            </button>
            <button onClick={() => setShowAddForm(false)} className="btn btn-secondary">
              <i className="fas fa-times"></i> Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="booking-filters">
        <div className="filter-group">
          <label>Estado:</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="confirmed">Confirmadas</option>
            <option value="cancelled">Canceladas</option>
            <option value="completed">Completadas</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Propiedad:</label>
          <select
            value={filters.property}
            onChange={(e) => setFilters(prev => ({ ...prev, property: e.target.value }))}
          >
            <option value="all">Todas</option>
            {Object.values(data?.properties || {}).map(property => (
              <option key={property.id} value={property.id}>
                {property.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de reservas */}
      <div className="bookings-list">
        {filteredBookings.length > 0 ? (
          filteredBookings.map(booking => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <div className="booking-property">
                  <i className="fas fa-building"></i>
                  <strong>{getPropertyName(booking.propertyId)}</strong>
                </div>
                <div className="booking-status">
                  {getStatusBadge(booking.status)}
                </div>
              </div>
              
              <div className="booking-details">
                <div className="guest-info">
                  <i className="fas fa-user"></i>
                  <span><strong>{booking.guestName}</strong></span>
                  <small>{booking.email}</small>
                  {booking.phone && <small>{booking.phone}</small>}
                </div>
                
                <div className="date-info">
                  <i className="fas fa-calendar"></i>
                  <span>{booking.checkIn} → {booking.checkOut}</span>
                  <small>{booking.guests} huésped{booking.guests > 1 ? 'es' : ''}</small>
                </div>
              </div>
              
              {booking.notes && (
                <div className="booking-notes">
                  <i className="fas fa-sticky-note"></i>
                  <span>{booking.notes}</span>
                </div>
              )}
              
              <div className="booking-actions">
                <select
                  value={booking.status}
                  onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                  className="status-select"
                >
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmada</option>
                  <option value="cancelled">Cancelada</option>
                  <option value="completed">Completada</option>
                </select>
                
                <button
                  onClick={() => deleteBooking(booking.id)}
                  className="btn btn-danger btn-sm"
                  title="Eliminar reserva"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-bookings">
            <i className="fas fa-calendar-times"></i>
            <p>No hay reservas que coincidan con los filtros</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingManager;
