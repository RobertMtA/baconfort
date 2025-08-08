import { useState, useEffect } from 'react';
import './Loading.css';

export default function Loading() {
    const [showLoading, setShowLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowLoading(false);
        }, 3000); // Shows loading for 3 seconds

        return () => clearTimeout(timer);
    }, []);

    if (!showLoading) return null;

    return (
        <div className="loading-container">
            <div className="loading-content">
                <img 
                    src="/img/cartoon-giff.gif" 
                    alt="Loading..." 
                    className="loading-gif"
                />
                <h2>Cargando...</h2>
                <p>Por favor espere mientras se cargan los contenidos</p>
            </div>
        </div>
    );
}