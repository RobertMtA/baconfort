const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  propertyId: {
    type: String,
    required: [true, 'El ID de la propiedad es obligatorio'],
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Permite reviews de usuarios no registrados
  },
  guestName: {
    type: String,
    required: [true, 'El nombre del huésped es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
  },
  guestEmail: {
    type: String,
    required: [true, 'El email es obligatorio'],
    lowercase: true,
    trim: true
  },
  rating: {
    type: Number,
    required: [true, 'La calificación es obligatoria'],
    min: [1, 'La calificación mínima es 1'],
    max: [5, 'La calificación máxima es 5']
  },
  comment: {
    type: String,
    required: [true, 'El comentario es obligatorio'],
    trim: true,
    minlength: [10, 'El comentario debe tener al menos 10 caracteres'],
    maxlength: [1000, 'El comentario no puede tener más de 1000 caracteres']
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isHighlight: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  moderationNotes: {
    type: String,
    default: null
  },
  moderatedBy: {
    type: String, // Cambiado de ObjectId a String para aceptar identificadores como 'admin_baconfort_2025'
    default: null
  },
  moderatedAt: {
    type: Date,
    default: null
  },
  stayDates: {
    checkIn: Date,
    checkOut: Date
  },
  helpful: {
    type: Number,
    default: 0
  },
  reported: {
    type: Number,
    default: 0
  },
  language: {
    type: String,
    enum: ['es', 'en', 'pt'],
    default: 'es'
  },
  source: {
    type: String,
    enum: ['website', 'booking', 'airbnb', 'direct'],
    default: 'website'
  }
}, {
  timestamps: true
});

// Índices para búsquedas frecuentes
reviewSchema.index({ propertyId: 1, isApproved: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ isHighlight: -1, isApproved: 1 });

// Validación para evitar reviews duplicadas del mismo usuario para la misma propiedad
// Para usuarios no registrados, usamos el email como identificador único
reviewSchema.index({ 
  propertyId: 1, 
  guestEmail: 1 
}, { 
  unique: true, 
  sparse: false // Siempre debe haber email
});

// Middleware para actualizar estadísticas de la propiedad
reviewSchema.post('save', async function() {
  if (this.isApproved) {
    const Property = mongoose.model('Property');
    const property = await Property.findOne({ id: this.propertyId });
    if (property) {
      await property.updateReviewStats();
    }
  }
});

reviewSchema.post('findOneAndUpdate', async function(doc) {
  if (doc && doc.isApproved) {
    const Property = mongoose.model('Property');
    const property = await Property.findOne({ id: doc.propertyId });
    if (property) {
      await property.updateReviewStats();
    }
  }
});

// Método para aprobar review
reviewSchema.methods.approve = function(moderatorId, notes = null) {
  this.isApproved = true;
  this.moderatedBy = moderatorId;
  this.moderatedAt = new Date();
  if (notes) this.moderationNotes = notes;
  return this.save();
};

// Método para rechazar review
reviewSchema.methods.reject = function(moderatorId, notes) {
  this.isApproved = false;
  this.moderatedBy = moderatorId;
  this.moderatedAt = new Date();
  this.moderationNotes = notes;
  return this.save();
};

module.exports = mongoose.model('Review', reviewSchema);
