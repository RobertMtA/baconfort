const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  propertyId: {
    type: String,
    required: true,
    ref: 'Property'
  },
  propertyName: {
    type: String,
    required: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed', 'special'],
    required: true
  },
  discountValue: {
    type: Number,
    required: function() {
      return this.discountType !== 'special';
    }
  },
  originalPrice: {
    type: Number,
    required: true
  },
  promotionalPrice: {
    type: Number,
    required: true
  },
  validFrom: {
    type: Date,
    required: true
  },
  validTo: {
    type: Date,
    required: true
  },
  durationType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'custom'],
    default: 'monthly'
  },
  durationValue: {
    type: Number,
    default: 1,
    min: 1
  },
  image: {
    type: String,
    default: ''
  },
  terms: {
    type: String,
    default: ''
  },
  priority: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  maxRedemptions: {
    type: Number,
    default: null
  },
  currentRedemptions: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: String,
    default: 'admin'
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento
promotionSchema.index({ propertyId: 1 });
promotionSchema.index({ isActive: 1 });
promotionSchema.index({ isFeatured: 1 });
promotionSchema.index({ validFrom: 1, validTo: 1 });

// Método para verificar si la promoción está vigente
promotionSchema.methods.isValid = function() {
  const now = new Date();
  return this.isActive && 
         this.validFrom <= now && 
         this.validTo >= now &&
         (this.maxRedemptions === null || this.currentRedemptions < this.maxRedemptions);
};

// Método para calcular el descuento
promotionSchema.methods.calculateDiscount = function() {
  if (this.discountType === 'percentage') {
    return Math.round(this.originalPrice * (this.discountValue / 100));
  } else if (this.discountType === 'fixed') {
    return this.discountValue;
  }
  return this.originalPrice - this.promotionalPrice;
};

module.exports = mongoose.model('Promotion', promotionSchema);
