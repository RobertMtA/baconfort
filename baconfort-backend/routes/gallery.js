const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Gallery = require('../models/Gallery');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Configuración de Multer para subir archivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/gallery');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `gallery-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Permitir solo imágenes
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  }
});

// @route   GET /api/gallery/:propertyId
// @desc    Obtener galería de una propiedad
// @access  Public
router.get('/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { includeInactive = false } = req.query;
    
    const images = await Gallery.getPropertyGallery(propertyId, !includeInactive);
    
    res.json({
      success: true,
      images: images.map(img => ({
        id: img._id,
        propertyId: img.propertyId,
        filename: img.filename,
        originalName: img.originalName,
        url: img.getFullUrl(),
        title: img.title,
        description: img.description,
        altText: img.altText,
        isMain: img.isMain,
        order: img.order,
        isActive: img.isActive,
        fileSize: img.fileSize,
        mimeType: img.mimeType,
        dimensions: img.dimensions,
        uploadedAt: img.uploadedAt,
        uploadedBy: img.uploadedBy
      }))
    });
  } catch (error) {
    console.error('Error al obtener galería:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   POST /api/gallery/:propertyId/upload
// @desc    Subir imagen a la galería
// @access  Private (Admin)
router.post('/:propertyId/upload', auth, upload.single('image'), async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { title, description, altText, isMain = false, order = 0 } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        error: 'No se ha proporcionado ningún archivo'
      });
    }

    // Obtener dimensiones de la imagen (requiere sharp o similar para producción)
    const dimensions = { width: 0, height: 0 }; // Placeholder

    const galleryItem = new Gallery({
      propertyId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: `/uploads/gallery/${req.file.filename}`,
      title: title || '',
      description: description || '',
      altText: altText || req.file.originalname,
      isMain: Boolean(isMain),
      order: parseInt(order) || 0,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      dimensions,
      uploadedBy: req.user._id
    });

    await galleryItem.save();

    res.status(201).json({
      success: true,
      message: 'Imagen subida exitosamente',
      image: {
        id: galleryItem._id,
        propertyId: galleryItem.propertyId,
        filename: galleryItem.filename,
        originalName: galleryItem.originalName,
        url: galleryItem.getFullUrl(),
        title: galleryItem.title,
        description: galleryItem.description,
        altText: galleryItem.altText,
        isMain: galleryItem.isMain,
        order: galleryItem.order,
        isActive: galleryItem.isActive,
        uploadedAt: galleryItem.uploadedAt
      }
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   POST /api/gallery/:propertyId/upload-batch
// @desc    Subir múltiples imágenes desde base64
// @access  Private (Admin)
router.post('/:propertyId/upload-batch', auth, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { images } = req.body;
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        error: 'No se han proporcionado imágenes válidas'
      });
    }

    const uploadedImages = [];
    const uploadPath = path.join(__dirname, '../uploads/gallery');
    
    // Asegurar que el directorio existe
    await fs.mkdir(uploadPath, { recursive: true });

    for (let i = 0; i < images.length; i++) {
      const imageData = images[i];
      
      if (!imageData.data || !imageData.name) {
        console.warn(`Imagen ${i} sin datos válidos, saltando...`);
        continue;
      }

      try {
        // Extraer datos base64
        const base64Data = imageData.data.replace(/^data:image\/[a-z]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Generar nombre único
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(imageData.name) || '.jpg';
        const filename = `gallery-${uniqueSuffix}${ext}`;
        const filepath = path.join(uploadPath, filename);
        
        // Guardar archivo
        await fs.writeFile(filepath, buffer);
        
        // Crear entrada en base de datos
        const galleryItem = new Gallery({
          propertyId,
          filename,
          originalName: imageData.name,
          url: `/uploads/gallery/${filename}`,
          title: imageData.title || '',
          description: imageData.description || '',
          altText: imageData.altText || imageData.name,
          isMain: false,
          order: await Gallery.getNextOrder(propertyId),
          fileSize: buffer.length,
          mimeType: 'image/jpeg', // Default para base64
          dimensions: { width: 0, height: 0 }, // Placeholder
          uploadedBy: req.user._id
        });

        await galleryItem.save();
        
        uploadedImages.push({
          id: galleryItem._id,
          propertyId: galleryItem.propertyId,
          filename: galleryItem.filename,
          originalName: galleryItem.originalName,
          url: galleryItem.getFullUrl(),
          title: galleryItem.title,
          description: galleryItem.description,
          altText: galleryItem.altText,
          isMain: galleryItem.isMain,
          order: galleryItem.order,
          isActive: galleryItem.isActive,
          uploadedAt: galleryItem.uploadedAt
        });
        
      } catch (imageError) {
        console.error(`Error procesando imagen ${i}:`, imageError);
        // Continuar con la siguiente imagen en caso de error
      }
    }

    if (uploadedImages.length === 0) {
      return res.status(400).json({
        error: 'No se pudo procesar ninguna imagen'
      });
    }

    res.status(201).json({
      success: true,
      message: `${uploadedImages.length} imagen(es) subida(s) exitosamente`,
      images: uploadedImages
    });
    
  } catch (error) {
    console.error('Error al subir imágenes en lote:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/gallery/:imageId
// @desc    Actualizar información de imagen
// @access  Private (Admin)
router.put('/:imageId', auth, async (req, res) => {
  try {
    const { imageId } = req.params;
    const { title, description, altText, isMain, order, isActive } = req.body;
    
    const image = await Gallery.findById(imageId);
    if (!image) {
      return res.status(404).json({
        error: 'Imagen no encontrada'
      });
    }

    // Actualizar campos
    if (title !== undefined) image.title = title;
    if (description !== undefined) image.description = description;
    if (altText !== undefined) image.altText = altText;
    if (isMain !== undefined) image.isMain = Boolean(isMain);
    if (order !== undefined) image.order = parseInt(order);
    if (isActive !== undefined) image.isActive = Boolean(isActive);

    await image.save();

    res.json({
      success: true,
      message: 'Imagen actualizada exitosamente',
      image: {
        id: image._id,
        propertyId: image.propertyId,
        filename: image.filename,
        originalName: image.originalName,
        url: image.getFullUrl(),
        title: image.title,
        description: image.description,
        altText: image.altText,
        isMain: image.isMain,
        order: image.order,
        isActive: image.isActive,
        uploadedAt: image.uploadedAt
      }
    });
  } catch (error) {
    console.error('Error al actualizar imagen:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   DELETE /api/gallery/:imageId
// @desc    Eliminar imagen de la galería
// @access  Private (Admin)
router.delete('/:imageId', auth, async (req, res) => {
  try {
    const { imageId } = req.params;
    const { permanent = false } = req.query;
    
    const image = await Gallery.findById(imageId);
    if (!image) {
      return res.status(404).json({
        error: 'Imagen no encontrada'
      });
    }

    if (permanent) {
      // Eliminar archivo físico
      const filePath = path.join(__dirname, '../uploads/gallery', image.filename);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.warn('No se pudo eliminar el archivo físico:', err.message);
      }
      
      // Eliminar de la base de datos
      await Gallery.findByIdAndDelete(imageId);
      
      res.json({
        success: true,
        message: 'Imagen eliminada permanentemente'
      });
    } else {
      // Solo marcar como inactiva
      image.isActive = false;
      await image.save();
      
      res.json({
        success: true,
        message: 'Imagen desactivada exitosamente'
      });
    }
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   POST /api/gallery/:propertyId/reorder
// @desc    Reordenar imágenes de la galería
// @access  Private (Admin)
router.post('/:propertyId/reorder', auth, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { imageOrder } = req.body; // Array de { id, order }
    
    if (!Array.isArray(imageOrder)) {
      return res.status(400).json({
        error: 'Se requiere un array de orden de imágenes'
      });
    }

    // Actualizar orden de cada imagen
    const updatePromises = imageOrder.map(({ id, order }) => 
      Gallery.findByIdAndUpdate(id, { order: parseInt(order) })
    );
    
    await Promise.all(updatePromises);
    
    res.json({
      success: true,
      message: 'Orden de imágenes actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al reordenar imágenes:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/gallery/:imageId/cover
// @desc    Establecer imagen como portada de la propiedad
// @access  Private (Admin)
router.put('/:imageId/cover', auth, async (req, res) => {
  try {
    const { imageId } = req.params;
    
    const image = await Gallery.findById(imageId);
    if (!image) {
      return res.status(404).json({
        error: 'Imagen no encontrada'
      });
    }

    // Remover isMain de todas las imágenes de esta propiedad
    await Gallery.updateMany(
      { propertyId: image.propertyId },
      { $set: { isMain: false } }
    );
    
    // Establecer esta imagen como principal
    image.isMain = true;
    await image.save();

    res.json({
      success: true,
      message: 'Imagen establecida como portada exitosamente',
      image: {
        id: image._id,
        propertyId: image.propertyId,
        filename: image.filename,
        originalName: image.originalName,
        url: image.getFullUrl(),
        title: image.title,
        description: image.description,
        altText: image.altText,
        isMain: image.isMain,
        order: image.order,
        isActive: image.isActive,
        uploadedAt: image.uploadedAt
      }
    });
  } catch (error) {
    console.error('Error al establecer imagen como portada:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
