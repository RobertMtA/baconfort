import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import SecurityUtils from '../utils/SecurityUtils';
import { propertyAPI, authAPI, promotionsAPI } from '../services/api';

const AdminContext = createContext();

// Datos iniciales (normalmente vendrían de una base de datos)
const initialData = {
  promotions: [], // LIMPIADO - Solo usar datos de la API
  properties: {
    'moldes-1680': {
      id: 'moldes-1680',
      title: 'Moldes 1680',
      address: 'Moldes 1680, Buenos Aires',
      prices: {
        monthly: 'USD 1100',
        weekly: 'USD 350',
        daily: 'USD 65'
      },
      description: {
        es: 'Exclusivo departamento de dos ambientes en edificio boutique con amenities premium en Belgrano. Diseño moderno, espacios luminosos y todas las comodidades para una estadía perfecta.',
        en: 'Exclusive two-room apartment in a boutique building with premium amenities in Belgrano. Modern design, bright spaces, and all the comforts for a perfect stay.',
        pt: 'Apartamento exclusivo de dois ambientes em edifício boutique com amenidades premium em Belgrano. Design moderno, espaços luminosos e todas as comodidades para uma estadia perfeita.'
      },
      coverImage: '/img/img-portada-moldes-1680.jpg',
      heroVideo: '/video/video-portada-moldes-1680.mp4',
      galleryImages: [
        '/img/img-moldes1.jpg',
        '/img/img-moldes2.jpg',
        '/img/img-moldes3.jpg',
        '/img/img-moldes4.jpg',
        '/img/img-moldes5.jpg',
        '/img/img-moldes6.jpg'
      ],
      amenities: {
        departamento: [
          { icon: 'fas fa-tv', text: 'Smart TV 55"' },
          { icon: 'fas fa-wifi', text: 'WiFi 500MB Fibra Óptica' },
          { icon: 'fas fa-snowflake', text: 'Aire Acondicionado F/C' },
          { icon: 'fas fa-door-closed', text: 'Balcón Francés' },
          { icon: 'fas fa-utensils', text: 'Cocina Completa' }
        ],
        servicios: [
          { icon: 'fas fa-shield-alt', text: 'Seguridad 24hs' },
          { icon: 'fas fa-tshirt', text: 'Lavarropas' },
          { icon: 'fas fa-concierge-bell', text: 'Portería' },
          { icon: 'fas fa-car', text: 'Cochera Opcional' }
        ],
        amenitiesEdificio: [
          { icon: 'fas fa-dumbbell', text: 'Gimnasio' },
          { icon: 'fas fa-swimming-pool', text: 'Piscina' },
          { icon: 'fas fa-sun', text: 'Terraza' },
          { icon: 'fas fa-users', text: 'SUM' }
        ]
      },
      reviews: [
        {
          id: '1',
          guestName: 'María González',
          rating: 5,
          comment: 'Excelente departamento, muy bien ubicado y con todas las comodidades. La atención fue perfecta y el edificio cuenta con amenities increíbles.',
          date: '2025-05-15',
          verified: true,
          highlight: true,
          createdAt: '2025-05-16T10:00:00.000Z'
        }
      ],
      // Campos de bloqueo
      isBlocked: false,
      blockReason: null,
      blockedAt: null
    },
    'santa-fe-3770': {
      id: 'santa-fe-3770',
      title: 'Santa Fe 3770',
      address: 'Santa Fe 3770, Buenos Aires',
      prices: {
        monthly: 'USD 1300',
        weekly: 'USD 420',
        daily: 'USD 75'
      },
      description: {
        es: 'Moderno departamento de un ambiente en el corazón de Palermo con todas las comodidades necesarias.',
        en: 'Modern one-bedroom apartment in the heart of Palermo with all necessary amenities.',
        pt: 'Apartamento moderno de um ambiente no coração de Palermo com todas as comodidades necessárias.'
      },
      coverImage: '/img/img-portada-santa-fe-3770.jpg',
      heroVideo: '/video/video-portada-santa-fe-3770.mp4',
      galleryImages: [
        '/img/img-santa-fe1.jpg',
        '/img/img-santa-fe2.jpg',
        '/img/img-santa-fe3.jpg',
        '/img/img-santa-fe4.jpg',
        '/img/img-santa-fe5.jpg'
      ],
      amenities: {
        departamento: [
          { icon: 'fas fa-tv', text: 'Smart TV 50"' },
          { icon: 'fas fa-wifi', text: 'WiFi 300MB Fibra Óptica' },
          { icon: 'fas fa-snowflake', text: 'Aire Acondicionado F/C' },
          { icon: 'fas fa-door-closed', text: 'Balcón' },
          { icon: 'fas fa-utensils', text: 'Cocina Equipada' }
        ],
        servicios: [
          { icon: 'fas fa-shield-alt', text: 'Seguridad 24hs' },
          { icon: 'fas fa-tshirt', text: 'Lavarropas' },
          { icon: 'fas fa-concierge-bell', text: 'Portería' },
          { icon: 'fas fa-broom', text: 'Limpieza Semanal' }
        ],
        amenitiesEdificio: [
          { icon: 'fas fa-dumbbell', text: 'Gimnasio' },
          { icon: 'fas fa-swimming-pool', text: 'Piscina' },
          { icon: 'fas fa-hot-tub', text: 'Jacuzzi' },
          { icon: 'fas fa-sun', text: 'Solarium' }
        ]
      },
      reviews: [
        {
          id: '1',
          guestName: 'Carlos Mendoza',
          rating: 5,
          comment: 'Perfecto para mi estadía en Buenos Aires. El departamento está impecable y la zona de Palermo es ideal para caminar y conocer.',
          date: '2025-06-10',
          verified: true,
          highlight: true,
          createdAt: '2025-06-11T09:30:00.000Z'
        },
        {
          id: '2',
          guestName: 'Ana López',
          rating: 4,
          comment: 'Muy buena ubicación y departamento cómodo. El WiFi funciona perfecto para trabajar remotamente.',
          date: '2025-05-28',
          verified: true,
          highlight: false,
          createdAt: '2025-05-29T14:15:00.000Z'
        }
      ],
      // Campos de bloqueo
      isBlocked: false,
      blockReason: null,
      blockedAt: null
    },
    'dorrego-1548': {
      id: 'dorrego-1548',
      title: 'Dorrego 1548',
      address: 'Dorrego 1548, Buenos Aires',
      prices: {
        monthly: 'USD 1150',
        weekly: 'USD 380',
        daily: 'USD 70'
      },
      description: {
        es: 'Departamento completo en Villa Crespo con excelente ubicación y conectividad.',
        en: 'Complete apartment in Villa Crespo with excellent location and connectivity.',
        pt: 'Apartamento completo em Villa Crespo com excelente localização e conectividade.'
      },
      coverImage: '/img/img-portada-dorrego-1548.jpg',
      heroVideo: '/video/video-portada-dorrego-1548.mp4',
      galleryImages: [
        '/img/img-dorrego1.jpg',
        '/img/img-dorrego2.jpg',
        '/img/img-dorrego3.jpg',
        '/img/img-dorrego4.jpg'
      ],
      amenities: {
        departamento: [
          { icon: 'fas fa-tv', text: 'Smart TV 48"' },
          { icon: 'fas fa-wifi', text: 'WiFi 200MB' },
          { icon: 'fas fa-snowflake', text: 'Aire Acondicionado' },
          { icon: 'fas fa-utensils', text: 'Cocina Completa' },
          { icon: 'fas fa-bed', text: '2 Dormitorios' }
        ],
        servicios: [
          { icon: 'fas fa-shield-alt', text: 'Portero Eléctrico' },
          { icon: 'fas fa-tshirt', text: 'Lavarropas' },
          { icon: 'fas fa-car', text: 'Estacionamiento' },
          { icon: 'fas fa-elevator', text: 'Ascensor' }
        ],
        amenitiesEdificio: [
          { icon: 'fas fa-users', text: 'SUM' },
          { icon: 'fas fa-sun', text: 'Terraza' },
          { icon: 'fas fa-building', text: 'Edificio Moderno' },
          { icon: 'fas fa-lock', text: 'Acceso Seguro' }
        ]
      },
      reviews: [
        {
          id: '1',
          guestName: 'Pedro Martínez',
          rating: 4,
          comment: 'Departamento muy cómodo en Villa Crespo. Buena ubicación y excelente relación precio-calidad.',
          date: '2025-05-20',
          verified: true,
          highlight: false,
          createdAt: '2025-05-21T11:00:00.000Z'
        }
      ],
      // Campos de bloqueo
      isBlocked: false,
      blockReason: null,
      blockedAt: null
    },
    'convencion-1994': {
      id: 'convencion-1994',
      title: 'Convención 1994',
      address: 'Convención 1994, Buenos Aires',
      prices: {
        monthly: 'USD 1200',
        weekly: 'USD 400',
        daily: 'USD 70'
      },
      description: {
        es: 'Exclusivo estudio para dos personas en edificio boutique con amenities premium en Palermo Hollywood.',
        en: 'Exclusive studio for two in a boutique building with premium amenities in Palermo Hollywood.',
        pt: 'Estúdio exclusivo para duas pessoas em edifício boutique com amenidades premium em Palermo Hollywood.'
      },
      coverImage: '/img/img-portada-convencion-1994.jpg',
      heroVideo: '/video/video-portada-convencion-1994.mp4',
      galleryImages: [
        '/img/img-convencion1.jpg',
        '/img/img-convencion2.jpg',
        '/img/img-convencion3.jpg',
        '/img/img-convencion4.jpg'
      ],
      amenities: {
        departamento: [
          { icon: 'fas fa-tv', text: 'Smart TV 32"' },
          { icon: 'fas fa-wifi', text: 'WiFi 300MB Fibra Óptica' },
          { icon: 'fas fa-snowflake', text: 'Aire Acondicionado F/C' },
          { icon: 'fas fa-door-closed', text: 'Balcón con Vista' }
        ],
        servicios: [
          { icon: 'fas fa-shield-alt', text: 'Seguridad 24hs' },
          { icon: 'fas fa-tshirt', text: 'Lavarropas y Laundry' },
          { icon: 'fas fa-concierge-bell', text: 'Recepción' }
        ],
        amenitiesEdificio: [
          { icon: 'fas fa-dumbbell', text: 'Gimnasio' },
          { icon: 'fas fa-swimming-pool', text: 'Piscina Climatizada' },
          { icon: 'fas fa-hot-tub', text: 'Sauna & Jacuzzi' },
          { icon: 'fas fa-sun', text: 'Solarium & Terraza' },
          { icon: 'fas fa-users', text: 'SUM' }
        ]
      },
      reviews: [
        {
          id: '1',
          guestName: 'Lucía Fernández',
          rating: 5,
          comment: 'Excelente estudio en Palermo Hollywood. El edificio boutique tiene amenities increíbles y la ubicación es perfecta.',
          date: '2025-06-05',
          verified: true,
          highlight: true,
          createdAt: '2025-06-06T16:30:00.000Z'
        }
      ],
      // Campos de bloqueo
      isBlocked: false,
      blockReason: null,
      blockedAt: null
    },
    'ugarteche-2824': {
      id: 'ugarteche-2824',
      title: 'Ugarteche 2824',
      address: 'Ugarteche 2824, Buenos Aires',
      prices: {
        monthly: 'USD 1250',
        weekly: 'USD 410',
        daily: 'USD 72'
      },
      description: {
        es: 'Departamento de lujo en Palermo Botánico con vistas espectaculares.',
        en: 'Luxury apartment in Palermo Botánico with spectacular views.',
        pt: 'Apartamento de luxo em Palermo Botânico com vistas espetaculares.'
      },
      coverImage: '/img/img-portada-ugarteche-2824.jpg',
      heroVideo: '/video/video-portada-ugarteche-2824.mp4',
      galleryImages: [
        '/img/img-ugarteche1.jpg',
        '/img/img-ugarteche2.jpg',
        '/img/img-ugarteche3.jpg'
      ],
      amenities: {
        departamento: [
          { icon: 'fas fa-tv', text: 'Smart TV 65"' },
          { icon: 'fas fa-wifi', text: 'WiFi 500MB Fibra Óptica' },
          { icon: 'fas fa-snowflake', text: 'Aire Acondicionado Central' },
          { icon: 'fas fa-door-closed', text: 'Balcón con Vista Panorámica' },
          { icon: 'fas fa-utensils', text: 'Cocina de Lujo' }
        ],
        servicios: [
          { icon: 'fas fa-shield-alt', text: 'Seguridad 24hs' },
          { icon: 'fas fa-concierge-bell', text: 'Concierge' },
          { icon: 'fas fa-car', text: 'Cochera Cubierta' },
          { icon: 'fas fa-broom', text: 'Servicio de Limpieza' }
        ],
        amenitiesEdificio: [
          { icon: 'fas fa-dumbbell', text: 'Gimnasio Premium' },
          { icon: 'fas fa-swimming-pool', text: 'Piscina Infinity' },
          { icon: 'fas fa-hot-tub', text: 'Spa Completo' },
          { icon: 'fas fa-sun', text: 'Deck & Solarium' },
          { icon: 'fas fa-users', text: 'SUM de Lujo' }
        ]
      },
      reviews: [
        {
          id: '1',
          guestName: 'Roberto Silva',
          rating: 5,
          comment: 'Departamento de lujo excepcional en Palermo Botánico. Las vistas son increíbles y los amenities son de primer nivel.',
          date: '2025-06-15',
          verified: true,
          highlight: true,
          createdAt: '2025-06-16T13:45:00.000Z'
        }
      ],
      // Campos de bloqueo
      isBlocked: false,
      blockReason: null,
      blockedAt: null
    }
  }
};

export const AdminProvider = ({ children }) => {
  // Sistema de sesiones múltiples
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false); // Evitar cargas múltiples

  // Generar ID único para la sesión - USAR TOKEN FIJO
  const generateSessionId = () => {
    return 'BACONFORT_ADMIN_2025_7D3F9K2L';
  };

  // Verificar sesión existente al cargar
  useEffect(() => {
    const checkExistingSession = () => {
      const savedSession = localStorage.getItem('baconfort_admin_session');
      const savedUser = localStorage.getItem('baconfort_admin_user');
      
      if (savedSession && savedUser) {
        try {
          const sessionData = JSON.parse(savedSession);
          const userData = JSON.parse(savedUser);
          
          // Verificar que la sesión no haya expirado (24 horas)
          const sessionAge = Date.now() - sessionData.timestamp;
          const maxAge = 24 * 60 * 60 * 1000; // 24 horas
          
          if (sessionAge < maxAge) {
            setSessionId(sessionData.sessionId);
            setAdminUser(userData);
            setIsAuthenticated(true);
            console.log('✅ ADMIN: Sesión restaurada:', sessionData.sessionId);
          } else {
            // Limpiar sesión expirada
            localStorage.removeItem('baconfort_admin_session');
            localStorage.removeItem('baconfort_admin_user');
            console.log('⏰ ADMIN: Sesión expirada, limpiando...');
          }
        } catch (error) {
          console.error('❌ ADMIN: Error restaurando sesión:', error);
          localStorage.removeItem('baconfort_admin_session');
          localStorage.removeItem('baconfort_admin_user');
        }
      }
    };

    checkExistingSession();
  }, []);

  // Sistema de login mejorado
  const login = async (email, password) => {
    try {
      // Autenticación con backend
      try {
        const response = await authAPI.login(email, password);
        if (response.success && response.token) {
          // Guardar token del backend
          localStorage.setItem('baconfort-token', response.token);
          console.log('✅ ADMIN: Autenticación con backend exitosa');
          
          const newSessionId = generateSessionId();
          const userData = {
            email: email,
            name: response.user?.name || 'Administrador',
            loginTime: Date.now()
          };

          // Obtener el token guardado
          const currentToken = localStorage.getItem('baconfort-token');

          // Guardar sesión
          const sessionData = {
            sessionId: newSessionId,
            token: currentToken,
            timestamp: Date.now(),
            userEmail: email
          };

          localStorage.setItem('baconfort_admin_session', JSON.stringify(sessionData));
          localStorage.setItem('baconfort_admin_user', JSON.stringify(userData));

          setSessionId(newSessionId);
          setAdminUser(userData);
          setIsAuthenticated(true);

          console.log('✅ ADMIN: Login exitoso - Sesión:', newSessionId);
          console.log('👤 ADMIN: Usuario:', userData.name);
          
          return true;
        } else {
          console.log('❌ ADMIN: Credenciales inválidas');
          return false;
        }
      } catch (error) {
        console.error('❌ ADMIN: Error en autenticación:', error);
        return false;
      }
    } catch (error) {
      console.error('❌ ADMIN: Error en login:', error);
      return false;
    }
  };

  // Logout mejorado
  const logout = () => {
    console.log('🚪 ADMIN: Cerrando sesión:', sessionId);
    
    // Limpiar localStorage
    localStorage.removeItem('baconfort_admin_session');
    localStorage.removeItem('baconfort_admin_user');
    
    // Limpiar estado
    setSessionId(null);
    setAdminUser(null);
    setIsAuthenticated(false);
    
    console.log('✅ ADMIN: Sesión cerrada exitosamente');
  };

  // Cargar propiedades desde el backend
  const loadPropertiesFromBackend = useCallback(async () => {
    // Evitar cargas múltiples simultáneas
    if (isLoadingProperties) {
      console.log('⏳ ADMIN: Ya hay una carga en progreso, omitiendo...');
      return;
    }

    try {
      setIsLoadingProperties(true);
      setLoading(true);
      
      console.log('🔄 ADMIN: Iniciando carga de propiedades desde backend...');
      
      // Mapeo de IDs: backend → frontend (todos con guiones)
      const backendToFrontendMap = {
        'moldes-1680': 'moldes-1680',
        'santa-fe-3770': 'santa-fe-3770',
        'dorrego-1548': 'dorrego-1548',
        'convencion-1994': 'convencion-1994',
        'ugarteche-2824': 'ugarteche-2824'
      };
      
      // IDs de las propiedades que necesitamos cargar del backend (corregidos con guiones)
      const backendPropertyIds = ['moldes-1680', 'santa-fe-3770', 'dorrego-1548', 'convencion-1994', 'ugarteche-2824'];
      
      for (const backendId of backendPropertyIds) {
        try {
          const response = await propertyAPI.getProperty(backendId);
          if (response.success && response.data) {
            const backendData = response.data;
            
            // Mapear el ID del backend al formato del frontend
            const frontendId = backendToFrontendMap[backendId];
            if (!frontendId) {
              console.warn(`⚠️ ADMIN: No se encontró mapeo para ${backendId}`);
              continue;
            }
            
            // Solo log importante para evitar spam en consola
            if (backendData.title) {
              console.log(`🔄 ADMIN: Mapeando ${backendId} → ${frontendId}`);
            }
            
            // Actualizar solo los datos que vienen del backend (precios, etc.)
            setData(prevData => ({
              ...prevData,
              properties: {
                ...prevData.properties,
                [frontendId]: {
                  ...prevData.properties[frontendId],
                  // Actualizar precios desde el backend, convertir números a strings
                  prices: backendData.prices 
                    ? convertPricesToStrings(backendData.prices)
                    : prevData.properties[frontendId]?.prices,
                  // FORZAR localStorage para amenities de moldes-1680
                  amenities: frontendId === 'moldes-1680' 
                    ? prevData.properties[frontendId]?.amenities || backendData.amenities
                    : backendData.amenities || prevData.properties[frontendId]?.amenities,
                  // Mantener otros datos del frontend pero actualizar con datos del backend si existen
                  title: backendData.title || prevData.properties[frontendId]?.title,
                  address: backendData.address || prevData.properties[frontendId]?.address,
                  description: backendData.description || prevData.properties[frontendId]?.description,
                  status: backendData.status || prevData.properties[frontendId]?.status,
                  isActive: backendData.isActive !== undefined ? backendData.isActive : prevData.properties[frontendId]?.isActive,
                  // Agregar campos de bloqueo desde el backend
                  isBlocked: backendData.isBlocked !== undefined ? backendData.isBlocked : prevData.properties[frontendId]?.isBlocked,
                  blockReason: backendData.blockReason !== undefined ? backendData.blockReason : prevData.properties[frontendId]?.blockReason,
                  blockedAt: backendData.blockedAt !== undefined ? backendData.blockedAt : prevData.properties[frontendId]?.blockedAt
                }
              }
            }));
            
            // Solo log si hay datos nuevos
            if (backendData.title) {
              console.log(`✅ ADMIN: Datos sincronizados para ${frontendId}`);
            }
            
          }
        } catch (error) {
          console.warn(`⚠️ No se pudieron cargar datos para ${backendId}:`, error.message);
        }
      }
      
      // Guardar los datos actualizados en localStorage
      console.log('💾 ADMIN: Guardando datos sincronizados en localStorage...');
      setData(prevData => {
        try {
          localStorage.setItem('baconfort_data', JSON.stringify(prevData));
          console.log('✅ ADMIN: Datos guardados en localStorage exitosamente');
        } catch (error) {
          console.error('❌ ADMIN: Error guardando en localStorage:', error);
        }
        return prevData;
      });
      
    } catch (error) {
      console.error('❌ Error cargando propiedades desde backend:', error);
    } finally {
      setLoading(false);
      setIsLoadingProperties(false);
    }
  }, [isLoadingProperties]); // Dependencias del useCallback

  // Cargar datos al inicializar el contexto SOLO UNA VEZ
  useEffect(() => {
    // Solo cargar si no se ha cargado antes
    if (!isLoadingProperties) {
      loadPropertiesFromBackend();
    }
  }, []); // Sin dependencias para ejecutar solo una vez

  // NO cargar automáticamente cuando se autentica para evitar bucles
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     loadPropertiesFromBackend();
  //   }
  // }, [isAuthenticated, loadPropertiesFromBackend]);

  const updateAndSaveData = (updateFunction) => {
    setData(prevData => {
      const newData = updateFunction(prevData);
      
      
      try {
        // Intentar guardar los datos
        const dataString = JSON.stringify(newData);
        
        // Verificar tamaño antes de guardar
        const sizeInMB = new Blob([dataString]).size / (1024 * 1024);
        
        // Solo log cuando el tamaño sea problemático
        if (sizeInMB > 4) {
          console.log(`💾 SAVE: Tamaño de datos: ${sizeInMB.toFixed(2)}MB`);
        }
        
        if (sizeInMB > 5) { // Limite de 5MB
          console.warn('⚠️ SAVE: Los datos son muy grandes, esto puede causar problemas');
          // Intentar comprimir removiendo datos muy grandes si es necesario
          const compressedData = compressLargeData(newData);
          localStorage.setItem('baconfort_data', JSON.stringify(compressedData));
        } else {
          localStorage.setItem('baconfort_data', dataString);
        }
        
      } catch (error) {
        console.error('❌ SAVE: Error guardando en localStorage:', error);
        if (error.name === 'QuotaExceededError') {
          console.warn('⚠️ STORAGE: Almacenamiento lleno, intentando comprimir automáticamente...');
          
          // Intentar comprimir los datos y guardar de nuevo
          try {
            const compressedData = compressLargeData(newData);
            localStorage.setItem('baconfort_data', JSON.stringify(compressedData));
            console.log('✅ SAVE: Datos comprimidos y guardados exitosamente');
            alert('⚠️ Almacenamiento optimizado automáticamente. Algunas imágenes fueron comprimidas.');
          } catch (compressError) {
            console.error('❌ COMPRESS: Error comprimiendo datos:', compressError);
            alert('⚠️ Almacenamiento lleno. Reduce la cantidad de imágenes o usa imágenes más pequeñas.');
            
            // Como último recurso, limpiar datos viejos
            localStorage.removeItem('baconfort_data');
            alert('🔄 Datos reiniciados por falta de espacio.');
            window.location.reload();
          }
        }
      }
      
      return newData;
    });
  };

  // Función para comprimir datos grandes
  const compressLargeData = (data) => {
    const compressed = { ...data };
    
    // Comprimir videos muy grandes removiéndolos si es necesario
    Object.keys(compressed.properties).forEach(propKey => {
      const prop = compressed.properties[propKey];
      
      // Comprimir videos grandes
      if (prop.heroVideo && prop.heroVideo.startsWith('data:video/')) {
        const videoSize = new Blob([prop.heroVideo]).size;
        if (videoSize > 5 * 1024 * 1024) { // Si el video es > 5MB
          console.warn(`⚠️ COMPRESS: Removiendo video grande de ${propKey}`);
          compressed.properties[propKey] = {
            ...prop,
            heroVideo: '' // Remover video grande
          };
        }
      }
      
      // Comprimir galería de imágenes grandes
      if (prop.galleryImages && Array.isArray(prop.galleryImages)) {
        compressed.properties[propKey] = {
          ...prop,
          galleryImages: prop.galleryImages.map((img, index) => {
            if (typeof img === 'object' && img.src && img.src.startsWith('data:image/')) {
              const imgSize = new Blob([img.src]).size;
              if (imgSize > 1 * 1024 * 1024) { // Si la imagen es > 1MB
                console.warn(`⚠️ COMPRESS: Comprimiendo imagen ${index + 1} de ${propKey}`);
                // Mantener la imagen pero marcarla como que necesita recompresión
                return {
                  ...img,
                  src: img.src, // Mantener por ahora, se podría comprimir más aquí
                  compressed: true
                };
              }
            }
            return img;
          })
        };
      }
    });
    
    return compressed;
  };

  // Función auxiliar para convertir precios de string a número
  const convertPricesToNumbers = (prices) => {
    const result = {};
    
    if (prices.daily) {
      // Extraer solo números de strings como "USD 1500" → 1500
      result.daily = typeof prices.daily === 'string' 
        ? parseInt(prices.daily.replace(/[^\d]/g, '')) || 0
        : prices.daily;
    }
    
    if (prices.weekly) {
      result.weekly = typeof prices.weekly === 'string'
        ? parseInt(prices.weekly.replace(/[^\d]/g, '')) || 0
        : prices.weekly;
    }
    
    if (prices.monthly) {
      result.monthly = typeof prices.monthly === 'string'
        ? parseInt(prices.monthly.replace(/[^\d]/g, '')) || 0
        : prices.monthly;
    }
    
    if (prices.currency) {
      result.currency = prices.currency;
    }
    
    return result;
  };

  // Función auxiliar para convertir precios numéricos del backend a formato string del frontend
  const convertPricesToStrings = (prices) => {
    const result = {};
    
    if (prices.daily !== undefined) {
      result.daily = `USD ${prices.daily}`;
    }
    
    if (prices.weekly !== undefined) {
      result.weekly = `USD ${prices.weekly}`;
    }
    
    if (prices.monthly !== undefined) {
      result.monthly = `USD ${prices.monthly}`;
    }
    
    if (prices.currency) {
      result.currency = prices.currency;
    }
    
    return result;
  };

  const updateProperty = async (propertyId, updates) => {
    
    console.log('🔄 ADMIN updateProperty llamado con:', {
      propertyId: propertyId,
      updates: updates,
      hasIsBlocked: updates.hasOwnProperty('isBlocked')
    });

    // Actualizar datos locales
    setData(prevData => {
      const newData = {
        ...prevData,
        properties: {
          ...prevData.properties,
          [propertyId]: {
            ...prevData.properties[propertyId],
            ...updates
          }
        }
      };
      
      console.log(`💾 ADMIN: Estado local actualizado para ${propertyId}:`, newData.properties[propertyId]);
      
      // Guardar en localStorage
      try {
        localStorage.setItem('baconfort_data', JSON.stringify(newData));
        console.log('💾 ADMIN: Datos guardados en localStorage después de actualizar');
      } catch (error) {
        console.error('❌ ADMIN: Error guardando en localStorage:', error);
      }
      
      return newData;
    });
    
    // Actualizar en el backend si los cambios incluyen precios, descripciones, amenities o estado de bloqueo
    if (updates.prices || updates.description || updates.amenities || updates.hasOwnProperty('isBlocked')) {
      try {
        const token = localStorage.getItem('baconfort-token');
        if (!token) {
          console.error('❌ ADMIN: No hay token JWT disponible para actualizar en backend');
          return;
        }
        console.log('🔐 ADMIN: Token disponible para actualización:', token.substring(0, 20) + '...');
        
        // Mapear ID del frontend al ID del backend (todos con guiones)
        const backendIdMap = {
          'moldes-1680': 'moldes-1680',
          'santa-fe-3770': 'santa-fe-3770',
          'dorrego-1548': 'dorrego-1548',
          'convencion-1994': 'convencion-1994',
          'ugarteche-2824': 'ugarteche-2824'
        };
        
        const backendPropertyId = backendIdMap[propertyId] || propertyId;
        console.log(`🔄 ADMIN: Mapeando ${propertyId} → ${backendPropertyId}`);
        
        // Preparar los datos para enviar al backend
        const backendUpdates = {};
        
        // Actualizar precios si se proporcionaron
        if (updates.prices) {
          console.log(`💰 ADMIN: Actualizando precios para ${propertyId}:`, updates.prices);
          const numericPrices = convertPricesToNumbers(updates.prices);
          console.log('💰 ADMIN: Precios convertidos:', numericPrices);
          backendUpdates.prices = numericPrices;
        }
        
        // Actualizar descripciones si se proporcionaron
        if (updates.description) {
          console.log(`📝 ADMIN: Actualizando descripciones para ${propertyId}:`, updates.description);
          backendUpdates.description = updates.description;
        }
        
        // Actualizar amenities si se proporcionaron
        if (updates.amenities) {
          console.log(`🎯 ADMIN: Actualizando amenities para ${propertyId}:`, updates.amenities);
          backendUpdates.amenities = updates.amenities;
        }
        
        // Actualizar estado de bloqueo si se proporcionó
        if (updates.hasOwnProperty('isBlocked')) {
          console.log(`🔒 ADMIN: Actualizando estado de bloqueo para ${propertyId}:`, updates.isBlocked);
          backendUpdates.isBlocked = updates.isBlocked;
          if (updates.blockReason !== undefined) {
            backendUpdates.blockReason = updates.blockReason;
          }
          if (updates.blockedAt !== undefined) {
            backendUpdates.blockedAt = updates.blockedAt;
          }
        }
        
        await propertyAPI.updateProperty(backendPropertyId, backendUpdates);
        console.log(`✅ Datos actualizados en backend para ${backendPropertyId}:`, backendUpdates);
        
        // TEMPORALMENTE COMENTADO: Esto sobrescribe los cambios locales
        // Refrescar los datos desde el backend para sincronizar
        // console.log('🔄 ADMIN: Refrescando datos desde backend...');
        // await loadPropertiesFromBackend();
        // console.log('✅ ADMIN: Datos sincronizados con backend');
        
      } catch (error) {
        console.error(`❌ Error actualizando datos en backend para ${propertyId}:`, error);
      }
    }
    
    // updateProperty completado
  };

  const getProperty = (propertyId) => {
    return data.properties[propertyId];
  };

  const getAllProperties = () => {
    return data.properties;
  };

  // Estado para promociones de la base de datos
  const [promotions, setPromotions] = useState([]);
  const [loadingPromotions, setLoadingPromotions] = useState(true);

  // Cargar promociones desde la API
  const loadPromotions = async () => {
    try {
      setLoadingPromotions(true);
      const response = await promotionsAPI.getAll({ active: 'all' }); // Obtener todas, activas e inactivas
      setPromotions(response.data || []);
    } catch (error) {
      console.error('❌ Error al cargar promociones:', error);
      setPromotions([]);
    } finally {
      setLoadingPromotions(false);
    }
  };

  // Cargar promociones al inicializar
  useEffect(() => {
    loadPromotions();
  }, []);

  // Funciones para promociones
  const getPromotions = () => {
    return promotions || [];
  };

  const updatePromotion = async (promotionId, updates) => {
    try {
      const response = await promotionsAPI.update(promotionId, updates);
      if (response.success) {
        setPromotions(prev => prev.map(promo => 
          promo._id === promotionId ? { ...promo, ...response.data } : promo
        ));
        return response.data;
      }
    } catch (error) {
      console.error('❌ Error al actualizar promoción:', error);
      throw error;
    }
  };

  const addPromotion = async (newPromotion) => {
    try {
      const response = await promotionsAPI.create(newPromotion);
      if (response.success) {
        setPromotions(prev => [...prev, response.data]);
        return response.data._id;
      }
    } catch (error) {
      console.error('❌ Error al crear promoción:', error);
      throw error;
    }
  };

  const deletePromotion = async (promotionId) => {
    try {
      const response = await promotionsAPI.delete(promotionId);
      if (response.success) {
        setPromotions(prev => prev.filter(promo => promo._id !== promotionId));
        return true;
      }
    } catch (error) {
      console.error('❌ Error al eliminar promoción:', error);
      throw error;
    }
  };

  const togglePromotionStatus = async (promotionId) => {
    try {
      const response = await promotionsAPI.toggleStatus(promotionId);
      if (response.success) {
        setPromotions(prev => prev.map(promo => 
          promo._id === promotionId ? { ...promo, ...response.data } : promo
        ));
        return response.data;
      }
    } catch (error) {
      console.error('❌ Error al cambiar estado de promoción:', error);
      throw error;
    }
  };

  const reorderPromotions = async (promotionId, newPriority) => {
    try {
      const response = await promotionsAPI.updatePriority(promotionId, newPriority);
      if (response.success) {
        setPromotions(prev => prev.map(promo => 
          promo._id === promotionId ? { ...promo, priority: newPriority } : promo
        ));
        return response.data;
      }
    } catch (error) {
      console.error('❌ Error al reordenar promoción:', error);
      throw error;
    }
  };

  const addReview = (propertyId, newReview) => {
    console.log('🌟 ADMIN CONTEXT: Agregando nueva reseña de huésped:', { propertyId, newReview });
    
    updateAndSaveData(prevData => {
      const property = prevData.properties[propertyId];
      
      if (!property) {
        console.error('❌ ADMIN CONTEXT: Propiedad no encontrada:', propertyId);
        return prevData;
      }

      const currentReviews = property.reviews || [];
      const updatedReviews = [...currentReviews, newReview];

      console.log('✅ ADMIN CONTEXT: Reseña agregada exitosamente');
      
      return {
        ...prevData,
        properties: {
          ...prevData.properties,
          [propertyId]: {
            ...property,
            reviews: updatedReviews
          }
        }
      };
    });
  };

  const moderateReview = (propertyId, reviewId, action) => {
    console.log('🔍 ADMIN CONTEXT: Moderando reseña:', { propertyId, reviewId, action });
    
    updateAndSaveData(prevData => {
      const property = prevData.properties[propertyId];
      
      if (!property) {
        console.error('❌ ADMIN CONTEXT: Propiedad no encontrada:', propertyId);
        return prevData;
      }

      const updatedReviews = property.reviews.map(review => {
        if (review.id === reviewId) {
          if (action === 'approve') {
            return { ...review, verified: true, status: 'approved' };
          } else if (action === 'reject') {
            return { ...review, verified: false, status: 'rejected' };
          }
        }
        return review;
      });

      console.log('✅ ADMIN CONTEXT: Reseña moderada exitosamente');
      
      return {
        ...prevData,
        properties: {
          ...prevData.properties,
          [propertyId]: {
            ...property,
            reviews: updatedReviews
          }
        }
      };
    });
  };

  const deleteReview = (propertyId, reviewId) => {
    console.log('🗑️ ADMIN CONTEXT: Eliminando reseña:', { propertyId, reviewId });
    
    updateAndSaveData(prevData => {
      const property = prevData.properties[propertyId];
      
      if (!property) {
        console.error('❌ ADMIN CONTEXT: Propiedad no encontrada:', propertyId);
        return prevData;
      }

      const updatedReviews = property.reviews.filter(review => review.id !== reviewId);

      console.log('✅ ADMIN CONTEXT: Reseña eliminada exitosamente');
      
      return {
        ...prevData,
        properties: {
          ...prevData.properties,
          [propertyId]: {
            ...property,
            reviews: updatedReviews
          }
        }
      };
    });
  };

  const resetData = () => {
    console.log('🔄 ADMIN: Reiniciando datos y limpiando localStorage...');
    localStorage.removeItem('baconfort_data');
    setData(initialData);
    // Recargar datos desde backend después de limpiar
    setTimeout(() => {
      loadPropertiesFromBackend();
    }, 100);
  };

  // Función utilitaria para reinicializar datos con campos de bloqueo
  const reinitializeDataWithBlockFields = () => {
    console.log('🔄 ADMIN: Reinicializando datos con campos de bloqueo...');
    
    // Limpiar localStorage
    localStorage.removeItem('baconfort_data');
    localStorage.removeItem('baconfort-admin-data');
    
    // Forzar recarga de datos iniciales
    setData(initialData);
    
    // Guardar en localStorage
    const dataToSave = JSON.stringify(initialData);
    localStorage.setItem('baconfort_data', dataToSave);
    
    console.log('✅ ADMIN: Datos reinicializados con campos de bloqueo');
    
    // Verificar que los campos están presentes
    Object.values(initialData.properties).forEach(prop => {
      console.log(`🔍 ${prop.id}: isBlocked = ${prop.isBlocked} (${typeof prop.isBlocked})`);
    });
  };

  // Cargar datos guardados al inicializar
  useEffect(() => {
    // Cargar datos desde localStorage si existen
    
    try {
      const savedData = localStorage.getItem('baconfort_data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Datos cargados desde localStorage
        
        // Verificar que los datos son válidos y no están duplicados
        if (parsedData.properties && typeof parsedData.properties === 'object') {
          const propertyIds = Object.keys(parsedData.properties);
          const duplicateIds = propertyIds.filter(id => 
            (id.includes('moldes') && propertyIds.some(otherId => otherId !== id && otherId.includes('moldes'))) ||
            (id.includes('santa') && propertyIds.some(otherId => otherId !== id && otherId.includes('santa'))) ||
            (id.includes('dorrego') && propertyIds.some(otherId => otherId !== id && otherId.includes('dorrego'))) ||
            (id.includes('convencion') && propertyIds.some(otherId => otherId !== id && otherId.includes('convencion'))) ||
            (id.includes('ugarteche') && propertyIds.some(otherId => otherId !== id && otherId.includes('ugarteche')))
          );
          
          if (duplicateIds.length > 0) {
            console.warn('⚠️ ADMIN CONTEXT: Detectados datos duplicados, reiniciando...', duplicateIds);
            localStorage.removeItem('baconfort_data');
            setData(initialData);
          } else {
            setData(parsedData);
          }
        } else {
          console.warn('⚠️ ADMIN CONTEXT: Datos corruptos, usando datos iniciales');
          setData(initialData);
        }
      } else {
        console.log('📝 ADMIN CONTEXT: No hay datos en localStorage, usando datos iniciales');
        setData(initialData);
      }
    } catch (error) {
      console.error('❌ ADMIN CONTEXT: Error cargando datos:', error);
      console.log('🔄 ADMIN CONTEXT: Reiniciando con datos iniciales...');
      
      // Limpiar localStorage corrupto y usar datos iniciales
      localStorage.removeItem('baconfort_data');
      setData(initialData);
    }
  }, []);

  // Verificar y agregar campos de bloqueo si faltan
  useEffect(() => {
    console.log('🔍 ADMIN: Verificando campos de bloqueo...');
    
    const properties = data.properties;
    let needsUpdate = false;
    
    Object.values(properties).forEach(property => {
      if (property.isBlocked === undefined) {
        console.log(`⚠️ ADMIN: Falta campo isBlocked en ${property.id}`);
        needsUpdate = true;
      }
    });
    
    if (needsUpdate) {
      console.log('🔧 ADMIN: Agregando campos de bloqueo faltantes...');
      
      setData(prevData => {
        const updatedProperties = {};
        
        Object.entries(prevData.properties).forEach(([id, property]) => {
          updatedProperties[id] = {
            ...property,
            isBlocked: property.isBlocked !== undefined ? property.isBlocked : false,
            blockReason: property.blockReason !== undefined ? property.blockReason : null,
            blockedAt: property.blockedAt !== undefined ? property.blockedAt : null
          };
        });
        
        const newData = {
          ...prevData,
          properties: updatedProperties
        };
        
        // Guardar en localStorage
        try {
          localStorage.setItem('baconfort_data', JSON.stringify(newData));
          console.log('✅ ADMIN: Campos de bloqueo agregados y guardados');
        } catch (error) {
          console.error('❌ ADMIN: Error guardando campos de bloqueo:', error);
        }
        
        return newData;
      });
    } else {
      console.log('✅ ADMIN: Todos los campos de bloqueo están presentes');
    }
  }, []); // Ejecutar solo una vez al montar

  // Función para refrescar completamente el estado
  const forceRefresh = async () => {
    console.log('🔄 ADMIN: Refrescando completamente el estado...');
    setLoading(true);
    
    try {
      // Recargar propiedades
      await loadPropertiesFromBackend();
      
      // Recargar promociones
      await loadPromotions();
      
      console.log('✅ ADMIN: Estado refrescado completamente');
      return true;
    } catch (error) {
      console.error('❌ ADMIN: Error al refrescar estado:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    sessionId,
    adminUser,
    login,
    logout,
    data,
    updateProperty,
    getProperty,
    getAllProperties,
    getPromotions,
    updatePromotion,
    addPromotion,
    deletePromotion,
    togglePromotionStatus,
    reorderPromotions,
    loadPromotions,
    promotions,
    loadingPromotions,
    addReview,
    moderateReview,
    deleteReview,
    loading,
    setLoading,
    loadPropertiesFromBackend,
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
