import React from 'react';
import UserReservations from '../components/UserReservations/UserReservations';
import './ProfileReservations.css';

const ProfileReservations = () => {
  return (
    <div className="profile-reservations-page">
      <div className="page-container">
        <div className="page-header">
          <h1>Mi Perfil - Reservas</h1>
          <p>Gestiona todas tus reservas y realiza pagos pendientes</p>
        </div>
        
        <UserReservations />
      </div>
    </div>
  );
};

export default ProfileReservations;
