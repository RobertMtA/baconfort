import { useState } from 'react';
import './SubscriptionForm.css';

function SubscriptionForm() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage('Por favor ingresa tu email');
      setMessageType('error');
      return;
    }

    if (!isValidEmail(email)) {
      setMessage('Por favor ingresa un email válido');
      setMessageType('error');
      return;
    }

    setIsSubscribing(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5004/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('¡Te has suscrito exitosamente! Te mantendremos informado sobre nuestras ofertas especiales.');
        setMessageType('success');
        setEmail('');
      } else {
        setMessage(data.message || 'Error al suscribirse. Inténtalo nuevamente.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error al suscribirse:', error);
      setMessage('Error de conexión. Inténtalo nuevamente.');
      setMessageType('error');
    } finally {
      setIsSubscribing(false);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <section id="suscribete" className="subscription-section">
      <div className="container">
        <div className="subscription-content">
          <div className="subscription-header">
            <h2>
              <i className="fas fa-envelope"></i>
              ¡Mantente Informado!
            </h2>
            <p>Suscríbete a nuestro newsletter y recibe ofertas exclusivas, nuevos departamentos y promociones especiales directamente en tu email.</p>
          </div>
          
          <div className="subscription-benefits">
            <div className="benefit">
              <i className="fas fa-percent"></i>
              <span>Ofertas Exclusivas</span>
            </div>
            <div className="benefit">
              <i className="fas fa-home"></i>
              <span>Nuevos Departamentos</span>
            </div>
            <div className="benefit">
              <i className="fas fa-star"></i>
              <span>Promociones Especiales</span>
            </div>
            <div className="benefit">
              <i className="fas fa-calendar-alt"></i>
              <span>Disponibilidad Anticipada</span>
            </div>
          </div>

          <form className="subscription-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="input-wrapper">
                <i className="fas fa-envelope input-icon"></i>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="form-control"
                  disabled={isSubscribing}
                />
                <button 
                  type="submit" 
                  className="subscribe-btn"
                  disabled={isSubscribing || !email.trim()}
                >
                  {isSubscribing ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Suscribiendo...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Suscribirse
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {message && (
              <div className={`subscription-message ${messageType}`}>
                <i className={`fas ${messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                {message}
              </div>
            )}
          </form>

          <div className="subscription-footer">
            <p>
              <i className="fas fa-shield-alt"></i>
              Tu privacidad es importante para nosotros. No compartimos tu email con terceros.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SubscriptionForm;
