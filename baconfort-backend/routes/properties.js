const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Property = require('../models/Property');
const { optionalAuth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/properties');
    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const propertyId = req.params.id || req.body.id || 'temp';
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const ext = path.extname(file.originalname);
    cb(null, `${propertyId}_${timestamp}_${randomId}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
    files: 20 // Máximo 20 archivos
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
    }
  }
});

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
    const { limit = 10, page = 1, sort = '-createdAt', includeBlocked = 'false' } = req.query;
    
    // Array vacío como fallback - solo propiedades reales
    const fallbackProperties = [];
    
    // Verificar estado de la conexión
    if (!mongoose.connection.readyState) {
      console.log('🏠 ROUTES: Database not connected, no properties available');
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
        message: 'No properties available (DB disconnected)'
      });
    }
    
    // Verificar si es un administrador o si se solicita incluir propiedades bloqueadas
    const isAdmin = req.user && req.user.role === 'admin';
    const shouldIncludeBlocked = isAdmin || includeBlocked === 'true';
    
    console.log(`🔒 ROUTES: Listando propiedades - Usuario es admin: ${isAdmin}, includeBlocked: ${includeBlocked}`);
    
    // Construir la consulta base
    const query = { 
      isActive: true, 
      status: 'active'
    };
    
    // Solo filtrar propiedades bloqueadas si no es admin Y no se solicita incluirlas
    if (!shouldIncludeBlocked) {
      query.isBlocked = { $ne: true }; // No mostrar propiedades bloqueadas
      console.log('🔒 ROUTES: Filtrando propiedades bloqueadas');
    } else {
      console.log('🔓 ROUTES: Mostrando todas las propiedades incluyendo bloqueadas');
    }
    
    // Intentar obtener de MongoDB con timeout
    try {
      const properties = await withTimeout(
        Property.find(query)
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
        message: isDemo ? 'No properties available (timeout/error)' : 'Properties from database'
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
        message: 'No properties available (error occurred)'
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
    
    // Sin datos de fallback - solo propiedades reales
    const fallbackProperty = null;
    
    if (!mongoose.connection.readyState) {
      console.log('🏠 ROUTES: Database not connected, property not available');
      return res.status(503).json({
        success: false,
        error: 'Base de datos no disponible temporalmente',
        demo: true,
        message: 'Property not available (DB disconnected)'
      });
    }
    
    try {
      // Verificar si es un administrador
      const isAdmin = req.user && req.user.role === 'admin';
      
      // Si es admin, permitir ver propiedades bloqueadas, si no, filtrarlas
      const query = { 
        $or: [
          { id: req.params.id },
          { slug: req.params.id },
          { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }
        ],
        isActive: true,
        status: 'active'
      };
      
      console.log(`🔒 ROUTES: Verificando propiedad ${req.params.id} - Usuario es admin: ${isAdmin}`);
      
      // Primero verificar si la propiedad existe y está bloqueada
      const propertyCheck = await Property.findOne({
        $or: [
          { id: req.params.id },
          { slug: req.params.id },
          { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }
        ],
        isActive: true,
        status: 'active'
      });
      
      console.log(`🔍 ROUTES: Estado de bloqueo para ${req.params.id}:`, {
        isBlocked: propertyCheck?.isBlocked,
        isAdmin: isAdmin,
        blockReason: propertyCheck?.blockReason,
        id: propertyCheck?.id,
        title: propertyCheck?.title
      });
      
      // Si la propiedad existe y está bloqueada y no es admin, retornar un mensaje específico
      if (propertyCheck && propertyCheck.isBlocked === true && !isAdmin) {
        console.log(`🔒 ROUTES: Propiedad bloqueada: ${req.params.id} - Acceso denegado`);
        return res.status(403).json({
          success: false,
          error: 'Propiedad bloqueada',
          code: 'PROPERTY_BLOCKED',
          message: 'Esta propiedad no está disponible actualmente',
          isBlocked: true,
          propertyId: req.params.id
        });
      }
      
      // Solo agregar la condición de isBlocked si no es admin
      if (!isAdmin) {
        query.isBlocked = { $ne: true }; // No mostrar propiedades bloqueadas
      }
      
      const property = await withTimeout(
        Property.findOne(query)
        .populate('reviews', null, { isApproved: true })
        .exec(),
        6000,
        null
      );
      
      if (!property) {
        console.log(`🏠 ROUTES: Property not found: ${req.params.id}`);
        return res.status(404).json({
          success: false,
          error: 'Propiedad no encontrada',
          message: 'Property not found in database'
        });
      }
      
      console.log(`🏠 ROUTES: Found property: ${property.title || property.id} (blocked: ${property.isBlocked ? 'YES' : 'NO'})`);
      res.json({
        success: true,
        data: property,
        timestamp: new Date().toISOString(),
        message: 'Property from database',
        isAdmin: isAdmin,
        isBlocked: property.isBlocked === true
      });
    } catch (error) {
      console.error('❌ ROUTES: Error getting property:', error.message);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
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

// @route   GET /api/properties/:id/prices
// @desc    Obtener solo los precios de una propiedad
// @access  Public
router.get('/:id/prices', optionalAuth, async (req, res) => {
  try {
    console.log(`💰 ROUTES: Getting prices for property: ${req.params.id}`);
    
    // Precios de fallback
    const fallbackPrices = {
      daily: 50,
      weekly: 300,
      monthly: 1200,
      currency: 'USD'
    };
    
    if (!mongoose.connection.readyState) {
      console.log('💰 ROUTES: Database not connected, prices not available');
      return res.status(503).json({
        success: false,
        error: 'Base de datos no disponible temporalmente',
        demo: true,
        message: 'Prices not available (DB disconnected)'
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
        .select('prices')
        .exec(),
        6000,
        null
      );
      
      if (!property || !property.prices) {
        console.log(`💰 ROUTES: Property prices not found: ${req.params.id}`);
        return res.status(404).json({
          success: false,
          error: 'Precios no encontrados para esta propiedad',
          message: 'Prices not found in database'
        });
      }
      
      console.log(`✅ ROUTES: Found prices for property ${req.params.id}:`, property.prices);
      
      res.json({
        success: true,
        data: { prices: property.prices },
        timestamp: new Date().toISOString(),
        message: 'Prices from database'
      });

    } catch (dbError) {
      console.error('❌ ROUTES: Database error getting prices:', dbError.message);
      
      res.status(500).json({
        success: false,
        error: 'Error al obtener precios de la base de datos',
        message: dbError.message
      });
    }

  } catch (error) {
    console.error('❌ ROUTES: Error getting property prices:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
});

// Exportar todas las demás rutas con manejo de errores básico
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🏠 ROUTES: Updating property: ${id}`);
    console.log('🏠 ROUTES: Update data:', req.body);
    
    // Logging específico para cambios de bloqueo
    if (req.body.hasOwnProperty('isBlocked')) {
      console.log(`🔒 ROUTES: Cambiando estado de bloqueo de ${id}:`);
      console.log(`   - Nuevo estado: ${req.body.isBlocked ? 'BLOQUEADA' : 'DISPONIBLE'}`);
      console.log(`   - Motivo: ${req.body.blockReason || 'Sin motivo'}`);
    }
    
    if (!mongoose.connection.readyState) {
      return res.status(503).json({
        success: false,
        error: 'Base de datos no disponible temporalmente',
        demo: true
      });
    }
    
    // Buscar el estado anterior para comparación
    console.log(`🔍 ROUTES: Buscando propiedad con id: ${id}`);
    const currentProperty = await withTimeout(
      Property.findOne({ id: id }),
      8000,
      null
    );
    
    if (!currentProperty) {
      console.log(`❌ ROUTES: Property not found: ${id}`);
      console.log(`🔍 ROUTES: Intentando buscar todas las propiedades con ID similar...`);
      
      // Buscar propiedades similares para debug
      const allProperties = await withTimeout(
        Property.find({}).select('id title').limit(20),
        5000,
        []
      );
      
      console.log(`🔍 ROUTES: Propiedades encontradas en DB:`, allProperties.map(p => ({ id: p.id, title: p.title })));
      
      // Si los datos incluyen información completa, crear la propiedad
      if (req.body.title && req.body.address) {
        console.log(`🆕 ROUTES: Creando propiedad que no existía: ${id}`);
        console.log(`🆕 ROUTES: Datos para crear:`, req.body);
        
        try {
          // Debug logging para ver qué datos llegan
          console.log(`🔍 ROUTES: Datos recibidos completos:`, JSON.stringify(req.body, null, 2));
          console.log(`🔍 ROUTES: location en req.body:`, req.body.location);
          console.log(`🔍 ROUTES: coordinates en req.body.location:`, req.body.location?.coordinates);
          console.log(`🔍 ROUTES: lat directo:`, req.body.lat);
          console.log(`🔍 ROUTES: lng directo:`, req.body.lng);
          
          // Crear objeto con campos requeridos y valores por defecto
          const propertyData = {
            id: id,
            // Campos básicos
            title: req.body.title,
            address: req.body.address || req.body.location?.address || 'Dirección no especificada',
            description: req.body.description || '',
            // Transformar galleryImages: extraer solo las URLs si son objetos
            galleryImages: Array.isArray(req.body.galleryImages) 
              ? req.body.galleryImages.map(img => {
                  if (typeof img === 'string') {
                    return img; // Ya es una URL
                  } else if (img && img.url) {
                    return img.url; // Extraer URL del objeto
                  }
                  return null; // Filtrar valores inválidos
                }).filter(Boolean)
              : [],
            // coverImage: usar la primera imagen de la galería o una por defecto
            coverImage: req.body.coverImage || 
                       (Array.isArray(req.body.galleryImages) && req.body.galleryImages.length > 0 
                         ? (typeof req.body.galleryImages[0] === 'string' 
                            ? req.body.galleryImages[0] 
                            : req.body.galleryImages[0]?.url || '/placeholder-image.jpg')
                         : '/placeholder-image.jpg'),
            // Asegurar que existan los campos requeridos con valores por defecto
            capacity: {
              guests: req.body.capacity?.guests || parseInt(req.body.maxGuests) || 2,
              bedrooms: req.body.capacity?.bedrooms || parseInt(req.body.bedrooms) || 1,
              bathrooms: req.body.capacity?.bathrooms || parseInt(req.body.bathrooms) || 1,
              beds: req.body.capacity?.beds || parseInt(req.body.beds) || 1,
              ...req.body.capacity
            },
            location: {
              address: req.body.address || req.body.location?.address || 'Dirección no especificada',
              coordinates: {
                lat: req.body.location?.coordinates?.lat != null ? parseFloat(req.body.location.coordinates.lat) : 
                     req.body.lat != null ? parseFloat(req.body.lat) : -34.6037,  // Buenos Aires por defecto
                lng: req.body.location?.coordinates?.lng != null ? parseFloat(req.body.location.coordinates.lng) : 
                     req.body.lng != null ? parseFloat(req.body.lng) : -58.3816
              },
              neighborhood: req.body.location?.neighborhood || 'Sin especificar',
              city: req.body.location?.city || 'Buenos Aires',
              country: req.body.location?.country || 'Argentina'
            },
            prices: {
              daily: parseFloat(req.body.dailyPrice) || parseFloat(req.body.prices?.daily) || 50,
              weekly: parseFloat(req.body.weeklyPrice) || parseFloat(req.body.prices?.weekly) || 300,
              monthly: parseFloat(req.body.monthlyPrice) || parseFloat(req.body.prices?.monthly) || 1200,
              currency: req.body.currency || req.body.prices?.currency || 'USD',
              ...req.body.prices
            },
            // Agregar otros campos del req.body de forma segura
            amenities: req.body.amenities || {},
            isActive: req.body.isActive !== undefined ? req.body.isActive : true,
            status: req.body.status || 'active',
            isBlocked: req.body.isBlocked || false,
            blockReason: req.body.blockReason || '',
            // Campos de timestamp
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          console.log(`🔍 ROUTES: galleryImages originales:`, req.body.galleryImages);
          console.log(`🔍 ROUTES: Tipo de galleryImages:`, typeof req.body.galleryImages);
          console.log(`🔍 ROUTES: Es array:`, Array.isArray(req.body.galleryImages));
          console.log(`🔍 ROUTES: coverImage original:`, req.body.coverImage);
          console.log(`🔍 ROUTES: coverImage calculada:`, propertyData.coverImage);
          
          console.log(`🔍 ROUTES: Coordenadas calculadas:`, propertyData.location.coordinates);
          console.log(`🔍 ROUTES: Lat final: ${propertyData.location.coordinates.lat} (tipo: ${typeof propertyData.location.coordinates.lat})`);
          console.log(`🔍 ROUTES: Lng final: ${propertyData.location.coordinates.lng} (tipo: ${typeof propertyData.location.coordinates.lng})`);
          console.log(`🔍 ROUTES: galleryImages transformadas:`, propertyData.galleryImages);
          console.log(`🆕 ROUTES: Datos completos para crear:`, propertyData);
          
          const newProperty = await withTimeout(
            Property.create(propertyData),
            8000,
            null
          );
          
          console.log(`✅ ROUTES: Propiedad creada exitosamente: ${id}`);
          return res.status(201).json({
            success: true,
            data: newProperty,
            message: 'Propiedad creada exitosamente (era nueva)',
            created: true
          });
        } catch (createError) {
          console.error(`❌ ROUTES: Error creando propiedad: ${createError.message}`);
          console.error(`❌ ROUTES: Error details:`, createError);
          return res.status(500).json({
            success: false,
            error: 'Error al crear la propiedad',
            message: createError.message,
            validationErrors: createError.errors
          });
        }
      }
      
      return res.status(404).json({
        success: false,
        error: 'Propiedad no encontrada',
        debug: {
          searchedId: id,
          availableProperties: allProperties.map(p => ({ id: p.id, title: p.title }))
        }
      });
    }
    
    console.log(`🔍 ROUTES: Estado anterior de ${id}: ${currentProperty.isBlocked ? 'BLOQUEADA' : 'DISPONIBLE'}`);
    
    // Buscar por el campo 'id' personalizado, no por '_id'
    const property = await withTimeout(
      Property.findOneAndUpdate(
        { id: id },
        { 
          ...req.body,
          updatedAt: new Date()
        },
        { 
          new: true, // Retornar el documento actualizado
          runValidators: true // Ejecutar validaciones del esquema
        }
      ),
      8000,
      null
    );
    
    console.log(`✅ ROUTES: Property updated successfully: ${id}`);
    console.log('✅ ROUTES: Updated fields:', Object.keys(req.body));
    
    // Logging específico para confirmación de bloqueo
    if (req.body.hasOwnProperty('isBlocked')) {
      console.log(`🔒 ROUTES: Estado de bloqueo confirmado para ${id}: ${property.isBlocked ? 'BLOQUEADA' : 'DISPONIBLE'}`);
    }
    
    res.json({
      success: true,
      data: property,
      message: 'Propiedad actualizada exitosamente'
    });
  } catch (error) {
    console.error('❌ ROUTES: Error updating property:', error.message);
    console.error('❌ ROUTES: Error stack:', error.stack);
    console.error('❌ ROUTES: Error details:', error);
    console.error('❌ ROUTES: Request ID:', req.params.id);
    console.error('❌ ROUTES: Request body:', JSON.stringify(req.body, null, 2));
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
    
    // Buscar por el campo 'id' personalizado, no por '_id'
    const property = await withTimeout(
      Property.findOneAndDelete({ id: req.params.id }),
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

// @route   POST /api/properties/:id/images
// @desc    Subir múltiples imágenes para una propiedad
// @access  Admin
router.post('/:id/images', adminAuth, upload.array('images', 20), async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;
    
    console.log(`📸 ROUTES: Subiendo ${files.length} imágenes para propiedad: ${id}`);
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se enviaron archivos'
      });
    }

    // Crear URLs de las imágenes subidas
    const imageUrls = files.map((file, index) => {
      const imageUrl = `/uploads/properties/${file.filename}`;
      console.log(`📸 ROUTES: Imagen ${index + 1}: ${imageUrl}`);
      return {
        id: `img_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 6)}`,
        url: imageUrl,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        uploadedAt: new Date()
      };
    });

    // Buscar la propiedad para actualizar sus imágenes
    let property = await Property.findOne({ id: id });
    
    if (!property) {
      console.log(`📸 ROUTES: Propiedad no encontrada, pero imágenes guardadas para: ${id}`);
      // Devolver las URLs aunque la propiedad no exista aún
      return res.json({
        success: true,
        message: 'Imágenes subidas exitosamente (propiedad pendiente de crear)',
        data: {
          images: imageUrls,
          count: imageUrls.length
        }
      });
    }

    // Agregar las nuevas imágenes a la propiedad existente
    const currentImages = property.images || [];
    const updatedImages = [...currentImages, ...imageUrls];
    
    // Limitar a máximo 20 imágenes
    const finalImages = updatedImages.slice(0, 20);
    
    // Actualizar la propiedad
    property = await Property.findOneAndUpdate(
      { id: id },
      { 
        images: finalImages,
        updatedAt: new Date()
      },
      { new: true }
    );

    console.log(`✅ ROUTES: ${files.length} imágenes agregadas exitosamente a ${id}`);
    
    res.json({
      success: true,
      message: `${files.length} imágenes subidas exitosamente`,
      data: {
        images: finalImages,
        count: finalImages.length,
        newImages: imageUrls
      }
    });

  } catch (error) {
    console.error('❌ ROUTES: Error subiendo imágenes:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// @route   DELETE /api/properties/:id/images/:imageId
// @desc    Eliminar una imagen específica
// @access  Admin
router.delete('/:id/images/:imageId', adminAuth, async (req, res) => {
  try {
    const { id, imageId } = req.params;
    
    console.log(`🗑️ ROUTES: Eliminando imagen ${imageId} de propiedad: ${id}`);
    
    const property = await Property.findOne({ id: id });
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Propiedad no encontrada'
      });
    }

    // Filtrar la imagen a eliminar
    const imageToDelete = property.images.find(img => img.id === imageId);
    const updatedImages = property.images.filter(img => img.id !== imageId);
    
    if (imageToDelete) {
      // Eliminar archivo físico
      const imagePath = path.join(__dirname, '../uploads/properties', imageToDelete.filename);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log(`🗑️ ROUTES: Archivo eliminado: ${imageToDelete.filename}`);
      }
    }
    
    // Actualizar la propiedad
    await Property.findOneAndUpdate(
      { id: id },
      { 
        images: updatedImages,
        updatedAt: new Date()
      }
    );

    console.log(`✅ ROUTES: Imagen eliminada exitosamente de ${id}`);
    
    res.json({
      success: true,
      message: 'Imagen eliminada exitosamente',
      data: {
        images: updatedImages,
        count: updatedImages.length
      }
    });

  } catch (error) {
    console.error('❌ ROUTES: Error eliminando imagen:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

module.exports = router;
