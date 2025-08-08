const express = require('express');
const router = express.Router();

// Placeholder para futuras funcionalidades de reservas
// Por ahora, retornamos datos mock

// @route   GET /api/bookings
// @desc    Obtener reservas (mock)
// @access  Public
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Funcionalidad de reservas en desarrollo',
    data: []
  });
});

// @route   POST /api/bookings
// @desc    Crear reserva (mock)
// @access  Public
router.post('/', (req, res) => {
  res.json({
    success: true,
    message: 'Reserva recibida. Te contactaremos pronto.',
    data: {
      id: Date.now().toString(),
      status: 'pending',
      ...req.body
    }
  });
});

module.exports = router;
