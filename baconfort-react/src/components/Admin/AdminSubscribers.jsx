import { useState, useEffect } from 'react';
import './AdminSubscribers.css';

function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubscribers, setSelectedSubscribers] = useState([]);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    try {
      const response = await fetch('http://localhost:5004/api/subscribers');
      if (response.ok) {
        const data = await response.json();
        console.log('📧 Subscribers API response:', data);
        
        // Verificar si los datos vienen en formato {success: true, data: [...]} o directamente como array
        if (Array.isArray(data)) {
          setSubscribers(data);
        } else if (data.success && Array.isArray(data.data)) {
          setSubscribers(data.data);
        } else if (data.data && Array.isArray(data.data)) {
          setSubscribers(data.data);
        } else {
          console.error('❌ Formato de datos inesperado:', data);
          setSubscribers([]);
        }
      } else {
        console.error('Error al cargar suscriptores');
        setSubscribers([]);
      }
    } catch (error) {
      console.error('Error al cargar suscriptores:', error);
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteSubscriber = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este suscriptor?')) return;
    
    try {
      const response = await fetch(`http://localhost:5004/api/subscribers/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        if (Array.isArray(subscribers)) {
          setSubscribers(subscribers.filter(sub => sub._id !== id));
        }
        alert('Suscriptor eliminado correctamente');
      } else {
        alert('Error al eliminar suscriptor');
      }
    } catch (error) {
      console.error('Error al eliminar suscriptor:', error);
      alert('Error al eliminar suscriptor');
    }
  };

  const toggleSubscriberSelection = (id) => {
    setSelectedSubscribers(prev => 
      prev.includes(id) 
        ? prev.filter(subId => subId !== id)
        : [...prev, id]
    );
  };

  const selectAllSubscribers = () => {
    if (!Array.isArray(subscribers)) return;
    
    if (selectedSubscribers.length === subscribers.length) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(subscribers.map(sub => sub._id));
    }
  };

  const sendBulkEmail = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      alert('Por favor completa el asunto y mensaje del email');
      return;
    }

    if (selectedSubscribers.length === 0) {
      alert('Por favor selecciona al menos un suscriptor');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('http://localhost:5004/api/subscribers/send-bulk-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscriberIds: selectedSubscribers,
          subject: emailSubject,
          message: emailMessage
        })
      });

      if (response.ok) {
        alert('Emails enviados correctamente');
        setShowEmailModal(false);
        setEmailSubject('');
        setEmailMessage('');
        setSelectedSubscribers([]);
      } else {
        alert('Error al enviar emails');
      }
    } catch (error) {
      console.error('Error al enviar emails:', error);
      alert('Error al enviar emails');
    } finally {
      setSending(false);
    }
  };

  const exportSubscribers = () => {
    if (!Array.isArray(subscribers)) {
      alert('No hay datos de suscriptores para exportar');
      return;
    }
    
    const csvContent = [
      ['Email', 'Fecha de Suscripción', 'Estado'],
      ...subscribers.map(sub => [
        sub.email,
        new Date(sub.createdAt).toLocaleDateString(),
        sub.active ? 'Activo' : 'Inactivo'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'suscriptores.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="admin-subscribers-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Cargando suscriptores...</p>
      </div>
    );
  }

  return (
    <div className="admin-subscribers">
      <div className="subscribers-header">
        <h2>
          <i className="fas fa-envelope"></i>
          Gestión de Suscriptores
        </h2>
        <div className="subscribers-actions">
          <button 
            className="btn btn-success"
            onClick={exportSubscribers}
            disabled={!Array.isArray(subscribers) || subscribers.length === 0}
          >
            <i className="fas fa-download"></i>
            Exportar CSV
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowEmailModal(true)}
            disabled={selectedSubscribers.length === 0}
          >
            <i className="fas fa-paper-plane"></i>
            Enviar Email ({selectedSubscribers.length})
          </button>
        </div>
      </div>

      <div className="subscribers-stats">
        <div className="stat-card">
          <i className="fas fa-users"></i>
          <div>
            <h3>{Array.isArray(subscribers) ? subscribers.length : 0}</h3>
            <p>Total Suscriptores</p>
          </div>
        </div>
        <div className="stat-card">
          <i className="fas fa-user-check"></i>
          <div>
            <h3>{Array.isArray(subscribers) ? subscribers.filter(sub => sub.active).length : 0}</h3>
            <p>Activos</p>
          </div>
        </div>
        <div className="stat-card">
          <i className="fas fa-calendar-day"></i>
          <div>
            <h3>{Array.isArray(subscribers) ? subscribers.filter(sub => 
              new Date(sub.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length : 0}</h3>
            <p>Esta Semana</p>
          </div>
        </div>
      </div>

      <div className="subscribers-table-container">
        <div className="table-controls">
          <button 
            className="btn btn-outline-primary"
            onClick={selectAllSubscribers}
          >
            <i className="fas fa-check-square"></i>
            {Array.isArray(subscribers) && selectedSubscribers.length === subscribers.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
          </button>
        </div>

        <table className="subscribers-table">
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox"
                  checked={Array.isArray(subscribers) && selectedSubscribers.length === subscribers.length && subscribers.length > 0}
                  onChange={selectAllSubscribers}
                />
              </th>
              <th>Email</th>
              <th>Fecha de Suscripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {!Array.isArray(subscribers) || subscribers.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-subscribers">
                  <i className="fas fa-inbox"></i>
                  <p>{!Array.isArray(subscribers) ? 'Error cargando suscriptores' : 'No hay suscriptores registrados'}</p>
                </td>
              </tr>
            ) : (
              subscribers.map(subscriber => (
                <tr key={subscriber._id}>
                  <td>
                    <input 
                      type="checkbox"
                      checked={selectedSubscribers.includes(subscriber._id)}
                      onChange={() => toggleSubscriberSelection(subscriber._id)}
                    />
                  </td>
                  <td>{subscriber.email}</td>
                  <td>{new Date(subscriber.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${subscriber.active ? 'active' : 'inactive'}`}>
                      {subscriber.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteSubscriber(subscriber._id)}
                      title="Eliminar suscriptor"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Email */}
      {showEmailModal && (
        <div className="email-modal-overlay">
          <div className="email-modal">
            <div className="email-modal-header">
              <h3>
                <i className="fas fa-paper-plane"></i>
                Enviar Email a {selectedSubscribers.length} suscriptores
              </h3>
              <button 
                className="close-modal"
                onClick={() => setShowEmailModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="email-modal-body">
              <div className="form-group">
                <label>Asunto:</label>
                <input 
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Asunto del email"
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label>Mensaje:</label>
                <textarea 
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Escribe tu mensaje aquí..."
                  className="form-control"
                  rows="6"
                />
              </div>
            </div>
            
            <div className="email-modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowEmailModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary"
                onClick={sendBulkEmail}
                disabled={sending}
              >
                {sending ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Enviando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Enviar Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSubscribers;
