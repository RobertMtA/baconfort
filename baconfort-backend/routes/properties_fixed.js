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

// @route   GET /api/properties/:id
// @desc    Obtener una propiedad por ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    console.log(`🏠 ROUTES: Getting property: ${req.params.id}`);
    
    // Datos de fallback
    const fallbackProperty = {
      id: req.params.id,
      title: `Property Demo ${req.params.id}`,
      description: 'Esta es una propiedad de demostración mientras se resuelven los problemas de conexión a la base de datos.',
      price: 150000,
      location: 'Ubicación Demo',
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      images: ['/images/demo-house.jpg'],
      type: 'house',
      status: 'active',
      isActive: true,
      slug: req.params.id,
      createdAt: new Date(),
      reviews: []
    };
    
    if (!mongoose.connection.readyState) {
      console.log('🏠 ROUTES: Database not connected, using demo property');
      return res.json({
        success: true,
        data: fallbackProperty,
        timestamp: new Date().toISOString(),
        demo: true,
        message: 'Property from demo data (DB disconnected)'
      });
    }
    
    try {
      const property = await withTimeout(
        Property.findOne({ 
          $or: [
            { id: req.params.id },
            { slug: req.params.id },
            { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }
          ],
          isActive: true,
          status: 'active'
        })
        .populate('reviews', null, { isApproved: true })
        .exec(),
        6000,
        null
      );
      
      if (!property) {
        console.log(`🏠 ROUTES: Property not found: ${req.params.id}, using fallback`);
        return res.json({
          success: true,
          data: fallbackProperty,
          timestamp: new Date().toISOString(),
          demo: true,
          message: 'Property from fallback data (not found in DB)'
        });
      }
      
      console.log(`🏠 ROUTES: Found property: ${property.title || property.id}`);
      res.json({
        success: true,
        data: property,
        timestamp: new Date().toISOString(),
        message: 'Property from database'
      });
    } catch (error) {
      console.error('❌ ROUTES: Error getting property:', error.message);
      res.json({
        success: true,
        data: fallbackProperty,
        timestamp: new Date().toISOString(),
        demo: true,
        message: 'Property from fallback data (error occurred)'
      });
    }
  } catch (error) {
    console.error('❌ ROUTES: Error getting property:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// Exportar todas las demás rutas con manejo de errores básico
router.put('/:id', adminAuth, async (req, res) => {
  try {
    console.log(`🏠 ROUTES: Updating property: ${req.params.id}`);
    
    if (!mongoose.connection.readyState) {
      return res.status(503).json({
        success: false,
        error: 'Base de datos no disponible temporalmente',
        demo: true
      });
    }
    
    const property = await withTimeout(
      Property.findByIdAndUpdate(req.params.id, req.body, { 
        new: true, 
        runValidators: true 
      }),
      8000,
      null
    );
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Propiedad no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: property,
      message: 'Propiedad actualizada exitosamente'
    });
  } catch (error) {
    console.error('❌ ROUTES: Error updating property:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

router.post('/', adminAuth, async (req, res) => {
  try {
    console.log('🏠 ROUTES: Creating new property');
    
    if (!mongoose.connection.readyState) {
      return res.status(503).json({
        success: false,
        error: 'Base de datos no disponible temporalmente',
        demo: true
      });
    }
    
    const property = await withTimeout(
      Property.create(req.body),
      8000,
      null
    );
    
    res.status(201).json({
      success: true,
      data: property,
      message: 'Propiedad creada exitosamente'
    });
  } catch (error) {
    console.error('❌ ROUTES: Error creating property:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    console.log(`🏠 ROUTES: Deleting property: ${req.params.id}`);
    
    if (!mongoose.connection.readyState) {
      return res.status(503).json({
        success: false,
        error: 'Base de datos no disponible temporalmente',
        demo: true
      });
    }
    
    const property = await withTimeout(
      Property.findByIdAndDelete(req.params.id),
      8000,
      null
    );
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Propiedad no encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Propiedad eliminada exitosamente'
    });
  } catch (error) {
    console.error('❌ ROUTES: Error deleting property:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

module.exports = router;
