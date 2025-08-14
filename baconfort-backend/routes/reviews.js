const express = require('express');
const Review = require('../models/Review');
const Property = require('../models/Property');
const { optionalAuth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/reviews/property/:propertyId
// @desc    Obtener reseñas de una propiedad
// @access  Public
router.get('/property/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { limit = 10, page = 1, sort = '-createdAt' } = req.query;

    const reviews = await Review.find({
      propertyId,
      isApproved: true
    })
    .populate('user', 'name avatar')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Review.countDocuments({
      propertyId,
      isApproved: true
    });

    res.json({
      success: true,
      data: reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error obteniendo reseñas:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   POST /api/reviews
// @desc    Crear nueva reseña
// @access  Public
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { propertyId, guestName, guestEmail, rating, comment, stayDates } = req.body;

    // Validaciones básicas
    if (!propertyId || !guestName || !guestEmail || !rating || !comment) {
      return res.status(400).json({
        error: 'Todos los campos son obligatorios'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        error: 'La calificación debe estar entre 1 y 5'
      });
    }

    // Verificar que la propiedad existe
    const property = await Property.findOne({ id: propertyId });
    if (!property) {
      return res.status(404).json({
        error: 'Propiedad no encontrada'
      });
    }

    // Verificar si ya existe una reseña del mismo usuario para esta propiedad
    if (req.user) {
      const existingReview = await Review.findOne({
        propertyId,
        user: req.user._id
      });

      if (existingReview) {
        return res.status(400).json({
          error: 'Ya has enviado una reseña para esta propiedad'
        });
      }
    }

    // Crear nueva reseña
    const review = new Review({
      propertyId,
      user: req.user ? req.user._id : null,
      guestName: guestName.trim(),
      guestEmail: guestEmail.toLowerCase().trim(),
      rating,
      comment: comment.trim(),
      stayDates,
      language: req.body.language || 'es'
    });

    await review.save();

    res.status(201).json({
      success: true,
      message: 'Reseña enviada exitosamente. Será revisada antes de publicarse.',
      data: review
    });

  } catch (error) {
    console.error('Error creando reseña:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Ya has enviado una reseña para esta propiedad'
      });
    }
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/reviews/admin/pending
// @desc    Obtener reseñas pendientes de moderación
// @access  Admin
router.get('/admin/pending', adminAuth, async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: false })
      .populate('user', 'name email')
      .sort('-createdAt');

    res.json({
      success: true,
      data: reviews
    });

  } catch (error) {
    console.error('Error obteniendo reseñas pendientes:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/reviews/:id/approve
// @desc    Aprobar reseña
// @access  Admin
router.put('/:id/approve', adminAuth, async (req, res) => {
  try {
    const { notes, isHighlight } = req.body;
    
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        error: 'Reseña no encontrada'
      });
    }

    await review.approve(req.user._id, notes);
    
    if (isHighlight) {
      review.isHighlight = true;
      await review.save();
    }

    res.json({
      success: true,
      message: 'Reseña aprobada exitosamente',
      data: review
    });

  } catch (error) {
    console.error('Error aprobando reseña:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/reviews/:id/reject
// @desc    Rechazar reseña
// @access  Admin
router.put('/:id/reject', adminAuth, async (req, res) => {
  try {
    const { notes } = req.body;
    
    if (!notes) {
      return res.status(400).json({
        error: 'Las notas de moderación son obligatorias para rechazar una reseña'
      });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        error: 'Reseña no encontrada'
      });
    }

    await review.reject(req.user._id, notes);

    res.json({
      success: true,
      message: 'Reseña rechazada',
      data: review
    });

  } catch (error) {
    console.error('Error rechazando reseña:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Eliminar reseña
// @access  Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        error: 'Reseña no encontrada'
      });
    }

    // Actualizar estadísticas de la propiedad
    const property = await Property.findOne({ id: review.propertyId });
    if (property) {
      await property.updateReviewStats();
    }

    res.json({
      success: true,
      message: 'Reseña eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando reseña:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/reviews/admin/all
// @desc    Obtener todas las reseñas
// @access  Admin
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('user', 'name email')
      .populate('moderatedBy', 'name')
      .sort('-createdAt');

    res.json({
      success: true,
      data: reviews
    });

  } catch (error) {
    console.error('Error obteniendo todas las reseñas:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/reviews/admin
// @desc    Obtener reseñas para administración con filtros
// @access  Admin
router.get('/admin', adminAuth, async (req, res) => {
  try {
    console.log('🔍 REVIEWS ADMIN: Endpoint alcanzado exitosamente');
    console.log('🔍 REVIEWS ADMIN: Usuario autenticado:', req.user);
    
    const { status = 'all', limit = 20, page = 1, sort = '-createdAt' } = req.query;
    
    let filter = {};
    
    if (status === 'pending') {
      filter.isApproved = false;
      filter.isRejected = { $ne: true };
    } else if (status === 'approved') {
      filter.isApproved = true;
    } else if (status === 'rejected') {
      filter.isRejected = true;
    }
    // Si status === 'all', no agregamos filtros

    const reviews = await Review.find(filter)
      .populate('user', 'name email')
      .populate('moderatedBy', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(filter);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error obteniendo reseñas admin:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   PATCH /api/reviews/:id/moderate
// @desc    Moderar reseña (aprobar/rechazar)
// @access  Admin
router.patch('/:id/moderate', adminAuth, async (req, res) => {
  try {
    const { action, moderatorNotes } = req.body;
    
    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        error: 'Acción debe ser "approve" o "reject"'
      });
    }

    if (action === 'reject' && !moderatorNotes) {
      return res.status(400).json({
        error: 'Las notas de moderación son obligatorias para rechazar una reseña'
      });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        error: 'Reseña no encontrada'
      });
    }

    if (action === 'approve') {
      await review.approve(req.user._id, moderatorNotes);
    } else if (action === 'reject') {
      await review.reject(req.user._id, moderatorNotes);
    }

    // Recargar review con populate
    const updatedReview = await Review.findById(req.params.id)
      .populate('user', 'name email')
      .populate('moderatedBy', 'name');

    res.json({
      success: true,
      message: `Reseña ${action === 'approve' ? 'aprobada' : 'rechazada'} exitosamente`,
      data: updatedReview
    });

  } catch (error) {
    console.error('Error moderando reseña:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   PATCH /api/reviews/:id/highlight
// @desc    Marcar/desmarcar reseña como destacada
// @access  Admin
router.patch('/:id/highlight', adminAuth, async (req, res) => {
  try {
    const { highlight = true } = req.body;
    
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        error: 'Reseña no encontrada'
      });
    }

    review.isHighlight = highlight;
    await review.save();

    // Recargar review con populate
    const updatedReview = await Review.findById(req.params.id)
      .populate('user', 'name email')
      .populate('moderatedBy', 'name');

    res.json({
      success: true,
      message: `Reseña ${highlight ? 'destacada' : 'sin destacar'} exitosamente`,
      data: updatedReview
    });

  } catch (error) {
    console.error('Error cambiando destaque de reseña:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
