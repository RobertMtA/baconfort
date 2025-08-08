const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  // Información de la imagen
  propertyId: {
    type: String,
    required: true,
    index: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  
  // Metadatos
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  altText: {
    type: String,
    default: ''
  },
  
  // Configuración de visualización
  isMain: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Información técnica
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  dimensions: {
    width: Number,
    height: Number
  },
  
  // Metadatos de sistema
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Cambiar a false para permitir pruebas
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
gallerySchema.index({ propertyId: 1, order: 1 });
gallerySchema.index({ propertyId: 1, isActive: 1, order: 1 });
gallerySchema.index({ isMain: 1 });

// Middleware para asegurar que solo haya una imagen principal por propiedad
gallerySchema.pre('save', async function(next) {
  if (this.isMain && this.isModified('isMain')) {
    // Si esta imagen se marca como principal, desmarcar todas las demás de la misma propiedad
    await this.constructor.updateMany(
      { 
        propertyId: this.propertyId, 
        _id: { $ne: this._id },
        isMain: true 
      },
      { $set: { isMain: false } }
    );
  }
  next();
});

// Método estático para obtener imágenes de una propiedad
gallerySchema.statics.getPropertyGallery = function(propertyId, activeOnly = true) {
  const query = { propertyId };
  if (activeOnly) {
    query.isActive = true;
  }
  
  return this.find(query)
    .sort({ order: 1, uploadedAt: 1 })
    .populate('uploadedBy', 'name email');
};

// Método estático para obtener la imagen principal
gallerySchema.statics.getMainImage = function(propertyId) {
  return this.findOne({ 
    propertyId, 
    isMain: true, 
    isActive: true 
  });
};

// Método estático para obtener el siguiente número de orden
gallerySchema.statics.getNextOrder = async function(propertyId) {
  const lastImage = await this.findOne({ propertyId })
    .sort({ order: -1 })
    .select('order');
  
  return lastImage ? lastImage.order + 1 : 0;
};

// Método para generar URL completa
gallerySchema.methods.getFullUrl = function() {
  if (this.url.startsWith('http')) {
    return this.url;
  }
  return `${process.env.BASE_URL || 'http://localhost:5000'}${this.url}`;
};

module.exports = mongoose.model('Gallery', gallerySchema);
