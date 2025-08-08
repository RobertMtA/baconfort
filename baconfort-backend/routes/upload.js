const express = require('express');
const multer = require('multer');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

// Configurar multer para archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 50 // máximo 50 archivos
  },
  fileFilter: (req, file, cb) => {
    // Verificar tipo de archivo
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen y video'), false);
    }
  }
});

// @route   POST /api/upload/images
// @desc    Subir imágenes
// @access  Admin
router.post('/images', adminAuth, upload.array('images', 50), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No se recibieron archivos'
      });
    }

    // En una implementación real, aquí subirías a Cloudinary o S3
    // Por ahora, simulamos la respuesta
    const uploadedFiles = req.files.map((file, index) => ({
      originalName: file.originalname,
      filename: `uploaded_${Date.now()}_${index}.${file.originalname.split('.').pop()}`,
      url: `/uploads/${Date.now()}_${index}.${file.originalname.split('.').pop()}`,
      size: file.size,
      mimeType: file.mimetype
    }));

    res.json({
      success: true,
      message: `${uploadedFiles.length} archivo(s) subido(s) exitosamente`,
      data: uploadedFiles
    });

  } catch (error) {
    console.error('Error subiendo archivos:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   POST /api/upload/video
// @desc    Subir video
// @access  Admin
router.post('/video', adminAuth, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No se recibió archivo de video'
      });
    }

    // En una implementación real, aquí subirías a Cloudinary o S3
    const uploadedFile = {
      originalName: req.file.originalname,
      filename: `video_${Date.now()}.${req.file.originalname.split('.').pop()}`,
      url: `/uploads/video_${Date.now()}.${req.file.originalname.split('.').pop()}`,
      size: req.file.size,
      mimeType: req.file.mimetype
    };

    res.json({
      success: true,
      message: 'Video subido exitosamente',
      data: uploadedFile
    });

  } catch (error) {
    console.error('Error subiendo video:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// Middleware de manejo de errores para multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'El archivo es demasiado grande. Máximo 50MB permitido.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Demasiados archivos. Máximo 50 archivos permitidos.'
      });
    }
  }
  
  res.status(400).json({
    error: error.message || 'Error subiendo archivo'
  });
});

module.exports = router;
