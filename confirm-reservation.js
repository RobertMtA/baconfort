// confirm-reservation.js
const API_URL = 'https://baconfort-production-084d.up.railway.app/api';

async function confirmReservation() {
  const response = await fetch(`${API_URL}/reservations/admin/6882f5c96ba25e9b5475287a/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer BACONFORT_ADMIN_2025_7D3F9K2L'
    },
    body: JSON.stringify({ status: 'confirmed' })
  });
  const result = await response.json();
  console.log('✅ Reserva confirmada:', result);
}

confirmReservation();

