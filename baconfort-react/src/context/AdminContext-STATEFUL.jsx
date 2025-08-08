import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { propertyAPI } from '../services/api';
import { cleanupDemoImages } from '../utils/ImageCleanup';

// Utilidad para gestionar localStorage con protección contra quota exceeded
const LocalStorageManager = {
  // Verificar el tamaño actual de localStorage
  getStorageSize() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  },

  // Limpiar localStorage manteniendo solo lo esencial
  cleanStorage() {
    try {
      const currentProperties = JSON.parse(localStorage.getItem('baconfort_admin_properties') || '{}');
      
      // Mantener solo propiedades recientes (últimas 3)
      const propertyEntries = Object.entries(currentProperties);
      const recentProperties = propertyEntries
        .sort((a, b) => new Date(b[1].updatedAt || 0) - new Date(a[1].updatedAt || 0))
        .slice(0, 3);
      
      const cleanedStorage = Object.fromEntries(recentProperties);
      localStorage.setItem('baconfort_admin_properties', JSON.stringify(cleanedStorage));
      
      console.log('🧹 LocalStorageManager: Limpieza completada, propiedades mantenidas:', Object.keys(cleanedStorage));
      return cleanedStorage;
    } catch (error) {
      console.error('❌ LocalStorageManager: Error en limpieza:', error);
      return {};
    }
  },

  // Guardar con protección contra quota exceeded
  safeSetItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.warn('⚠️ LocalStorageManager: Quota excedida, limpiando storage...');
        this.cleanStorage();
        
        // Intentar guardar de nuevo después de limpiar
        try {
          localStorage.setItem(key, value);
          console.log('✅ LocalStorageManager: Guardado exitoso después de limpieza');
          return true;
        } catch (retryError) {
          console.error('❌ LocalStorageManager: Error persistente después de limpieza:', retryError);
          return false;
        }
      } else {
        console.error('❌ LocalStorageManager: Error desconocido:', error);
        return false;
      }
    }
  }
};

const AdminContext = createContext();

// AdminProvider con estado actualizable
export const AdminProvider = ({ children }) => {
  // Estado inicial con datos de propiedades
  const [properties, setProperties] = useState({
    'moldes-1680': {
      id: 'moldes-1680',
      title: 'Moldes 1680',
      name: 'Moldes 1680',
      address: 'Moldes 1680, CABA',
      pricing: { daily: 65, weekly: 350, monthly: 1000, currency: 'USD' },
      description: {
        es: '',
        en: '',
        pt: ''
      },
      coverImage: '/img/img-portada-moldes-1680.jpg',
      galleryImages: [],
      galleryVideos: [],
      isBlocked: false,
      amenities: {
        departamento: [
          { icon: 'fas fa-tv', text: 'Smart TV 55"' },
          { icon: 'fas fa-wifi', text: 'WiFi 500MB Fibra Óptica' },
          { icon: 'fas fa-snowflake', text: 'Aire Acondicionado F/C' }
        ],
        servicios: [
          { icon: 'fas fa-shield-alt', text: 'Seguridad 24hs' },
          { icon: 'fas fa-tshirt', text: 'Lavarropas' }
        ]
      }
    },
    'santa-fe-3770': {
      id: 'santa-fe-3770', 
      title: 'Santa Fe 3770',
      name: 'Santa Fe 3770',
      address: 'Santa Fe 3770, CABA',
      prices: { daily: 75, weekly: 420, monthly: 1000, currency: 'USD' },
      description: {
        es: '',
        en: '',
        pt: ''
      },
      coverImage: '/img/img-portada-santa-fe-3770.jpg',
      galleryImages: [],
      galleryVideos: [],
      isBlocked: false,
      amenities: {
        departamento: [
          { icon: 'fas fa-tv', text: 'Smart TV 65"' },
          { icon: 'fas fa-wifi', text: 'WiFi Fibra Óptica' },
          { icon: 'fas fa-snowflake', text: 'Aire Acondicionado' }
        ]
      }
    },
    'dorrego-1548': {
      id: 'dorrego-1548',
      title: 'Dorrego 1548',
      name: 'Dorrego 1548', 
      address: 'Dorrego 1548, CABA',
      prices: { daily: 70, weekly: 320, monthly: 1200, currency: 'USD' },
      description: {
        es: '',
        en: '',
        pt: ''
      },
      coverImage: '/img/img-portada-dorrego-1548.jpg',
      galleryImages: [],
      galleryVideos: [],
      isBlocked: false,
      amenities: {
        departamento: [
          { icon: 'fas fa-tv', text: 'Smart TV' },
          { icon: 'fas fa-wifi', text: 'WiFi' }
        ]
      }
    },
    'convencion-1994': {
      id: 'convencion-1994',
      title: 'Convención 1994',
      name: 'Convención 1994',
      address: 'Convención 1994, CABA',
      prices: { daily: 90, weekly: 380, monthly: 1200, currency: 'USD' },
      description: {
        es: '',
        en: '',
        pt: ''
      },
      coverImage: '/img/img-portada-convencion-1994.jpg',
      galleryImages: [],
      galleryVideos: [],
      isBlocked: false,
      amenities: {
        departamento: [
          { icon: 'fas fa-tv', text: 'Smart TV' },
          { icon: 'fas fa-wifi', text: 'WiFi' }
        ]
      }
    },
    'ugarteche-2824': {
      id: 'ugarteche-2824',
      title: 'Ugarteche 2824',
      name: 'Ugarteche 2824',
      address: 'Ugarteche 2824, CABA',
      prices: { daily: 95, weekly: 400, monthly: 750, currency: 'USD' },
      description: {
        es: '',
        en: '',
        pt: ''
      },
      coverImage: '/img/img-portada-ugarteche-2824.jpg',
      galleryImages: [],
      galleryVideos: [],
      isBlocked: false,
      amenities: {
        departamento: [
          { icon: 'fas fa-tv', text: 'Smart TV' },
          { icon: 'fas fa-wifi', text: 'WiFi Premium' }
        ]
      }
    }
  });
  
  // Estado para forzar re-renders cuando cambien las propiedades
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [isInitialized, setIsInitialized] = useState(false);

  // Referencia para evitar problemas de inicialización con syncFromLocalStorage
  const syncFromLocalStorageRef = useRef(null);

  // Función para limpiar propiedades de test/debug
  const cleanupTestProperties = useCallback(() => {
    setProperties(prevProperties => {
      const cleanedProperties = Object.fromEntries(
        Object.entries(prevProperties).filter(([id, prop]) => 
          !id.includes('test-') && 
          !id.includes('debug-') && 
          !id.includes('temp-') &&
          !prop.title?.toLowerCase().includes('test') &&
          !prop.title?.toLowerCase().includes('debug')
        )
      );
      
      const removedCount = Object.keys(prevProperties).length - Object.keys(cleanedProperties).length;
      if (removedCount > 0) {
        console.log(`🧹 AdminProvider: Limpiadas ${removedCount} propiedades de test/debug`);
      }
      
      return cleanedProperties;
    });
  }, []); // Sin dependencias

  // Función para debuggear propiedades almacenadas
  const debugStoredProperties = useCallback(() => {
    console.log('🔍 DEBUG: Propiedades en memoria:', properties);
    console.log('🔍 DEBUG: IDs de propiedades en memoria:', Object.keys(properties));
    
    // Mostrar cada propiedad y su ID específico
    Object.entries(properties).forEach(([key, prop]) => {
      console.log(`🔍 DEBUG: Propiedad key="${key}" -> id="${prop.id}" title="${prop.title}"`);
    });
    
    // También verificar localStorage
    try {
      const stored = localStorage.getItem('baconfort_admin_properties');
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('🔍 DEBUG: Propiedades en localStorage:', parsed);
        console.log('🔍 DEBUG: IDs en localStorage:', Object.keys(parsed));
        
        Object.entries(parsed).forEach(([key, prop]) => {
          console.log(`🔍 DEBUG: localStorage key="${key}" -> id="${prop.id}" title="${prop.title}"`);
        });
      } else {
        console.log('🔍 DEBUG: No hay propiedades en localStorage');
      }
    } catch (error) {
      console.log('🔍 DEBUG: Error leyendo localStorage:', error);
    }
  }, [properties]);

  // Función para debuggear localStorage específicamente
  const debugLocalStorage = useCallback(() => {
    console.log('🔍 DEBUG LOCALSTORAGE:');
    
    // Mostrar todas las claves de localStorage
    const allKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      allKeys.push(localStorage.key(i));
    }
    console.log('🔍 Todas las claves localStorage:', allKeys);
    
    // Verificar específicamente baconfort_admin_properties
    const savedProperties = localStorage.getItem('baconfort_admin_properties');
    console.log('🔍 baconfort_admin_properties existe:', !!savedProperties);
    console.log('🔍 baconfort_admin_properties contenido:', savedProperties);
    
    if (savedProperties) {
      try {
        const parsed = JSON.parse(savedProperties);
        console.log('🔍 Propiedades parseadas:', Object.keys(parsed));
        Object.entries(parsed).forEach(([key, prop]) => {
          console.log(`🔍   ${key}: ${prop.title} (localOnly: ${!!prop._localOnly})`);
        });
      } catch (e) {
        console.error('🔍 Error parseando localStorage:', e);
      }
    }
  }, []);

  // Función para sanitizar IDs (igual que en PropertyEditor)
  const sanitizeId = useCallback((id) => {
    if (!id) return '';
    return id
      .toLowerCase()
      .trim()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[ç]/g, 'c')
      .replace(/\s+/g, '-')        // Espacios a guiones
      .replace(/[^a-z0-9-]/g, '')  // Solo letras, números y guiones
      .replace(/-+/g, '-')         // Múltiples guiones a uno solo
      .replace(/^-|-$/g, '');      // Remover guiones al inicio/final
  }, []);

  // Función para limpiar URLs blob expiradas
  const cleanExpiredBlobUrls = useCallback((property) => {
    if (!property) return property;

    // Verificar si ya se ha procesado esta propiedad para evitar bucles
    if (property._blobCleaned) {
      return property;
    }

    // Crear una copia profunda de la propiedad
    const cleanedProperty = JSON.parse(JSON.stringify(property));
    let hasChanges = false;

    // Limpiar videos de galería con URLs blob expiradas
    if (cleanedProperty.galleryVideos && Array.isArray(cleanedProperty.galleryVideos)) {
      cleanedProperty.galleryVideos = cleanedProperty.galleryVideos.map(video => {
        if (video && video.url && video.url.startsWith('blob:')) {
          // Solo limpiar si no se ha marcado como ya procesado
          if (!video._blobProcessed) {
            console.log('🧹 Detectada URL blob en video:', video.name, video.url);
            
            hasChanges = true;
            return {
              ...video,
              url: '[BLOB_URL_EXPIRED]',
              originalBlobUrl: video.url,
              needsReupload: true,
              _blobProcessed: true
            };
          }
        }
        return video;
      });
    }

    // Limpiar imágenes de galería con URLs blob expiradas
    if (cleanedProperty.galleryImages && Array.isArray(cleanedProperty.galleryImages)) {
      cleanedProperty.galleryImages = cleanedProperty.galleryImages.map(image => {
        if (image && typeof image === 'object' && image.url && image.url.startsWith('blob:')) {
          if (!image._blobProcessed) {
            console.log('🧹 Detectada URL blob en imagen de galería');
            hasChanges = true;
            return {
              ...image,
              url: '[BLOB_URL_EXPIRED]',
              originalBlobUrl: image.url,
              needsReupload: true,
              _blobProcessed: true
            };
          }
        }
        return image;
      });
    }

    if (hasChanges) {
      console.log('🧹 URLs blob expiradas detectadas y limpiadas en propiedad:', property.id);
      cleanedProperty._blobCleaned = true;
      return cleanedProperty;
    }

    // Marcar como procesado aunque no haya cambios para evitar verificaciones futuras
    cleanedProperty._blobCleaned = true;
    return cleanedProperty;
  }, []);

  // Función para obtener una propiedad específica (SIN limpieza automática)
  const getProperty = useCallback((propertyId) => {
    console.log(`🎯 ADMIN CONTEXT - getProperty llamado para: ${propertyId}`);
    console.log(`🎯 ADMIN CONTEXT - Estado actual:`, {
      isInitialized: isInitialized,
      totalProperties: Object.keys(properties).length,
      availableIds: Object.keys(properties)
    });
    
    // Si propertyId es null o undefined, retornar null inmediatamente (sin logs excesivos)
    if (!propertyId) {
      console.log(`🎯 ADMIN CONTEXT - propertyId is null/undefined`);
      return null;
    }
    
    // 1. Buscar directamente con el ID proporcionado
    let foundProperty = properties[propertyId] || null;
    
    console.log(`🎯 ADMIN CONTEXT - Búsqueda directa para '${propertyId}':`, {
      found: !!foundProperty,
      propertyTitle: foundProperty?.title,
      propertiesKeys: Object.keys(properties)
    });
    
    if (foundProperty) {
      console.log(`✅ ADMIN CONTEXT - Propiedad encontrada directamente: ${foundProperty.title}`);
      return foundProperty;
    }
    
    // 2. Si no se encuentra, intentar buscar por todas las claves disponibles
    const searchIds = [
      propertyId,
      sanitizeId(propertyId), // ID sanitizado
      propertyId.replace(/\s+/g, '-').toLowerCase(), // Simple reemplazo de espacios
      propertyId.toLowerCase(), // Solo minúsculas
      propertyId.replace(/\s+/g, ''), // Sin espacios
    ];
    
    console.log('🔍 AdminProvider: intentando búsqueda con variaciones:', searchIds);
    
    for (const searchId of searchIds) {
      foundProperty = properties[searchId];
      if (foundProperty) {
        console.log('✅ AdminProvider: Propiedad encontrada con variación:', searchId, '→', foundProperty.title);
        return foundProperty;
      }
    }
    
    // 3. Búsqueda inversa: buscar propiedades cuyo ID sanitizado coincida
    for (const [key, prop] of Object.entries(properties)) {
      const sanitizedKey = sanitizeId(key);
      const sanitizedPropId = sanitizeId(prop.id || key);
      const sanitizedSearchId = sanitizeId(propertyId);
      
      if (sanitizedKey === sanitizedSearchId || sanitizedPropId === sanitizedSearchId) {
        console.log('✅ AdminProvider: Propiedad encontrada por sanitización:', key, '→', prop.title);
        return prop;
      }
    }
    
    console.log('❌ AdminProvider: Propiedad NO encontrada:', propertyId);
    
    // 4. NUEVA ESTRATEGIA: Verificar en localStorage directamente antes de retornar null
    try {
      const savedProperties = localStorage.getItem('baconfort_admin_properties');
      if (savedProperties) {
        const localProperties = JSON.parse(savedProperties);
        
        // Buscar la propiedad en localStorage con todas las variaciones
        for (const searchId of searchIds) {
          if (localProperties[searchId]) {
            console.log('🔍 AdminProvider: Propiedad encontrada en localStorage, programando sincronización inmediata...');
            
            // Sincronizar inmediatamente si está disponible
            if (typeof syncFromLocalStorageRef.current === 'function') {
              setTimeout(() => {
                console.log('🔄 AdminProvider: Ejecutando sincronización asíncrona...');
                const syncResult = syncFromLocalStorageRef.current();
                
                if (syncResult) {
                  console.log('✅ AdminProvider: Sincronización completada, forzando re-render...');
                  // Disparar evento para notificar que se sincronizó
                  const syncEvent = new CustomEvent('baconfort-property-synced', {
                    detail: { propertyId, timestamp: Date.now() }
                  });
                  window.dispatchEvent(syncEvent);
                }
              }, 0);
            }
            
            // Retornar la propiedad de localStorage temporalmente
            const tempProperty = localProperties[searchId];
            
            // Restaurar imágenes si tiene el flag _hasImages
            if (tempProperty._hasImages) {
              if (tempProperty._hasImages.coverImage) {
                tempProperty.coverImage = '/img/img-portada-moldes-1680.jpg';
              }
              if (tempProperty._hasImages.galleryCount > 0) {
                const existingImages = [
                  '/img/img-portada-moldes-1680.jpg',
                  '/img/img-portada-santa-fe-3770.jpg',
                  '/img/img-portada-dorrego-1548.jpg',
                  '/img/img-portada-convencion-1994.jpg'
                ];
                const galleryImages = [];
                for (let i = 0; i < tempProperty._hasImages.galleryCount; i++) {
                  galleryImages.push(existingImages[i % existingImages.length]);
                }
                tempProperty.galleryImages = galleryImages;
              }
            }
            
            console.log('🔄 AdminProvider: Retornando propiedad temporal desde localStorage:', searchId);
            return tempProperty;
          }
        }
      }
    } catch (error) {
      console.error('❌ AdminProvider: Error verificando localStorage:', error);
    }
    
    // 5. Si no está ni en memoria ni en localStorage, programar sincronización general
    console.log('🔄 AdminProvider: Programando sincronización desde localStorage...');
    
    // Verificar si syncFromLocalStorage está disponible para evitar error de inicialización
    if (typeof syncFromLocalStorageRef.current === 'function') {
      // Ejecutar la sincronización de manera asíncrona para evitar setState durante render
      setTimeout(() => {
        console.log('🔄 AdminProvider: Ejecutando sincronización asíncrona...');
        const syncResult = syncFromLocalStorageRef.current();
        
        if (syncResult) {
          console.log('✅ AdminProvider: Sincronización completada, forzando re-render...');
          // Disparar evento para notificar que se sincronizó
          const syncEvent = new CustomEvent('baconfort-property-synced', {
            detail: { propertyId, timestamp: Date.now() }
          });
          window.dispatchEvent(syncEvent);
        }
      }, 0);
    } else {
      console.log('⚠️ AdminProvider: syncFromLocalStorage no disponible aún');
    }
    
    return null;
  }, [properties, sanitizeId]);

  // Función separada para obtener propiedad con limpieza de URLs blob (solo cuando sea necesario)
  const getPropertyWithCleanup = useCallback((propertyId) => {
    const property = getProperty(propertyId);
    if (!property) return null;
    
    return cleanExpiredBlobUrls(property);
  }, [getProperty, cleanExpiredBlobUrls]);

  // Función para obtener todas las propiedades
  const getAllProperties = useCallback(() => {
    return properties;
  }, [properties]);

  // Función para actualizar una propiedad (REAL - con persistencia en backend)
  const updateProperty = useCallback(async (id, data) => {
    console.log('🏠 AdminProvider: updateProperty REAL con backend', id, data);
    
    try {
      // Lista de propiedades principales que nunca deben marcarse como _localOnly
      const coreProperties = [
        'moldes-1680',
        'dorrego-1548', 
        'convencion-1994',
        'ugarteche-2824',
        'santa-fe-3770'
      ];
      
      // 1. Verificar si la propiedad tiene flag _localOnly (solo existe localmente)
      const currentProperty = properties[id];
      const isLocalOnly = currentProperty?._localOnly === true;
      const isCoreProperty = coreProperties.includes(id);
      
      console.log('🔍 AdminProvider: Verificando propiedad:', {
        id,
        exists: !!currentProperty,
        isLocalOnly,
        isCoreProperty,
        title: currentProperty?.title
      });
      
      let backendResult = null;
      
      if (isLocalOnly) {
        // Si es solo local, intentar crearla en el backend
        console.log('🔄 AdminProvider: Propiedad es solo local, intentando crear en backend...');
        try {
          const propertyData = {
            ...currentProperty,
            ...data,
            id: id,
            updatedAt: new Date().toISOString()
          };
          // Remover el flag _localOnly antes de enviar al backend
          delete propertyData._localOnly;
          
          backendResult = await propertyAPI.createProperty(propertyData);
          console.log('✅ AdminProvider: Propiedad creada exitosamente en backend:', backendResult);
        } catch (createError) {
          console.warn('⚠️ AdminProvider: Error creando en backend, manteniendo como local:', createError);
          // Mantener como local si falla la creación
        }
      } else {
        // Si ya existe en backend, intentar actualizar
        console.log('🔄 AdminProvider: Actualizando propiedad existente en backend...');
        
        // Verificar si es una propiedad local que no debe ir al backend
        if (id.includes('test-') || id.includes('debug-') || id.includes('tucuman-766') || data._localOnly) {
          console.log('🏠 AdminProvider: Propiedad local detectada - GUARDADO REAL LOCAL:', id);
          backendResult = null; // No enviar al backend, pero es el guardado REAL para esta propiedad
        } else {
          try {
            backendResult = await propertyAPI.updateProperty(id, data);
            console.log('✅ AdminProvider: Propiedad actualizada en backend:', backendResult);
          } catch (backendError) {
            console.warn('⚠️ AdminProvider: Error actualizando en backend, continuando como local:', backendError.message);
            backendResult = null; // Falló el backend, continuar como local
          }
        }
      }
      
      // 2. Actualizar el estado local
      setProperties(prevProperties => {
        const newProperties = {
          ...prevProperties,
          [id]: {
            ...prevProperties[id],
            ...data,
            updatedAt: new Date().toISOString(),
            // Solo marcar como _localOnly si:
            // 1. Es una propiedad nueva que falló en crear, Y
            // 2. NO es una propiedad principal del sistema
            ...(isLocalOnly && !backendResult && !isCoreProperty ? { _localOnly: true } : 
                backendResult ? { _localOnly: undefined } : 
                isCoreProperty ? { _localOnly: undefined } : {})
          }
        };
        
        // Limpiar undefined values y asegurar que las propiedades core nunca tengan _localOnly
        if (newProperties[id]._localOnly === undefined || isCoreProperty) {
          delete newProperties[id]._localOnly;
        }
        
        // Guardar en localStorage con optimización
        try {
          // Optimizar la propiedad antes de guardar
          const optimizedProperties = {};
          
          Object.entries(newProperties).forEach(([key, prop]) => {
            optimizedProperties[key] = {
              ...prop,
              // Optimizar coverImage si es muy grande
              coverImage: prop.coverImage?.length > 1000 ? '[COVER_IMAGE_FALLBACK]' : prop.coverImage,
              // Optimizar galleryImages
              galleryImages: prop.galleryImages?.map(img => 
                img?.length > 1000 ? '[GALLERY_IMAGE_FALLBACK]' : img
              ) || [],
              // Optimizar galleryVideos para localStorage
              galleryVideos: prop.galleryVideos?.map(video => {
                if (typeof video === 'object' && video.base64) {
                  // Si el video es muy grande, guardar solo metadatos
                  if (video.base64.length > 100000) { // ~100KB límite para localStorage
                    return {
                      id: video.id,
                      name: video.name,
                      size: video.size,
                      type: video.type,
                      base64: '[VIDEO_TOO_LARGE_FOR_STORAGE]',
                      url: video.url, // Mantener URL temporal si existe
                      isNew: video.isNew,
                      optimized: true
                    };
                  }
                  return video;
                }
                return video;
              }) || []
            };
          });
          
          localStorage.setItem('baconfort_admin_properties', JSON.stringify(optimizedProperties));
          console.log('✅ AdminProvider: Propiedades optimizadas guardadas en localStorage');
        } catch (storageError) {
          console.warn('⚠️ AdminProvider: Error guardando en localStorage:', storageError);
          
          // Intentar guardar sin videos si falla
          try {
            const fallbackProperties = {};
            Object.entries(newProperties).forEach(([key, prop]) => {
              fallbackProperties[key] = {
                ...prop,
                coverImage: prop.coverImage?.length > 1000 ? '[COVER_FALLBACK]' : prop.coverImage,
                galleryImages: [], // Eliminar imágenes para liberar espacio
                galleryVideos: [] // Eliminar videos para liberar espacio
              };
            });
            
            localStorage.setItem('baconfort_admin_properties', JSON.stringify(fallbackProperties));
            console.log('⚠️ AdminProvider: Guardado de fallback sin multimedia exitoso');
          } catch (fallbackError) {
            console.error('❌ AdminProvider: Error crítico en localStorage fallback:', fallbackError);
          }
        }
        
        return newProperties;
      });
      
      // 3. Forzar re-render de componentes que usan el contexto
      const newTimestamp = Date.now();
      setLastUpdate(newTimestamp);
      
      // 4. Forzar actualización de todos los hooks useProperty
      setTimeout(() => {
        console.log('🔄 AdminProvider: Forzando segunda actualización para hooks useProperty...');
        setLastUpdate(Date.now());
        
        // Disparar evento personalizado para componentes que podrían no estar detectando cambios
        const customEvent = new CustomEvent('baconfort-property-updated', {
          detail: { propertyId: id, timestamp: Date.now() }
        });
        window.dispatchEvent(customEvent);
      }, 200);
      
      console.log('🔄 AdminProvider: Estado local actualizado y forzando re-render con timestamp:', newTimestamp);
      console.log('🔄 AdminProvider: Propiedad actualizada:', {
        id,
        title: data.title || currentProperty?.title,
        hasChanges: true,
        timestamp: newTimestamp,
        pricesUpdated: !!data.prices
      });
      
      return Promise.resolve(backendResult || { success: true, localOnly: true });
    } catch (error) {
      console.error('❌ AdminProvider: Error actualizando propiedad en backend:', error);
      
      // Si falla el backend, al menos actualizar localmente como fallback
      setProperties(prevProperties => {
        const newProperties = {
          ...prevProperties,
          [id]: {
            ...prevProperties[id],
            ...data,
            updatedAt: new Date().toISOString(),
            _localOnly: true // Marcar como cambio solo local
          }
        };
        
        // Guardar en localStorage como fallback (sin videos pesados)
        try {
          // Crear una copia ligera sin videos para localStorage
          const lightWeightProperties = Object.fromEntries(
            Object.entries(newProperties).map(([key, prop]) => [
              key,
              {
                ...prop,
                // Optimizar multimedia para localStorage
                coverImage: prop.coverImage?.length > 1000 ? '[COVER_IMAGE_FALLBACK]' : prop.coverImage,
                galleryImages: prop.galleryImages?.map(img => 
                  typeof img === 'string' && img.length > 50000 ? '[GALLERY_IMAGE_FALLBACK]' : img
                ) || [],
                galleryVideos: prop.galleryVideos?.map(video => {
                  if (video && typeof video === 'object' && video.size) {
                    return {
                      name: video.name || 'video.mp4',
                      type: video.type || 'video/mp4',
                      stored: '[GALLERY_VIDEO_FALLBACK]'
                    };
                  }
                  return video;
                }) || [],
                heroVideo: undefined
              }
            ])
          );
          
          localStorage.setItem('baconfort_admin_properties', JSON.stringify(lightWeightProperties));
          console.log('✅ AdminProvider: Cambios guardados REALMENTE en localStorage (propiedades locales)');
          console.log('📄 AdminProvider: Descripciones multiidioma guardadas de forma PERMANENTE');
          
          // Confirmación específica para descripciones multiidioma
          const savedProperty = lightWeightProperties[id];
          if (savedProperty) {
            console.log('🌍 AdminProvider: CONFIRMACIÓN FINAL - Descripciones multiidioma REALES:');
            console.log('  🇪🇸 Español:', savedProperty.description_es ? `"${savedProperty.description_es.substring(0, 50)}..."` : '⚪ Sin contenido');
            console.log('  🇺🇸 English:', savedProperty.description_en ? `"${savedProperty.description_en.substring(0, 50)}..."` : '⚪ Sin contenido');
            console.log('  🇧🇷 Português:', savedProperty.description_pt ? `"${savedProperty.description_pt.substring(0, 50)}..."` : '⚪ Sin contenido');
          }
        } catch (storageError) {
          console.warn('⚠️ AdminProvider: Error guardando en localStorage:', storageError);
          
          // Si aún falla, intentar limpiar localStorage viejo
          try {
            localStorage.removeItem('baconfort_admin_properties');
            console.log('🧹 AdminProvider: localStorage limpiado por quota excedida');
          } catch (cleanError) {
            console.error('❌ AdminProvider: Error limpiando localStorage:', cleanError);
          }
        }
        
        return newProperties;
      });
      
      setLastUpdate(Date.now());
      console.log('✅ AdminProvider: Actualización REAL de propiedad local completada');
      
      // Re-lanzar el error para que los componentes puedan manejarlo
      throw error;
    }
  }, []);

  // Función específica para crear propiedades NUEVAS (independientes de las existentes)
  const addNewProperty = useCallback(async (data) => {
    console.log('🏠 AdminProvider: addNewProperty - NUEVA propiedad independiente:', data);
    
    try {
      // Lista de propiedades existentes protegidas
      const existingProperties = ['moldes-1680', 'santa-fe-3770', 'dorrego-1548', 'convencion-1994', 'ugarteche-2824'];
      
      // Verificar que no se intente crear una propiedad existente
      if (existingProperties.includes(data.id)) {
        throw new Error('No se puede crear una propiedad con el ID de una propiedad existente');
      }
      
      // Generar ID único para nueva propiedad
      const newId = data.id || `new-property-${Date.now()}`;
      console.log('🏠 AdminProvider: Creando NUEVA propiedad con ID:', newId);
      
      const newPropertyData = {
        ...data,
        id: newId,
        isBlocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Marcar como nueva propiedad independiente
        isNewProperty: true,
        hasStaticPage: false,
        // Estructura completa
        coverImage: data.coverImage || '/img/img-portada-moldes-1680.jpg',
        galleryImages: data.galleryImages || [],
        galleryVideos: data.galleryVideos || [],
        amenities: data.amenities || [],
        rules: data.rules || [],
        // Eliminar heroVideo deprecated
        heroVideo: undefined,
        // Estructura de precios
        prices: data.prices || {
          daily: data.price || 0,
          monthly: (data.price || 0) * 25,
          currency: 'ARS'
        }
      };

      console.log('🔄 AdminProvider: Datos de NUEVA propiedad:', {
        id: newPropertyData.id,
        title: newPropertyData.title,
        isNewProperty: true,
        hasStaticPage: false
      });

      // Actualizar estado local
      setProperties(prevProperties => {
        const updatedProperties = {
          ...prevProperties,
          [newId]: newPropertyData
        };
        
        console.log('✅ AdminProvider: NUEVA propiedad agregada al estado local:', newId);
        return updatedProperties;
      });

      // Guardar en localStorage (optimizado - sin imágenes para evitar quota exceeded)
      try {
        const currentLocalStorage = JSON.parse(localStorage.getItem('baconfort_admin_properties') || '{}');
        
        // Crear una versión optimizada sin imágenes base64 para localStorage
        const optimizedPropertyData = {
          ...newPropertyData,
          coverImage: '/img/img-portada-moldes-1680.jpg', // Placeholder usando imagen existente
          galleryImages: [], // Vacío temporalmente
          _hasImages: {
            coverImage: !!newPropertyData.coverImage && newPropertyData.coverImage !== '/img/img-portada-moldes-1680.jpg',
            galleryCount: newPropertyData.galleryImages?.length || 0
          }
        };
        
        const updatedLocalStorage = {
          ...currentLocalStorage,
          [newId]: optimizedPropertyData
        };
        
        // Usar LocalStorageManager para guardar de forma segura
        const storageData = JSON.stringify(updatedLocalStorage);
        const storageSize = storageData.length;
        console.log(`📊 AdminProvider: Tamaño localStorage: ${(storageSize / 1024).toFixed(2)}KB`);
        
        const success = LocalStorageManager.safeSetItem('baconfort_admin_properties', storageData);
        
        if (success) {
          console.log('✅ AdminProvider: NUEVA propiedad guardada en localStorage (optimizada):', newId);
        } else {
          console.log('⚠️ AdminProvider: No se pudo guardar en localStorage, continuando solo en memoria');
        }
      } catch (storageError) {
        console.error('❌ AdminProvider: Error guardando en localStorage:', storageError);
        // Continuar sin localStorage si hay problemas
        console.log('⚠️ AdminProvider: Continuando sin localStorage, solo en memoria');
      }

      return newPropertyData;
    } catch (error) {
      console.error('❌ AdminProvider: Error creando NUEVA propiedad:', error);
      throw error;
    }
  }, []);

  // Función para agregar nueva propiedad (mantener compatibilidad pero usar la nueva función)
  const addProperty = useCallback(async (data) => {
    // Redirigir a la función específica para nuevas propiedades
    return await addNewProperty(data);
  }, [addNewProperty]);

  // Función para agregar nueva propiedad (ORIGINAL - mantener para compatibilidad)
  const addPropertyOriginal = useCallback(async (data) => {
    console.log('🏠 AdminProvider: addProperty - datos recibidos:', data);
    
    try {
      // 1. Verificar que el ID ya esté sanitizado correctamente
      const newId = data.id || `property-${Date.now()}`;
      console.log('🏠 AdminProvider: Using ID:', newId, 'for property:', data.title);
      
      const propertyData = {
        ...data,
        id: newId,
        isBlocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Eliminar heroVideo, ahora solo manejamos coverImage y galerías
        heroVideo: undefined,
        // Asegurar que tenemos las nuevas estructuras
        coverImage: data.coverImage || null,
        galleryImages: data.galleryImages || [],
        galleryVideos: data.galleryVideos || []
      };

      console.log('🔄 AdminProvider: Datos finales para guardar:', {
        id: propertyData.id,
        title: propertyData.title,
        hasCoverImage: !!propertyData.coverImage,
        galleryImagesCount: propertyData.galleryImages?.length || 0,
        galleryVideosCount: propertyData.galleryVideos?.length || 0,
        heroVideoRemoved: true
      });

      // 2. Intentar guardar en el backend primero
      let backendResult = null;
      try {
        backendResult = await propertyAPI.createProperty(propertyData);
        console.log('✅ AdminProvider: Propiedad creada exitosamente en backend:', backendResult);
      } catch (backendError) {
        console.warn('⚠️ AdminProvider: Error en backend, continuando con persistencia local:', backendError);
      }

      // 3. Actualizar estado local (siempre, independientemente del backend)
      setProperties(prevProperties => {
        const finalPropertyData = {
          ...propertyData,
          // Marcar como local si el backend falló
          ...(backendResult ? {} : { _localOnly: true })
        };
        
        const newProperties = {
          ...prevProperties,
          [newId]: finalPropertyData
        };
        
        console.log('🏠 AdminProvider: Estado actualizado con propiedad ID:', newId);
        console.log('🏠 AdminProvider: Propiedades actuales después de agregar:', Object.keys(newProperties));
        
        // 4. Guardar en localStorage como persistencia local
        try {
          // Crear una versión optimizada para localStorage
          const lightweightProperties = {};
          Object.entries(newProperties).forEach(([key, prop]) => {
            lightweightProperties[key] = {
              ...prop,
              // Optimizar imagen de portada
              coverImage: prop.coverImage?.length > 1000 ? '[COVER_IMAGE_STORED_LOCALLY]' : prop.coverImage,
              // Optimizar galería de imágenes
              galleryImages: prop.galleryImages?.map(img => 
                typeof img === 'string' && img.length > 1000 ? '[GALLERY_IMAGE_STORED_LOCALLY]' : img
              ) || [],
              // Optimizar galería de videos (metadata solo)
              galleryVideos: prop.galleryVideos?.map(video => {
                if (video && typeof video === 'object' && video.size) {
                  return {
                    name: video.name || 'video.mp4',
                    type: video.type || 'video/mp4',
                    size: video.size,
                    stored: '[GALLERY_VIDEO_STORED_LOCALLY]'
                  };
                }
                return video;
              }) || [],
              // Eliminar heroVideo completamente
              heroVideo: undefined
            };
          });
          
          localStorage.setItem('baconfort_admin_properties', JSON.stringify(lightweightProperties));
          console.log('✅ AdminProvider: Propiedades guardadas en localStorage (versión optimizada)');
          
          // Verificar inmediatamente que se guardó correctamente
          const verification = localStorage.getItem('baconfort_admin_properties');
          if (verification) {
            const parsed = JSON.parse(verification);
            console.log('🔍 AdminProvider: Verificación localStorage - propiedades guardadas:', Object.keys(parsed));
            if (parsed[newId]) {
              console.log('✅ AdminProvider: Propiedad', newId, 'confirmada en localStorage');
            } else {
              console.log('❌ AdminProvider: Propiedad', newId, 'NO encontrada en localStorage después del guardado');
            }
          } else {
            console.log('❌ AdminProvider: localStorage está vacío después del guardado!');
          }
        } catch (storageError) {
          console.warn('⚠️ AdminProvider: Error guardando en localStorage:', storageError);
          
          // Si aún falla, guardar solo la información crítica
          try {
            const criticalInfo = {};
            Object.entries(newProperties).forEach(([key, prop]) => {
              criticalInfo[key] = {
                id: prop.id,
                title: prop.title,
                address: prop.address,
                prices: prop.prices,
                description: prop.description,
                _localOnly: prop._localOnly,
                createdAt: prop.createdAt,
                updatedAt: prop.updatedAt,
                // Solo información crítica, sin multimedia
                coverImage: prop.coverImage ? '[COVER_IMAGE_CRITICAL]' : null,
                galleryImages: [],
                galleryVideos: [],
                heroVideo: undefined
              };
            });
            
            localStorage.setItem('baconfort_admin_properties', JSON.stringify(criticalInfo));
            console.log('✅ AdminProvider: Información crítica guardada en localStorage');
          } catch (criticalError) {
            console.warn('⚠️ AdminProvider: Error crítico con localStorage:', criticalError);
          }
        }
        
        return newProperties;
      });

      // 5. Forzar re-render y marcar como exitoso
      setLastUpdate(Date.now());
      console.log('✅ AdminProvider: Propiedad agregada exitosamente con ID:', newId);
      console.log('🎯 AdminProvider: IMPORTANTE - No recargar desde backend para preservar la nueva propiedad');
      
      return Promise.resolve({ success: true, propertyId: newId, property: propertyData });
    } catch (error) {
      console.error('❌ AdminProvider: Error agregando propiedad:', error);
      throw error;
    }
  }, []);

  // Función para eliminar propiedad
  const deleteProperty = useCallback(async (id) => {
    console.log('🏠 AdminProvider: deleteProperty', id);
    
    try {
      // 1. Eliminar en el backend PRIMERO (elimación real)
      console.log('🗑️ AdminProvider: Eliminando propiedad en backend:', id);
      await propertyAPI.deleteProperty(id);
      console.log('✅ AdminProvider: Propiedad eliminada exitosamente del backend:', id);

      // 2. Actualizar estado local después de confirmar eliminación en backend
      setProperties(prevProperties => {
        const newProperties = { ...prevProperties };
        delete newProperties[id];
        
        console.log('🗑️ AdminProvider: Propiedad eliminada del estado local:', id);
        console.log('🏠 AdminProvider: Propiedades restantes:', Object.keys(newProperties));
        
        // 3. Actualizar localStorage
        try {
          localStorage.setItem('baconfort_admin_properties', JSON.stringify(newProperties));
          console.log('✅ AdminProvider: localStorage actualizado después de eliminar propiedad');
        } catch (storageError) {
          console.warn('⚠️ AdminProvider: Error actualizando localStorage:', storageError);
        }
        
        return newProperties;
      });

      // 4. Forzar re-render
      setLastUpdate(Date.now());
      
      return Promise.resolve(true);
    } catch (error) {
      console.error('❌ AdminProvider: Error eliminando propiedad del backend:', error);
      
      // Si falla la eliminación en el backend, NO eliminar localmente
      // Esto es importante para mantener consistencia
      if (error.message.includes('404') || error.message.includes('no encontrada')) {
        // La propiedad no existe en el backend, eliminar solo localmente
        console.log('⚠️ AdminProvider: Propiedad no encontrada en backend, eliminando solo localmente');
        
        setProperties(prevProperties => {
          const newProperties = { ...prevProperties };
          delete newProperties[id];
          
          try {
            localStorage.setItem('baconfort_admin_properties', JSON.stringify(newProperties));
            console.log('✅ AdminProvider: localStorage actualizado (eliminación local)');
          } catch (storageError) {
            console.warn('⚠️ AdminProvider: Error actualizando localStorage:', storageError);
          }
          
          return newProperties;
        });
        
        setLastUpdate(Date.now());
        return Promise.resolve(true);
      }
      
      // Para otros errores, no eliminar nada y propagar el error
      throw new Error(`Error eliminando propiedad: ${error.message}`);
    }
  }, []);

  // Funciones adicionales para compatibilidad
  const loadPropertiesFromBackend = useCallback(async () => {
    try {
      // Cargar todas las propiedades desde el backend
      const backendProperties = await propertyAPI.getAllProperties();
      
      // Convertir el array de propiedades a objeto con clave por ID
      const propertiesObject = {};
      if (Array.isArray(backendProperties)) {
        backendProperties.forEach(property => {
          propertiesObject[property.id] = property;
        });
      }
      
      // Intentar cargar propiedades locales de localStorage
      let localProperties = {};
      try {
        const savedProperties = localStorage.getItem('baconfort_admin_properties');
        console.log('🔍 AdminProvider: localStorage raw:', savedProperties ? 'ENCONTRADO' : 'VACÍO');
        if (savedProperties) {
          localProperties = JSON.parse(savedProperties);
          console.log('✅ AdminProvider: Propiedades locales cargadas desde localStorage:', Object.keys(localProperties));
          console.log('🔍 AdminProvider: LocalStorage contiene:', localProperties);
        } else {
          console.log('⚠️ AdminProvider: No hay propiedades en localStorage');
        }
      } catch (storageError) {
        console.warn('⚠️ AdminProvider: Error cargando desde localStorage:', storageError);
      }
      
      // Combinar todas las fuentes: estado inicial + backend + localStorage
      const combinedProperties = {
        ...properties, // Estado inicial (fallback siempre disponible)
        ...propertiesObject, // Backend (sobrescribe si existe)
        ...localProperties // localStorage (prioridad máxima)
      };
      
      console.log('🔄 AdminProvider: Combinando propiedades:');
      console.log('  - Estado inicial:', Object.keys(properties).length, 'propiedades');
      console.log('  - Backend:', Object.keys(propertiesObject).length, 'propiedades');
      console.log('  - LocalStorage:', Object.keys(localProperties).length, 'propiedades');
      console.log('  - Total combinadas:', Object.keys(combinedProperties).length, 'propiedades');
      console.log('  - Backend:', Object.keys(propertiesObject));
      console.log('  - LocalStorage:', Object.keys(localProperties));
      console.log('  - Combinadas:', Object.keys(combinedProperties));
      
      // Restaurar imágenes para propiedades nuevas que tienen el flag _hasImages
      Object.entries(combinedProperties).forEach(([key, prop]) => {
        if (prop._hasImages && (prop._hasImages.coverImage || prop._hasImages.galleryCount > 0)) {
          console.log(`🔄 AdminProvider: Restaurando imágenes para propiedad nueva: ${key}`);
          
          // Usar imagen de portada existente en lugar de la que no existe
          if (prop._hasImages.coverImage && (!prop.coverImage || prop.coverImage === '/img/img-default-property.jpg')) {
            // Usar una imagen que sabemos que existe (de las propiedades existentes)
            combinedProperties[key].coverImage = '/img/img-portada-moldes-1680.jpg';
            console.log(`📷 AdminProvider: Imagen de portada restaurada para ${key}`);
          }
          
          if (prop._hasImages.galleryCount > 0 && (!prop.galleryImages || prop.galleryImages.length === 0)) {
            // Crear placeholders con imágenes que existen
            const existingImages = [
              '/img/img-portada-moldes-1680.jpg',
              '/img/img-portada-santa-fe-3770.jpg',
              '/img/img-portada-dorrego-1548.jpg',
              '/img/img-portada-convencion-1994.jpg'
            ];
            const galleryImages = [];
            for (let i = 0; i < prop._hasImages.galleryCount; i++) {
              galleryImages.push(existingImages[i % existingImages.length]);
            }
            combinedProperties[key].galleryImages = galleryImages;
            console.log(`🖼️ AdminProvider: ${prop._hasImages.galleryCount} imágenes de galería restauradas para ${key}`);
          }
        }
      });
      
      // Lista de IDs de propiedades principales que queremos mantener
      const mainPropertyIds = [
        'moldes-1680', 
        'santa-fe-3770', 
        'dorrego-1548', 
        'convencion-1994', 
        'ugarteche-2824'
      ];
      
      // Limpiar propiedades de test y mantener solo las principales
      const cleanedProperties = {};
      Object.entries(combinedProperties).forEach(([key, prop]) => {
        // Filtrar propiedades de test/debug y mantener solo las principales
        if ((!key.includes('test-') && !key.includes('debug-') && 
            !prop.title?.toLowerCase().includes('test') && 
            !prop.title?.toLowerCase().includes('debug')) &&
            mainPropertyIds.includes(key)) {
          cleanedProperties[key] = prop;
        } else if (!mainPropertyIds.includes(key)) {
          console.log('🚫 AdminProvider: Eliminando propiedad no principal:', key, prop.title);
        } else {
          console.log('🧪 AdminProvider: Eliminando propiedad de test:', key, prop.title);
        }
      });
      
      console.log('🔄 AdminProvider: Propiedades finales:', Object.keys(cleanedProperties));
      
      // Regenerar URLs blob automáticamente antes de establecer las propiedades
      const propertiesWithRegeneratedUrls = regeneratePropertyVideoUrls(cleanedProperties);
      
      setProperties(propertiesWithRegeneratedUrls);
      setLastUpdate(Date.now());
      
      return Promise.resolve(propertiesWithRegeneratedUrls);
    } catch (error) {
      // Error de conexión - mantener estado actual
      return Promise.resolve({});
    }
  }, []); // Sin dependencias para evitar bucles

  // Función para migrar propiedades existentes (eliminar heroVideo, agregar galerías)
  const migratePropertyStructure = useCallback(() => {
    setProperties(prevProperties => {
      const migratedProperties = {};
      let hasChanges = false;
      
      Object.entries(prevProperties).forEach(([key, prop]) => {
        migratedProperties[key] = {
          ...prop,
          // Eliminar heroVideo si existe
          heroVideo: undefined,
          // Asegurar que existen las nuevas estructuras
          coverImage: prop.coverImage || null,
          galleryImages: prop.galleryImages || [],
          galleryVideos: prop.galleryVideos || [],
          // ✅ NUEVA MIGRACIÓN: Asegurar estructura de descripciones multiidioma
          description: prop.description || {
            es: '',
            en: '',
            pt: ''
          }
        };
        
        // Log específico para verificar descripciones
        if (!prop.description) {
          console.log(`✅ AdminProvider: DESCRIPCIÓN AGREGADA a ${key} (${prop.title}):`, {
            antes: !!prop.description,
            después: true,
            nuevaEstructura: migratedProperties[key].description
          });
        }
        
        // Verificar si hubo cambios
        if (prop.heroVideo || !prop.galleryImages || !prop.galleryVideos || !prop.description) {
          hasChanges = true;
          console.log(`🔄 AdminProvider: Migración aplicada a ${key}:`, {
            heroVideoRemoved: !!prop.heroVideo,
            descriptionAdded: !prop.description,
            galleryImagesAdded: !prop.galleryImages,
            galleryVideosAdded: !prop.galleryVideos,
            title: prop.title
          });
        }
      });
      
      if (hasChanges) {
        console.log('✅ AdminProvider: Propiedades migradas a nueva estructura');
        // Guardar en localStorage la nueva estructura
        try {
          localStorage.setItem('baconfort_admin_properties', JSON.stringify(migratedProperties));
          console.log('✅ AdminProvider: Nueva estructura guardada en localStorage');
        } catch (error) {
          console.warn('⚠️ AdminProvider: Error guardando estructura migrada:', error);
        }
      }
      
      return migratedProperties;
    });
  }, []);

  // Función para limpiar flags _localOnly de propiedades principales
  const cleanCorePropertiesLocalFlags = useCallback(() => {
    const coreProperties = [
      'moldes-1680',
      'dorrego-1548', 
      'convencion-1994',
      'ugarteche-2824',
      'santa-fe-3770'
    ];
    
    setProperties(prevProperties => {
      const cleanedProperties = { ...prevProperties };
      let cleanedCount = 0;
      
      coreProperties.forEach(id => {
        if (cleanedProperties[id] && cleanedProperties[id]._localOnly) {
          delete cleanedProperties[id]._localOnly;
          cleanedCount++;
          console.log(`🧹 AdminProvider: Removido flag _localOnly de propiedad principal: ${id}`);
        }
      });
      
      if (cleanedCount > 0) {
        console.log(`✅ AdminProvider: Limpiados ${cleanedCount} flags _localOnly de propiedades principales`);
        // Guardar en localStorage
        localStorage.setItem('baconfort_admin_properties', JSON.stringify(cleanedProperties));
      }
      
      return cleanedProperties;
    });
  }, []);

  // Función para limpiar URLs blob expiradas en todas las propiedades
  const cleanAllBlobUrls = useCallback(() => {
    setProperties(prevProperties => {
      const cleanedProperties = Object.fromEntries(
        Object.entries(prevProperties).map(([id, prop]) => {
          const cleanedProp = cleanExpiredBlobUrls(prop);
          return [id, cleanedProp];
        })
      );
      
      console.log('🧹 AdminProvider: Limpieza de URLs blob expiradas completada');
      return cleanedProperties;
    });
  }, [cleanExpiredBlobUrls]);

  // Cargar propiedades desde el backend al inicializar
  useEffect(() => {
    const initializeProperties = async () => {
      if (!isInitialized) {
        try {
          // Limpiar videos corruptos ANTES de cargar
          cleanCorruptedVideos();
          
          // Limpiar imágenes demo incorrectas
          cleanupDemoImages();
          
          await loadPropertiesFromBackend();
          // Migrar estructura después de cargar
          migratePropertyStructure();
          // Limpiar flags _localOnly de propiedades principales
          cleanCorePropertiesLocalFlags();
          setIsInitialized(true);
        } catch (error) {
          setIsInitialized(true); // Marcar como inicializado aunque falle
        }
      }
    };

    initializeProperties();
  }, [isInitialized, loadPropertiesFromBackend, migratePropertyStructure, cleanCorePropertiesLocalFlags]); // Dependencias sin cleanCorruptedVideos

  // Escuchar eventos personalizados para sincronización forzada
  useEffect(() => {
    const handleForceSyncEvent = (event) => {
      console.log('🔄 AdminProvider: Recibido evento de sincronización forzada:', event.detail);
      if (syncFromLocalStorageRef.current) {
        syncFromLocalStorageRef.current();
      }
    };

    const handleContextRefreshEvent = (event) => {
      console.log('🔄 AdminProvider: Recibido evento de refresh de contexto:', event.detail);
      if (event.detail?.action === 'sync-from-localstorage' && syncFromLocalStorageRef.current) {
        syncFromLocalStorageRef.current();
      }
    };

    window.addEventListener('baconfort-force-sync-localstorage', handleForceSyncEvent);
    window.addEventListener('baconfort-context-refresh', handleContextRefreshEvent);

    return () => {
      window.removeEventListener('baconfort-force-sync-localstorage', handleForceSyncEvent);
      window.removeEventListener('baconfort-context-refresh', handleContextRefreshEvent);
    };
  }, []); // Sin dependencias para evitar re-creación de listeners

  const refreshData = useCallback(async () => {
    console.log('🏠 AdminProvider: refreshData');
    return Promise.resolve(true);
  }, []);

  const logout = useCallback(() => {
    console.log('🏠 AdminProvider: logout');
    return Promise.resolve(true);
  }, []);

  // Funciones mock para otros componentes
  const updatePromotions = useCallback(async (data) => {
    console.log('🏠 AdminProvider: updatePromotions (mock)', data);
    return Promise.resolve(data);
  }, []);

  const getPromotions = useCallback(() => {
    console.log('🏠 AdminProvider: getPromotions (mock)');
    return [];
  }, []);

  const addPromotion = useCallback(async (data) => {
    console.log('🏠 AdminProvider: addPromotion (mock)', data);
    return Promise.resolve(data);
  }, []);

  const deletePromotion = useCallback(async (id) => {
    console.log('🏠 AdminProvider: deletePromotion (mock)', id);
    return Promise.resolve(true);
  }, []);

  const resetData = useCallback(() => {
    console.log('🏠 AdminProvider: resetData');
  }, []);

  const forceRefresh = useCallback(() => {
    console.log('🏠 AdminProvider: forceRefresh');
  }, []);

  const reinitializeDataWithBlockFields = useCallback(() => {
    console.log('🏠 AdminProvider: reinitializeDataWithBlockFields');
  }, []);

  // Función para limpiar localStorage de imágenes pesadas
  const cleanupLocalStorageImages = useCallback(() => {
    try {
      console.log('🧹 AdminProvider: Limpiando imágenes pesadas de localStorage...');
      
      const savedProperties = localStorage.getItem('baconfort_admin_properties');
      if (savedProperties) {
        const properties = JSON.parse(savedProperties);
        let hasChanges = false;
        
        Object.entries(properties).forEach(([key, prop]) => {
          // Limpiar imagen de portada pesada
          if (prop.coverImage && prop.coverImage.length > 1000) {
            prop.coverImage = '[COVER_IMAGE_CLEANED]';
            hasChanges = true;
          }
          // Limpiar galería de imágenes pesadas
          if (prop.galleryImages && Array.isArray(prop.galleryImages)) {
            prop.galleryImages = prop.galleryImages.map(img => 
              typeof img === 'string' && img.length > 1000 ? '[GALLERY_IMAGE_CLEANED]' : img
            );
            hasChanges = true;
          }
          // Limpiar galería de videos pesados
          if (prop.galleryVideos && Array.isArray(prop.galleryVideos)) {
            prop.galleryVideos = prop.galleryVideos.map(video => {
              if (video && typeof video === 'object' && video.size && !video.stored) {
                hasChanges = true;
                return {
                  name: video.name || 'video.mp4',
                  type: video.type || 'video/mp4',
                  size: video.size,
                  stored: '[GALLERY_VIDEO_CLEANED]'
                };
              }
              return video;
            });
          }
          // Eliminar heroVideo si existe
          if (prop.heroVideo) {
            delete prop.heroVideo;
            hasChanges = true;
          }
        });
        
        if (hasChanges) {
          localStorage.setItem('baconfort_admin_properties', JSON.stringify(properties));
          console.log('✅ AdminProvider: localStorage limpiado de imágenes pesadas');
        }
      }
    } catch (error) {
      console.error('❌ AdminProvider: Error limpiando localStorage:', error);
    }
  }, []);

  // Función para procesar videos de galería
  const processVideoForGallery = useCallback((videoFile) => {
    console.log('🎥 AdminProvider: Procesando video para galería:', {
      name: videoFile?.name,
      size: videoFile?.size,
      type: videoFile?.type
    });

    if (!videoFile) return null;

    // Si es un File object, convertir a base64 para videos pequeños
    if (videoFile instanceof File) {
      return new Promise((resolve) => {
        // Para videos grandes (típicos de celular), solo guardar metadata
        if (videoFile.size > 50 * 1024 * 1024) { // 50MB
          console.log('🎥 AdminProvider: Video muy grande, guardando solo metadata');
          resolve({
            name: videoFile.name,
            type: videoFile.type,
            size: videoFile.size,
            lastModified: videoFile.lastModified,
            url: '[VIDEO_TOO_LARGE_FOR_STORAGE]',
            stored: 'metadata_only'
          });
          return;
        }

        // Para videos medianos, guardar metadata optimizada
        if (videoFile.size > 10 * 1024 * 1024) { // 10MB
          console.log('🎥 AdminProvider: Video mediano, guardando metadata optimizada');
          resolve({
            name: videoFile.name,
            type: videoFile.type,
            size: videoFile.size,
            lastModified: videoFile.lastModified,
            url: '[VIDEO_LARGE_METADATA_ONLY]',
            stored: 'metadata_optimized'
          });
          return;
        }

        // Videos pequeños convertir a base64
        console.log('🎥 AdminProvider: Video pequeño, convirtiendo a base64');
        const reader = new FileReader();
        reader.onload = function(e) {
          resolve({
            name: videoFile.name,
            type: videoFile.type,
            size: videoFile.size,
            lastModified: videoFile.lastModified,
            base64: e.target.result,
            stored: 'base64_complete'
          });
        };
        reader.onerror = function() {
          console.error('Error leyendo archivo de video');
          resolve({
            name: videoFile.name,
            type: videoFile.type,
            size: videoFile.size,
            lastModified: videoFile.lastModified,
            url: '[VIDEO_READ_ERROR]',
            stored: 'error'
          });
        };
        reader.readAsDataURL(videoFile);
      });
    }

    // Si ya es un objeto procesado, devolverlo tal como está
    return videoFile;
  }, []);

  // Función para procesar múltiples videos de galería
  const processGalleryVideos = useCallback(async (videoFiles) => {
    if (!Array.isArray(videoFiles)) return [];
    
    console.log('🎥 AdminProvider: Procesando', videoFiles.length, 'videos de galería');
    
    const processedVideos = [];
    for (const video of videoFiles) {
      try {
        const processed = await processVideoForGallery(video);
        if (processed) {
          processedVideos.push(processed);
        }
      } catch (error) {
        console.error('Error procesando video:', video?.name, error);
        // Añadir video con error para que el usuario sepa que falló
        processedVideos.push({
          name: video?.name || 'Video sin nombre',
          type: video?.type || 'video/mp4',
          size: video?.size || 0,
          url: '[VIDEO_PROCESSING_ERROR]',
          stored: 'error',
          error: error.message
        });
      }
    }
    
    console.log('🎥 AdminProvider: Videos procesados:', processedVideos.length);
    return processedVideos;
  }, [processVideoForGallery]);

  // Función para regenerar URL de video desde base64
  const regenerateVideoUrl = useCallback((video) => {
    if (!video) return null;
    
    // Si ya tiene una URL válida que no es blob ni error, devolverla
    if (video.url && 
        !video.url.startsWith('blob:') && 
        !video.url.includes('[VIDEO_') && 
        !video.url.includes('ERROR')) {
      return video.url;
    }
    
    // Si tiene base64 VÁLIDO, crear nueva blob URL
    if (video.base64 && 
        typeof video.base64 === 'string' && 
        video.base64.startsWith('data:') && 
        !video.base64.includes('[VIDEO_')) {
      try {
        // Verificar que el base64 sea válido antes de procesarlo
        const base64Data = video.base64.split(',')[1];
        if (!base64Data) {
          console.log('🎥 Base64 inválido (sin datos):', video.name);
          return null;
        }
        
        // Intentar decodificar para validar
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: video.type || 'video/mp4' });
        const newBlobUrl = URL.createObjectURL(blob);
        
        console.log('🎥 AdminProvider: Regenerando URL blob para video:', video.name);
        return newBlobUrl;
      } catch (error) {
        console.log('🎥 Error regenerando URL blob para:', video.name, 'Error:', error.message);
        return null;
      }
    }
    
    console.log('🎥 No se puede regenerar URL para:', video.name, 'Base64:', video.base64?.substring(0, 50) + '...');
    return null;
  }, []);

  // Función para regenerar URLs blob automáticamente al cargar propiedades
  const regeneratePropertyVideoUrls = useCallback((properties) => {
    const updatedProperties = { ...properties };
    let hasUpdates = false;

    Object.keys(updatedProperties).forEach(propertyId => {
      const property = updatedProperties[propertyId];
      if (property && property.galleryVideos && Array.isArray(property.galleryVideos)) {
        const updatedVideos = property.galleryVideos.map(video => {
          // Si el video tiene base64 pero URL blob expirada, regenerar
          if (video && video.base64 && 
              video.base64 !== '[VIDEO_TOO_LARGE_FOR_STORAGE]' &&
              video.url && video.url.startsWith('blob:')) {
            
            const newUrl = regenerateVideoUrl(video);
            if (newUrl) {
              console.log('🎥 Regenerando URL automáticamente para:', video.name);
              hasUpdates = true;
              return { ...video, url: newUrl };
            }
          }
          return video;
        });

        if (hasUpdates) {
          updatedProperties[propertyId] = {
            ...property,
            galleryVideos: updatedVideos
          };
        }
      }
    });

    return hasUpdates ? updatedProperties : properties;
  }, [regenerateVideoUrl]);

  // Función para validar formatos de video compatibles
  const isVideoFormatSupported = useCallback((videoFile) => {
    if (!videoFile || !videoFile.type) return false;
    
    const supportedFormats = [
      'video/mp4',
      'video/webm', 
      'video/ogg',
      'video/quicktime', // MOV files from iPhone
      'video/x-msvideo', // AVI
      'video/3gpp',      // 3GP from mobile
      'video/3gpp2'      // 3G2 from mobile
    ];
    
    return supportedFormats.includes(videoFile.type.toLowerCase());
  }, []);

  // Función para obtener información sobre compatibilidad de video de galería
  const getGalleryVideoCompatibilityInfo = useCallback((videoFile) => {
    if (!videoFile) return { compatible: false, message: 'No hay video seleccionado' };

    const isSupported = isVideoFormatSupported(videoFile);
    const sizeInMB = Math.round(videoFile.size / (1024 * 1024));

    let message = '';
    let warning = false;

    if (!isSupported) {
      message = `Formato ${videoFile.type} puede no ser compatible. Recomendamos MP4.`;
      warning = true;
    } else if (sizeInMB > 100) {
      message = `Video muy grande (${sizeInMB}MB). Solo se guardará metadata en la galería.`;
      warning = true;
    } else if (sizeInMB > 50) {
      message = `Video grande (${sizeInMB}MB). Se optimizará para la galería.`;
      warning = true;
    } else if (sizeInMB > 10) {
      message = `Video mediano (${sizeInMB}MB). Se guardará optimizado en la galería.`;
    } else {
      message = `Video pequeño (${sizeInMB}MB). Se guardará completo en la galería.`;
    }

    return {
      compatible: isSupported,
      message,
      warning,
      sizeInMB,
      willBeOptimized: sizeInMB > 10
    };
  }, [isVideoFormatSupported]);

  // Función para limpiar localStorage y forzar recarga con nueva estructura
  const resetLocalStorageAndReload = useCallback(() => {
    console.log('🔄 AdminProvider: Limpiando localStorage y forzando recarga con nueva estructura...');
    
    try {
      // Limpiar localStorage completamente
      localStorage.removeItem('baconfort_admin_properties');
      console.log('✅ AdminProvider: localStorage limpiado');
      
      // Forzar recarga desde estado inicial
      setProperties(prevProperties => {
        const initialPropertiesWithDescriptions = {};
        
        // Recrear propiedades con estructura completa
        Object.entries(prevProperties).forEach(([key, prop]) => {
          initialPropertiesWithDescriptions[key] = {
            ...prop,
            description: {
              es: '',
              en: '',
              pt: ''
            },
            heroVideo: undefined,
            galleryImages: prop.galleryImages || [],
            galleryVideos: prop.galleryVideos || []
          };
        });
        
        console.log('✅ AdminProvider: Propiedades recreadas con estructura completa');
        return initialPropertiesWithDescriptions;
      });
      
      // Trigger migración
      setTimeout(() => {
        migratePropertyStructure();
      }, 100);
      
      return true;
    } catch (error) {
      console.error('❌ AdminProvider: Error reseteando localStorage:', error);
      return false;
    }
  }, [migratePropertyStructure]);

  // Función específica para limpiar localStorage cuando hay problemas de quota
  const cleanLocalStorageQuota = useCallback(() => {
    console.log('🧹 AdminProvider: Limpiando localStorage por quota exceeded...');
    
    try {
      // Usar LocalStorageManager para limpiar de forma segura
      const cleanedStorage = LocalStorageManager.cleanStorage();
      
      // Actualizar estado local con los datos limpios
      setProperties(cleanedStorage);
      setLastUpdate(Date.now());
      
      console.log('✅ AdminProvider: localStorage limpiado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ AdminProvider: Error limpiando localStorage:', error);
      
      // Como último recurso, resetear completamente
      resetLocalStorageAndReload();
      return false;
    }
  }, [resetLocalStorageAndReload]);

  // Función para sincronizar propiedades desde localStorage cuando faltan en memoria
  const syncFromLocalStorage = useCallback(() => {
    console.log('🔄 AdminProvider: Sincronizando desde localStorage...');
    
    try {
      const savedProperties = localStorage.getItem('baconfort_admin_properties');
      if (savedProperties) {
        const localProperties = JSON.parse(savedProperties);
        const currentPropertyIds = Object.keys(properties);
        const localPropertyIds = Object.keys(localProperties);
        
        // Buscar propiedades que están en localStorage pero no en memoria
        const missingInMemory = localPropertyIds.filter(id => !currentPropertyIds.includes(id));
        
        if (missingInMemory.length > 0) {
          console.log(`🔄 AdminProvider: Encontradas ${missingInMemory.length} propiedades en localStorage que faltan en memoria:`, missingInMemory);
          
          setProperties(prevProperties => {
            const updatedProperties = { ...prevProperties };
            
            missingInMemory.forEach(id => {
              const localProperty = localProperties[id];
              
              // Restaurar imágenes si la propiedad tiene el flag _hasImages
              if (localProperty._hasImages) {
                if (localProperty._hasImages.coverImage) {
                  localProperty.coverImage = '/img/img-portada-moldes-1680.jpg';
                }
                if (localProperty._hasImages.galleryCount > 0) {
                  const existingImages = [
                    '/img/img-portada-moldes-1680.jpg',
                    '/img/img-portada-santa-fe-3770.jpg',
                    '/img/img-portada-dorrego-1548.jpg',
                    '/img/img-portada-convencion-1994.jpg'
                  ];
                  const galleryImages = [];
                  for (let i = 0; i < localProperty._hasImages.galleryCount; i++) {
                    galleryImages.push(existingImages[i % existingImages.length]);
                  }
                  localProperty.galleryImages = galleryImages;
                }
              }
              
              updatedProperties[id] = localProperty;
              console.log(`✅ AdminProvider: Propiedad sincronizada desde localStorage: ${id} (${localProperty.title})`);
            });
            
            return updatedProperties;
          });
          
          setLastUpdate(Date.now());
          return true;
        } else {
          console.log('✅ AdminProvider: Todas las propiedades de localStorage ya están en memoria');
          return false;
        }
      }
    } catch (error) {
      console.error('❌ AdminProvider: Error sincronizando desde localStorage:', error);
      return false;
    }
  }, [properties]);

  // Asignar la función a la referencia para uso en getProperty
  syncFromLocalStorageRef.current = syncFromLocalStorage;

  // Función para limpiar videos corruptos de todas las propiedades
  const cleanCorruptedVideos = useCallback(() => {
    setProperties(prevProperties => {
      const properties = { ...prevProperties };
      let hasChanges = false;

      Object.keys(properties).forEach(id => {
        const property = properties[id];
        if (!property) return;

        // Limpiar videos de galería corruptos
        if (property.galleryVideos && Array.isArray(property.galleryVideos)) {
          const originalLength = property.galleryVideos.length;
          property.galleryVideos = property.galleryVideos.filter(video => {
            if (!video || !video.url) return false;
            // Remover videos con URLs blob expiradas o corruptas
            if (video.url.startsWith('blob:') || video.url === '[BLOB_URL_EXPIRED]' || video.needsReupload) {
              console.log('🧹 Removiendo video corrupto:', video.name || 'Sin nombre');
              return false;
            }
            return true;
          });
          
          if (property.galleryVideos.length !== originalLength) {
            hasChanges = true;
            console.log(`🧹 Removidos ${originalLength - property.galleryVideos.length} videos corruptos de ${property.title}`);
          }
        }

        // Limpiar video hero corrupto
        if (property.heroVideo && (
          property.heroVideo.startsWith('blob:') || 
          property.heroVideo === '[BLOB_URL_EXPIRED]'
        )) {
          delete property.heroVideo;
          hasChanges = true;
          console.log(`🧹 Removido video hero corrupto de ${property.title}`);
        }
      });
      
      if (hasChanges) {
        localStorage.setItem('baconfort_admin_properties', JSON.stringify(properties));
        console.log('✅ Videos corruptos eliminados del localStorage');
        return properties;
      }
      
      return prevProperties;
    });
    
    return true;
  }, []);

  // Función para forzar sincronización de precios
  const forcePriceSync = useCallback((propertyId = null) => {
    console.log('💰 AdminProvider: Forzando sincronización de precios...', propertyId ? `para ${propertyId}` : 'para todas las propiedades');
    
    // Forzar re-render inmediato
    setLastUpdate(Date.now());
    
    // Disparar evento personalizado para notificar a componentes
    const syncEvent = new CustomEvent('baconfort-prices-synced', {
      detail: { 
        propertyId, 
        timestamp: Date.now(),
        allProperties: propertyId ? null : properties
      }
    });
    window.dispatchEvent(syncEvent);
    
    // También forzar sincronización desde localStorage si es necesario
    setTimeout(() => {
      if (typeof syncFromLocalStorageRef.current === 'function') {
        syncFromLocalStorageRef.current();
      }
    }, 0);
    
    console.log('✅ AdminProvider: Sincronización de precios completada');
    return true;
  }, [properties]);

  const value = {
    // Estado
    isAuthenticated: true,
    isInitialized,
    adminUser: {
      name: 'Administrador BACONFORT',
      email: 'admin@baconfort.com',
      loginTime: Date.now()
    },
    sessionId: 'admin-session-001',
    lastUpdate, // Agregar timestamp para forzar re-renders
    
    // Data para compatibilidad
    data: {
      properties: properties
    },
    
    // Funciones principales
    getProperty,
    getPropertyWithCleanup,
    getAllProperties,
    updateProperty,
    addProperty,
    deleteProperty,
    loadPropertiesFromBackend,
    refreshData,
    logout,
    debugStoredProperties,
    debugLocalStorage,
    cleanupLocalStorageImages,
    cleanupTestProperties,
    cleanCorePropertiesLocalFlags,
    cleanExpiredBlobUrls,
    cleanCorruptedVideos,
    regenerateVideoUrl,
    regeneratePropertyVideoUrls,
    processVideoForGallery,
    processGalleryVideos,
    isVideoFormatSupported,
    getGalleryVideoCompatibilityInfo,
    migratePropertyStructure,
    resetLocalStorageAndReload,
    cleanLocalStorageQuota,
    syncFromLocalStorage,
    forcePriceSync,
    
    // Funciones adicionales
    updatePromotions,
    getPromotions,
    addPromotion,
    deletePromotion,
    resetData,
    forceRefresh,
    reinitializeDataWithBlockFields
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
