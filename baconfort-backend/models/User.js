const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Formato de email inválido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false // No incluir password en las consultas por defecto
  },
  role: {
    type: String,
    enum: ['guest', 'user', 'admin'],
    default: 'guest'
  },
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        // Si está vacío o no definido, es válido
        if (!v) return true;
        // Acepta formato local argentino o formato internacional
        return /^\d{8,15}$/.test(v) || validator.isMobilePhone(v);
      },
      message: 'Formato de teléfono inválido'
    }
  },
  preferences: {
    language: {
      type: String,
      enum: ['es', 'en', 'pt'],
      default: 'es'
    },
    currency: {
      type: String,
      enum: ['USD', 'ARS', 'EUR'],
      default: 'USD'
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    }
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationCode: String,
  verificationCodeExpires: Date,
  verificationAttempts: {
    type: Number,
    default: 0
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});

// Hash password antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Método para verificar si el usuario es admin
userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

// Método para obtener datos públicos del usuario
userSchema.methods.toPublic = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.verificationToken;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  return userObject;
};

// NOTA: No necesitamos definir un índice explícito aquí
// ya que el campo email ya tiene la propiedad unique:true en su definición de esquema

// Virtual para reviews del usuario
userSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'user'
}, {
  timestamps: true // Esto añade automáticamente createdAt y updatedAt
});

// Asegúrate que updatedAt existe manualmente también
userSchema.add({
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
