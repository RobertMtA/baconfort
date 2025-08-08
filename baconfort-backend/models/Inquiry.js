const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  propertyId: {
    type: String,
    required: true
  },
  propertyTitle: {
    type: String,
    required: true
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    required: true
  },
  guests: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  guestName: {
    type: String,
    required: true
  },
  guestEmail: {
    type: String,
    required: true
  },
  guestPhone: {
    type: String,
    required: false
  },
  guestDni: {
    type: String,
    required: false
  },
  guestPassport: {
    type: String,
    required: false
  },
  customMessage: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminResponse: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Índices para mejorar el rendimiento de las consultas
inquirySchema.index({ userId: 1, createdAt: -1 });
inquirySchema.index({ status: 1, createdAt: -1 });
inquirySchema.index({ checkIn: 1, checkOut: 1 });

// Middleware para actualizar updatedAt automáticamente
inquirySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Método para calcular la duración de la estadía
inquirySchema.methods.getStayDuration = function() {
  const diffTime = Math.abs(this.checkOut - this.checkIn);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Método para obtener el estado en español
inquirySchema.methods.getStatusInSpanish = function() {
  const statusMap = {
    'pending': 'Pendiente',
    'approved': 'Aprobada',
    'rejected': 'Rechazada'
  };
  return statusMap[this.status] || this.status;
};

// Método para verificar si la consulta está expirada (más de 7 días)
inquirySchema.methods.isExpired = function() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return this.createdAt < sevenDaysAgo && this.status === 'pending';
};

module.exports = mongoose.model('Inquiry', inquirySchema);
