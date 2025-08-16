const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  // Información del usuario
  userId: {
    type: String,  // Cambiado a String para soportar usuarios de prueba
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  
  // Información de la propiedad
  propertyId: {
    type: String,
    required: true
  },
  propertyName: {
    type: String,
    required: true
  },
  
  // Detalles de la reserva
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    required: true
  },
  guests: {
    type: String,
    required: true
  },
  
  // Información de contacto
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  dni: {
    type: String,
    validate: {
      validator: function(v) {
        // DNI es válido si está vacío (no requerido) o tiene 7-8 dígitos
        return !v || /^\d{7,8}$/.test(v);
      },
      message: 'DNI debe tener 7 u 8 dígitos'
    }
  },
  idType: {
    type: String,
    enum: ['dni', 'passport'],
    default: 'dni'
  },
  passport: {
    type: String,
    validate: {
      validator: function(v) {
        // Passport es válido si está vacío (no requerido) o tiene al menos 6 caracteres
        return !v || v.length >= 6;
      },
      message: 'Pasaporte debe tener al menos 6 caracteres'
    }
  },
  message: {
    type: String,
    required: true
  },
  
  // Estado de la reserva
  status: {
    type: String,
    enum: ['pending', 'approved', 'payment_pending', 'confirmed', 'cancelled', 'completed', 'rejected'],
    default: 'pending'
  },
  
  // Información de administración
  adminNotes: {
    type: String,
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  approvedBy: {
    type: String,
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  rejectedReason: {
    type: String,
    default: null
  },
  
  // Información de pago
  paymentInfo: {
    provider: {
      type: String,
      enum: ['mercadopago', 'efectivo', null],
      default: null
    },
    paymentId: {
      type: String,
      default: null
    },
    amount: {
      type: Number,
      default: null
    },
    currency: {
      type: String,
      default: 'USD'
    },
    paymentMethod: {
      type: String,
      default: null
    },
    paidAt: {
      type: Date,
      default: null
    },
    transactionId: {
      type: String,
      default: null
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'refunded', null],
      default: null
    }
  },
  
  // Información de precio calculada
  priceInfo: {
    totalAmount: {
      type: Number,
      default: null
    },
    currency: {
      type: String,
      default: 'USD'
    },
    nights: {
      type: Number,
      default: null
    },
    breakdown: {
      type: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', null],
        default: null
      },
      weeks: Number,
      weeklyPrice: Number,
      weeklyTotal: Number,
      months: Number,
      monthlyPrice: Number,
      monthlyTotal: Number,
      extraDays: Number,
      dailyPrice: Number,
      extraDaysTotal: Number,
      dailyTotal: Number
    },
    propertyPrices: {
      daily: Number,
      weekly: Number,
      monthly: Number,
      currency: String
    }
  },
  
  // Fechas del sistema
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  cancelledAt: {
    type: Date
  }
});

// Actualizar updatedAt antes de guardar
reservationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Validar que al menos DNI o passport esté presente
  if (!this.dni && !this.passport) {
    const error = new Error('DNI o Pasaporte es requerido');
    error.name = 'ValidationError';
    return next(error);
  }
  
  next();
});

module.exports = mongoose.model('Reservation', reservationSchema);
