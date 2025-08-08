import { Link } from 'react-router-dom';
import '../styles/departamento.css';  // Update this line

export default function NotFound() {
    return (
        <main className="not-found-container">
            <div className="not-found-content">
                <div className="not-found-wrapper">
                    <div className="not-found-image">
                        <i className="fas fa-exclamation-triangle error-icon"></i>
                        <img 
                            src="img/img-error-404.jpg" 
                            alt="Page not found illustration"
                            className="error-illustration"
                        />
                    </div>
                    <div className="not-found-text">
                        <h3 className="error-code">
                            <i className="fas fa-bug bug-icon"></i> 404 Error
                        </h3>
                        <p className="error-title">
                            <i className="fas fa-map-signs sign-icon"></i> Página no encontrada
                        </p>
                        <p className="error-message">
                            Lo sentimos, la página que buscas no existe o ha sido movida.
                        </p>
                        <Link to="/" className="back-button">
                            <i className="fas fa-home home-icon"></i>
                            Volver al inicio
                            <i className="fas fa-arrow-right arrow-icon"></i>
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}