const mongoose = require('mongoose');

const amenitySchema = new mongoose.Schema({
  icon: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  }
});

const priceSchema = new mongoose.Schema({
  daily: {
    type: Number,
    required: [true, 'El precio diario es obligatorio'],
    min: [1, 'El precio debe ser mayor a 0']
  },
  weekly: {
    type: Number,
    required: [true, 'El precio semanal es obligatorio'],
    min: [1, 'El precio debe ser mayor a 0']
  },
  monthly: {
    type: Number,
    required: [true, 'El precio mensual es obligatorio'],
    min: [1, 'El precio debe ser mayor a 0']
  },
  currency: {
    type: String,
    enum: ['USD', 'ARS', 'EUR'],
    default: 'USD'
  }
});

const propertySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true,
    maxlength: [100, 'El título no puede tener más de 100 caracteres']
  },
  address: {
    type: String,
    required: [true, 'La dirección es obligatoria'],
    trim: true
  },
  description: {
    es: { type: String, required: true },
    en: { type: String, required: true },
    pt: { type: String, required: true }
  },
  prices: {
    type: priceSchema,
    required: true
  },
  coverImage: {
    type: String,
    required: [true, 'La imagen de portada es obligatoria']
  },
  heroVideo: {
    type: String,
    default: null
  },
  galleryImages: [{
    type: String,
    required: true
  }],
  amenities: {
    departamento: [amenitySchema],
    servicios: [amenitySchema],
    amenitiesEdificio: [amenitySchema]
  },
  location: {
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    neighborhood: String,
    city: { type: String, default: 'Buenos Aires' },
    country: { type: String, default: 'Argentina' }
  },
  capacity: {
    guests: { type: Number, required: true, min: 1 },
    bedrooms: { type: Number, required: true, min: 1 },
    bathrooms: { type: Number, required: true, min: 1 },
    beds: { type: Number, required: true, min: 1 }
  },
  features: {
    wifi: { type: Boolean, default: true },
    airConditioning: { type: Boolean, default: true },
    heating: { type: Boolean, default: true },
    kitchen: { type: Boolean, default: true },
    parking: { type: Boolean, default: false },
    pool: { type: Boolean, default: false },
    gym: { type: Boolean, default: false },
    elevator: { type: Boolean, default: true }
  },
  rules: {
    checkIn: { type: String, default: '15:00' },
    checkOut: { type: String, default: '11:00' },
    smoking: { type: Boolean, default: false },
    pets: { type: Boolean, default: false },
    parties: { type: Boolean, default: false },
    minStay: { type: Number, default: 1 } // días mínimos
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  stats: {
    views: { type: Number, default: 0 },
    bookings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 }
  },
  // Campos para el sistema de bloqueo de propiedades
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockReason: {
    type: String,
    default: null
  },
  blockedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Índices para búsquedas frecuentes
propertySchema.index({ status: 1, isActive: 1 });
propertySchema.index({ 'location.coordinates': '2dsphere' });
propertySchema.index({ 'stats.averageRating': -1 });
propertySchema.index({ createdAt: -1 });
propertySchema.index({ priority: -1 });

// Virtual para reviews
propertySchema.virtual('reviews', {
  ref: 'Review',
  localField: 'id',
  foreignField: 'propertyId'
});

// Método para incrementar views de forma atómica
propertySchema.methods.incrementViews = async function() {
  // Usar findOneAndUpdate para evitar corrupción de datos
  try {
    await mongoose.model('Property').findOneAndUpdate(
      { id: this.id },
      { $inc: { 'stats.views': 1 } },
      { new: true }
    );
    this.stats.views += 1; // Actualizar el objeto en memoria para consistencia
    return this;
  } catch (error) {
    console.error('Error incrementando views:', error);
    return this;
  }
};

// Método para actualizar estadísticas de reviews
propertySchema.methods.updateReviewStats = async function() {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    { $match: { propertyId: this.id, isApproved: true } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    this.stats.totalReviews = stats[0].totalReviews;
    this.stats.averageRating = Math.round(stats[0].averageRating * 10) / 10;
  } else {
    this.stats.totalReviews = 0;
    this.stats.averageRating = 0;
  }

  return this.save();
};

module.exports = mongoose.model('Property', propertySchema);
