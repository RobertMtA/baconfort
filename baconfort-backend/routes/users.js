const express = require('express');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/users
// @desc    Obtener todos los usuarios
// @access  Admin
router.get('/', adminAuth, async (req, res) => {
  try {
    const { limit = 20, page = 1, role, search } = req.query;
    
    // Construir filtros
    let filters = {};
    if (role && role !== 'all') {
      filters.role = role;
    }
    
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filters)
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filters);

    res.json({
      success: true,
      data: users.map(user => user.toPublic()),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Obtener usuario por ID
// @access  Admin
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: user.toPublic()
    });

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Actualizar usuario
// @access  Admin
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name, email, role, isActive, phone, preferences } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    // No permitir que el admin se desactive a sí mismo
    const userId = req.user._id || req.user.id; // Compatibilidad con diferentes formatos de token
    if (user._id.toString() === userId && isActive === false) {
      return res.status(400).json({
        error: 'No puedes desactivar tu propia cuenta'
      });
    }

    // Actualizar campos
    if (name) user.name = name.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (phone) user.phone = phone;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: user.toPublic()
    });

  } catch (error) {
    console.error('Error actualizando usuario:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'El email ya está en uso por otro usuario'
      });
    }
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Eliminar usuario
// @access  Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que el usuario existe
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    // Prevenir que el admin se elimine a sí mismo
    const userId = req.user._id || req.user.id; // Compatibilidad con diferentes formatos de token
    if (user._id.toString() === userId) {
      return res.status(400).json({
        error: 'No puedes eliminar tu propia cuenta'
      });
    }

    // Prevenir eliminar el admin principal
    if (user.email === 'admin@baconfort.com') {
      return res.status(400).json({
        error: 'No se puede eliminar el administrador principal'
      });
    }

    // Eliminar el usuario completamente de la base de datos
    await User.findByIdAndDelete(id);

    console.log(`🗑️ Usuario eliminado: ${user.email} por admin: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando usuario:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'ID de usuario inválido'
      });
    }
    
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/users/:id/role
// @desc    Cambiar rol de usuario
// @access  Admin
router.put('/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role || !['admin', 'guest'].includes(role)) {
      return res.status(400).json({
        error: 'Rol inválido. Debe ser "admin" o "guest"'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    // No permitir que el admin cambie su propio rol
    const userId = req.user._id || req.user.id; // Compatibilidad con diferentes formatos de token
    if (user._id.toString() === userId) {
      return res.status(400).json({
        error: 'No puedes cambiar tu propio rol'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `Rol cambiado a ${role} exitosamente`,
      data: user.toPublic()
    });

  } catch (error) {
    console.error('Error cambiando rol:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/users/stats/overview
// @desc    Obtener estadísticas de usuarios
// @access  Admin
router.get('/stats/overview', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const guestUsers = await User.countDocuments({ role: 'guest' });
    
    // Usuarios registrados en los últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        adminUsers,
        guestUsers,
        recentUsers
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
