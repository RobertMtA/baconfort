const express = require('express');
const mongoose = require('mongoose');
const Property = require('../models/Property');
const { optionalAuth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// Helper function para manejar timeouts de MongoDB
const withTimeout = async (promise, timeoutMs = 8000, fallback = null) => {
  const timeout = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
  );
  
  try {
    return await Promise.race([promise, timeout]);
  } catch (error) {
    console.warn('⚠️ MongoDB operation failed:', error.message);
    if (fallback !== null) {
      console.log('🔄 Using fallback data');
      return fallback;
    }
    throw error;
  }
};

// @route   GET /api/properties
// @desc    Obtener todas las propiedades activas
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    console.log('🏠 ROUTES: Getting properties...');
    const { limit = 10, page = 1, sort = '-createdAt' } = req.query;
    
    // Datos de fallback en caso de problemas con MongoDB
    const fallbackProperties = [
      {
        id: 'demo-1',
        title: 'Casa Demo Centro',
        description: 'Hermosa casa en el centro de la ciudad',
        price: 150000,
        location: 'Centro',
        bedrooms: 3,
        bathrooms: 2,
        area: 120,
        images: ['/images/demo-house1.jpg'],
        type: 'house',
        status: 'active',
        isActive: true,
        slug: 'casa-demo-centro',
        createdAt: new Date(),
        reviews: []
      },
      {
        id: 'demo-2', 
        title: 'Departamento Moderno',
        description: 'Departamento moderno con vista al mar',
        price: 200000,
        location: 'Zona Norte',
        bedrooms: 2,
        bathrooms: 1,
        area: 80,
        images: ['/images/demo-apt1.jpg'],
        type: 'apartment',
        status: 'active',
        isActive: true,
        slug: 'departamento-moderno',
        createdAt: new Date(),
        reviews: []
      }
    ];
    
    // Verificar estado de la conexión
    if (!mongoose.connection.readyState) {
      console.log('🏠 ROUTES: Database not connected, using demo properties');
      return res.json({
        success: true,
        data: fallbackProperties,
        pagination: {
          currentPage: parseInt(page),
          totalPages: 1,
          total: fallbackProperties.length,
          hasNext: false,
          hasPrev: false
        },
        timestamp: new Date().toISOString(),
        demo: true,
        message: 'Properties from demo data (DB disconnected)'
      });
    }
    
    // Intentar obtener de MongoDB con timeout
    try {
      const properties = await withTimeout(
        Property.find({ 
          isActive: true, 
          status: 'active' 
        })
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('reviews', null, { isApproved: true })
        .exec(),
        6000, // 6 segundos timeout
        fallbackProperties
      );

      let total;
      try {
        total = await withTimeout(
          Property.countDocuments({ 
            isActive: true, 
            status: 'active' 
          }),
          4000,
          fallbackProperties.length
        );
      } catch (countError) {
        console.warn('⚠️ Count operation failed, using fallback');
        total = fallbackProperties.length;
      }
      
      const isDemo = properties === fallbackProperties;
      console.log(`🏠 ROUTES: Found ${properties.length} properties ${isDemo ? '(demo)' : '(real)'}`);

      res.json({
        success: true,
        data: properties,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        },
        timestamp: new Date().toISOString(),
        demo: isDemo,
        message: isDemo ? 'Properties from fallback data (timeout)' : 'Properties from database'
      });
    } catch (error) {
      console.error('❌ ROUTES: Error getting properties:', error.message);
      // En caso de error, devolver datos demo
      res.json({
        success: true,
        data: fallbackProperties,
        pagination: {
          currentPage: parseInt(page),
          totalPages: 1,
          total: fallbackProperties.length,
          hasNext: false,
          hasPrev: false
        },
        timestamp: new Date().toISOString(),
        demo: true,
        message: 'Properties from demo data (error occurred)'
      });
    }
  } catch (error) {
    console.error('❌ ROUTES: Error getting properties:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

    res.json({
      success: true,
      data: properties,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error obteniendo propiedades:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/properties/:id
// @desc    Obtener propiedad por ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    console.log(`🔍 BACKEND: Solicitando propiedad ID: ${req.params.id}`);
    
    const property = await Property.findOne({ 
      id: req.params.id,
      isActive: true 
    }).populate('reviews', null, { isApproved: true });

    if (!property) {
      return res.status(404).json({
        error: 'Propiedad no encontrada'
      });
    }

    // Incrementar views de forma segura
    await property.incrementViews();

    console.log(`✅ BACKEND: Propiedad encontrada:`, {
      id: property.id,
      amenitiesCount: {
        departamento: property.amenities?.departamento?.length || 0,
        servicios: property.amenities?.servicios?.length || 0,
        amenitiesEdificio: property.amenities?.amenitiesEdificio?.length || 0
      }
    });

    // Agregar headers para evitar cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.json({
      success: true,
      data: property
    });

  } catch (error) {
    console.error('Error obteniendo propiedad:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   POST /api/properties
// @desc    Crear nueva propiedad
// @access  Admin
router.post('/', adminAuth, async (req, res) => {
  try {
    const property = new Property(req.body);
    await property.save();

    res.status(201).json({
      success: true,
      message: 'Propiedad creada exitosamente',
      data: property
    });

  } catch (error) {
    console.error('Error creando propiedad:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/properties/:id
// @desc    Actualizar propiedad
// @access  Admin
router.put('/:id', adminAuth, async (req, res) => {
  try {
    console.log(`🔄 PUT /api/properties/${req.params.id} - Body:`, JSON.stringify(req.body, null, 2));
    
    const property = await Property.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!property) {
      console.log(`❌ Property not found: ${req.params.id}`);
      return res.status(404).json({
        error: 'Propiedad no encontrada'
      });
    }

    console.log(`✅ Property updated successfully: ${req.params.id}`);
    res.json({
      success: true,
      message: 'Propiedad actualizada exitosamente',
      data: property
    });

  } catch (error) {
    console.error('❌ Error actualizando propiedad:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   DELETE /api/properties/:id
// @desc    Eliminar propiedad (soft delete)
// @access  Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const property = await Property.findOneAndUpdate(
      { id: req.params.id },
      { isActive: false, status: 'inactive' },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({
        error: 'Propiedad no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Propiedad eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando propiedad:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/properties/:id/prices
// @desc    Actualizar precios de propiedad
// @access  Admin
router.put('/:id/prices', adminAuth, async (req, res) => {
  try {
    const { prices } = req.body;
    
    const property = await Property.findOneAndUpdate(
      { id: req.params.id },
      { prices },
      { new: true, runValidators: true }
    );

    if (!property) {
      return res.status(404).json({
        error: 'Propiedad no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Precios actualizados exitosamente',
      data: property
    });

  } catch (error) {
    console.error('Error actualizando precios:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/properties/admin/all
// @desc    Obtener todas las propiedades (incluye inactivas)
// @access  Admin
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const properties = await Property.find({})
      .sort('-createdAt')
      .populate('reviews');

    res.json({
      success: true,
      data: properties
    });

  } catch (error) {
    console.error('Error obteniendo propiedades admin:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
