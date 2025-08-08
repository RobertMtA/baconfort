import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext-STATEFUL';
import './NewPropertyCreator.css';

const NewPropertyCreator = () => {
  const navigate = useNavigate();
  const { addProperty } = useAdmin();
  
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    id: '',
    dailyPrice: '',
    weeklyPrice: '',
    monthlyPrice: '',
    currency: 'ARS',
    maxGuests: 4,
    rooms: 1,
    bathrooms: 1,
    area: '',
    description: {
      es: '',
      en: '',
      pt: ''
    },
    isNewProperty: true,
    hasStaticPage: false,
    createdAt: new Date().toISOString()
  });

  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const sanitizeId = (str) => {
    return str?.toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateSuggestedPrices = (basePrice, basePeriod) => {
    const price = parseFloat(basePrice);
    if (!price || price <= 0) return {};

    let suggestions = {};
    
    if (basePeriod === 'daily') {
      suggestions = {
        weeklyPrice: Math.round(price * 6.5),
        monthlyPrice: Math.round(price * 25)
      };
    } else if (basePeriod === 'weekly') {
      suggestions = {
        dailyPrice: Math.round(price / 6.5),
        monthlyPrice: Math.round(price * 4.2)
      };
    } else if (basePeriod === 'monthly') {
      suggestions = {
        dailyPrice: Math.round(price / 25),
        weeklyPrice: Math.round(price / 4.2)
      };
    }

    return suggestions;
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (value && parseFloat(value) > 0) {
      const suggestions = calculateSuggestedPrices(value, name.replace('Price', ''));
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        ...Object.keys(suggestions).reduce((acc, key) => {
          if (!prev[key] || prev[key] === '') {
            acc[key] = suggestions[key];
          }
          return acc;
        }, {})
      }));
    }
  };

  const handleDescriptionChange = (lang, value) => {
    setFormData(prev => ({
      ...prev,
      description: {
        ...prev.description,
        [lang]: value
      }
    }));
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage('❌ La imagen de portada no puede ser mayor a 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setMessage('❌ Solo se permiten archivos de imagen');
        return;
      }

      setCoverImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setMessage('');
    }
  };

  const handleGalleryImagesChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 20) {
      setMessage('❌ Máximo 20 imágenes permitidas');
      return;
    }

    const validFiles = [];
    const previews = [];
    
    for (let file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage(`❌ La imagen ${file.name} es muy grande (máximo 5MB)`);
        continue;
      }

      if (!file.type.startsWith('image/')) {
        setMessage(`❌ ${file.name} no es un archivo de imagen válido`);
        continue;
      }

      validFiles.push(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push({
          file: file,
          preview: e.target.result,
          name: file.name
        });
        
        if (previews.length === validFiles.length) {
          setGalleryPreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    }
    
    if (validFiles.length > 0) {
      setGalleryImages(validFiles);
      setMessage(`✅ ${validFiles.length} imagen(es) cargada(s) correctamente`);
    }
  };

  const removeGalleryImage = (index) => {
    const newImages = galleryImages.filter((_, i) => i !== index);
    const newPreviews = galleryPreviews.filter((_, i) => i !== index);
    
    setGalleryImages(newImages);
    setGalleryPreviews(newPreviews);
    
    if (newImages.length === 0) {
      setMessage('');
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleCreateProperty = async () => {
    try {
      setIsCreating(true);
      setMessage('');

      if (!formData.title?.trim()) {
        setMessage('❌ El título es requerido');
        return;
      }

      if (!formData.address?.trim()) {
        setMessage('❌ La dirección es requerida');
        return;
      }

      const hasPrice = formData.dailyPrice || formData.weeklyPrice || formData.monthlyPrice;
      if (!hasPrice) {
        setMessage('❌ Debe especificar al menos un precio (diario, semanal o mensual)');
        return;
      }

      let finalId = formData.id?.trim() || sanitizeId(formData.title);
      if (!finalId) {
        finalId = `new-property-${Date.now()}`;
      }

      const existingProperties = ['moldes-1680', 'santa-fe-3770', 'dorrego-1548', 'convencion-1994', 'ugarteche-2824'];
      if (existingProperties.includes(finalId)) {
        finalId = `${finalId}-new-${Date.now()}`;
      }

      setMessage('Procesando imágenes...');
      
      let coverImageBase64 = '/img/img-default-property.jpg';
      if (coverImage) {
        try {
          coverImageBase64 = await fileToBase64(coverImage);
          console.log('✅ Imagen de portada procesada');
        } catch (error) {
          console.warn('⚠️ Error procesando imagen de portada:', error);
        }
      }

      const galleryImagesBase64 = [];
      if (galleryImages.length > 0) {
        setMessage(`Procesando ${galleryImages.length} imágenes de galería...`);
        
        for (let i = 0; i < galleryImages.length; i++) {
          try {
            const base64 = await fileToBase64(galleryImages[i]);
            galleryImagesBase64.push(base64);
            setMessage(`Procesando imagen ${i + 1} de ${galleryImages.length}...`);
          } catch (error) {
            console.warn(`⚠️ Error procesando imagen ${i + 1}:`, error);
          }
        }
        console.log(`✅ ${galleryImagesBase64.length} imágenes de galería procesadas`);
      }

      const newPropertyData = {
        ...formData,
        id: finalId,
        prices: {
          daily: parseFloat(formData.dailyPrice) || 0,
          weekly: parseFloat(formData.weeklyPrice) || 0,
          monthly: parseFloat(formData.monthlyPrice) || 0,
          currency: formData.currency || 'ARS'
        },
        coverImage: coverImageBase64,
        galleryImages: galleryImagesBase64,
        galleryVideos: [],
        amenities: [],
        rules: [],
        location: {
          neighborhood: '',
          zone: '',
          coordinates: null
        },
        availability: {
          isAvailable: true,
          blockedDates: []
        },
        isNewProperty: true,
        hasStaticPage: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setMessage('Creando nueva propiedad...');
      console.log('🏗️ NewPropertyCreator: Creando nueva propiedad:', newPropertyData);
      
      await addProperty(newPropertyData);
      
      setMessage('✅ Nueva propiedad creada exitosamente');
      console.log('✅ NewPropertyCreator: Propiedad creada exitosamente');
      
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
      
    } catch (error) {
      console.error('❌ Error al crear nueva propiedad:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="new-property-creator">
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="text-primary">
                <i className="fas fa-plus-circle me-2"></i>
                Crear Nueva Propiedad
              </h3>
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/admin')}
                disabled={isCreating}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Volver al Dashboard
              </button>
            </div>

            {message && (
              <div className={`alert ${message.includes('❌') ? 'alert-danger' : 
                                     message.includes('⚠️') ? 'alert-warning' : 'alert-success'} mb-4`}>
                <i className={`fas ${message.includes('❌') ? 'fa-exclamation-circle' : 
                                     message.includes('⚠️') ? 'fa-exclamation-triangle' : 'fa-check-circle'} me-2`}></i>
                {message}
              </div>
            )}

            <div className="alert alert-info mb-4">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Información:</strong> Esta herramienta crea propiedades completamente nuevas e independientes. 
              No afecta las propiedades existentes que tienen páginas estáticas.
            </div>

            <div className="alert alert-info mb-4">
              <div className="d-flex">
                <i className="fas fa-calculator me-3 mt-1"></i>
                <div>
                  <strong>Cálculo Automático de Precios:</strong>
                  <p className="mb-0 mt-2">
                    Al completar un precio, los otros se calculan automáticamente con descuentos:
                  </p>
                  <ul className="mt-2 mb-0">
                    <li><strong>Precio Diario → Semanal:</strong> Se aplica descuento del 7%</li>
                    <li><strong>Precio Diario → Mensual:</strong> Se aplica descuento del 17%</li>
                    <li><strong>Precio Semanal → Mensual:</strong> Se aplica descuento del 16%</li>
                  </ul>
                  <small className="text-muted">
                    <i className="fas fa-info-circle me-1"></i>
                    Los precios sugeridos solo aparecen si los campos están vacíos
                  </small>
                </div>
              </div>
            </div>

            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-form me-2"></i>
                  Formulario de Nueva Propiedad
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-tag me-2 text-primary"></i>
                      Título de la Propiedad *
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Ej: Departamento en Villa Crespo"
                      required
                    />
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-map-marker-alt me-2 text-danger"></i>
                      Dirección Completa *
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Ej: Av. Corrientes 1500"
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-key me-2 text-warning"></i>
                      ID de la Propiedad (opcional)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="id"
                      value={formData.id}
                      onChange={handleInputChange}
                      placeholder="Se generará automáticamente si se deja vacío"
                    />
                    <small className="form-text text-muted">
                      Si no se especifica, se generará automáticamente basado en el título
                    </small>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-calendar-day me-2 text-success"></i>
                      Precio por Día
                    </label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control"
                        name="dailyPrice"
                        value={formData.dailyPrice}
                        onChange={handlePriceChange}
                        placeholder="Ej: 150"
                        min="0"
                      />
                      <span className="input-group-text">
                        {formData.currency === 'USD' ? 'USD' : 'ARS'}
                      </span>
                    </div>
                    <small className="form-text text-muted">
                      Precio por noche
                    </small>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-calendar-week me-2 text-warning"></i>
                      Precio por Semana
                    </label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control"
                        name="weeklyPrice"
                        value={formData.weeklyPrice}
                        onChange={handlePriceChange}
                        placeholder="Ej: 900"
                        min="0"
                      />
                      <span className="input-group-text">
                        {formData.currency === 'USD' ? 'USD' : 'ARS'}
                      </span>
                    </div>
                    <small className="form-text text-muted">
                      Precio por 7 días
                    </small>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-calendar me-2 text-info"></i>
                      Precio por Mes
                    </label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control"
                        name="monthlyPrice"
                        value={formData.monthlyPrice}
                        onChange={handlePriceChange}
                        placeholder="Ej: 3000"
                        min="0"
                      />
                      <span className="input-group-text">
                        {formData.currency === 'USD' ? 'USD' : 'ARS'}
                      </span>
                    </div>
                    <small className="form-text text-muted">
                      Precio por 30 días
                    </small>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-money-bill-wave me-2 text-primary"></i>
                      Moneda
                    </label>
                    <select
                      className="form-select"
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                    >
                      <option value="ARS">Pesos Argentinos (ARS)</option>
                      <option value="USD">Dólares Americanos (USD)</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-3 d-flex align-items-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        dailyPrice: '',
                        weeklyPrice: '',
                        monthlyPrice: ''
                      }))}
                    >
                      <i className="fas fa-eraser me-2"></i>
                      Limpiar Precios
                    </button>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-users me-2 text-info"></i>
                      Huéspedes
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="maxGuests"
                      value={formData.maxGuests}
                      onChange={handleInputChange}
                      min="1"
                      max="20"
                    />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-bed me-2 text-secondary"></i>
                      Habitaciones
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="rooms"
                      value={formData.rooms}
                      onChange={handleInputChange}
                      min="1"
                      max="10"
                    />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-bath me-2 text-primary"></i>
                      Baños
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleInputChange}
                      min="1"
                      max="5"
                    />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-expand me-2 text-success"></i>
                      Área (m²)
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      placeholder="Ej: 55"
                      min="0"
                    />
                  </div>

                  <div className="col-12 mb-4">
                    <label className="form-label fw-bold">
                      <i className="fas fa-align-left me-2 text-dark"></i>
                      Descripción (Opcional)
                    </label>
                    <div className="row">
                      <div className="col-md-4">
                        <label className="form-label text-muted">
                          <i className="fas fa-flag me-1"></i>
                          Español
                        </label>
                        <textarea
                          className="form-control"
                          rows="4"
                          value={formData.description.es}
                          onChange={(e) => handleDescriptionChange('es', e.target.value)}
                          placeholder="Descripción en español..."
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-muted">
                          <i className="fas fa-flag me-1"></i>
                          English
                        </label>
                        <textarea
                          className="form-control"
                          rows="4"
                          value={formData.description.en}
                          onChange={(e) => handleDescriptionChange('en', e.target.value)}
                          placeholder="Description in English..."
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-muted">
                          <i className="fas fa-flag me-1"></i>
                          Português
                        </label>
                        <textarea
                          className="form-control"
                          rows="4"
                          value={formData.description.pt}
                          onChange={(e) => handleDescriptionChange('pt', e.target.value)}
                          placeholder="Descrição em português..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card shadow mt-4">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">
                  <i className="fas fa-images me-2"></i>
                  Imágenes de la Propiedad
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <label className="form-label fw-bold">
                      <i className="fas fa-image me-2 text-primary"></i>
                      Imagen de Portada
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                    />
                    <small className="form-text text-muted">
                      Imagen principal que aparecerá en la portada. Máximo 5MB.
                    </small>
                    
                    {coverImagePreview && (
                      <div className="mt-3">
                        <div className="position-relative d-inline-block">
                          <img
                            src={coverImagePreview}
                            alt="Vista previa de portada"
                            className="img-thumbnail"
                            style={{ maxWidth: '200px', maxHeight: '150px' }}
                          />
                          <button
                            type="button"
                            className="btn btn-danger btn-sm position-absolute top-0 end-0"
                            onClick={() => {
                              setCoverImage(null);
                              setCoverImagePreview('');
                            }}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="col-md-6 mb-4">
                    <label className="form-label fw-bold">
                      <i className="fas fa-images me-2 text-warning"></i>
                      Galería de Imágenes (Máximo 20)
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryImagesChange}
                    />
                    <small className="form-text text-muted">
                      Selecciona hasta 20 imágenes para la galería. Máximo 5MB cada una.
                    </small>
                    
                    {galleryImages.length > 0 && (
                      <div className="mt-2">
                        <span className="badge bg-info">
                          {galleryImages.length} de 20 imágenes seleccionadas
                        </span>
                      </div>
                    )}
                  </div>

                  {galleryPreviews.length > 0 && (
                    <div className="col-12">
                      <h6 className="text-muted mb-3">
                        <i className="fas fa-eye me-2"></i>
                        Vista Previa de la Galería
                      </h6>
                      <div className="row">
                        {galleryPreviews.map((item, index) => (
                          <div key={index} className="col-md-3 col-sm-4 col-6 mb-3">
                            <div className="position-relative">
                              <img
                                src={item.preview}
                                alt={`Preview ${index + 1}`}
                                className="img-thumbnail w-100"
                                style={{ height: '120px', objectFit: 'cover' }}
                              />
                              <button
                                type="button"
                                className="btn btn-danger btn-sm position-absolute top-0 end-0"
                                onClick={() => removeGalleryImage(index)}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                              <div className="position-absolute bottom-0 start-0 w-100 bg-dark bg-opacity-75 text-white p-1">
                                <small className="text-truncate d-block">
                                  {item.name}
                                </small>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-3 mt-4">
              <button 
                className="btn btn-secondary btn-lg"
                onClick={() => navigate('/admin')}
                disabled={isCreating}
              >
                <i className="fas fa-times me-2"></i>
                Cancelar
              </button>
              <button 
                className="btn btn-primary btn-lg px-4"
                onClick={handleCreateProperty}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus-circle me-2"></i>
                    Crear Nueva Propiedad
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPropertyCreator;
