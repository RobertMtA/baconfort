const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Property = require('../models/Property');
const Review = require('../models/Review');

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed de la base de datos...');
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baconfort');
    console.log('✅ Conectado a MongoDB');

    // Limpiar datos existentes
    await User.deleteMany({});
    await Property.deleteMany({});
    await Review.deleteMany({});
    console.log('🧹 Datos existentes eliminados');

    // Crear usuarios demo
    const adminUser = new User({
      name: 'Administrador BACONFORT',
      email: 'admin@baconfort.com',
      password: 'admin123',
      role: 'admin',
      emailVerified: true,
      isActive: true
    });

    const guestUser = new User({
      name: 'Usuario Demo',
      email: 'guest@example.com',
      password: 'guest123',
      role: 'guest',
      emailVerified: true,
      isActive: true
    });

    await adminUser.save();
    await guestUser.save();
    console.log('👥 Usuarios demo creados');

    // Crear propiedades
    const properties = [
      {
        id: 'moldes1680',
        title: 'Moldes 1680',
        address: 'Moldes 1680, Buenos Aires',
        description: {
          es: 'Exclusivo departamento de dos ambientes en edificio boutique con amenities premium en Belgrano. Diseño moderno, espacios luminosos y todas las comodidades para una estadía perfecta.',
          en: 'Exclusive two-room apartment in a boutique building with premium amenities in Belgrano. Modern design, bright spaces, and all the comforts for a perfect stay.',
          pt: 'Apartamento exclusivo de dois ambientes em edifício boutique com amenidades premium em Belgrano. Design moderno, espaços luminosos e todas as comodidades para uma estadia perfeita.'
        },
        prices: {
          daily: 65,
          weekly: 350,
          monthly: 1100,
          currency: 'USD'
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
        location: {
          coordinates: { lat: -34.5676, lng: -58.4589 },
          neighborhood: 'Belgrano',
          city: 'Buenos Aires',
          country: 'Argentina'
        },
        capacity: {
          guests: 4,
          bedrooms: 2,
          bathrooms: 1,
          beds: 2
        },
        features: {
          wifi: true,
          airConditioning: true,
          heating: true,
          kitchen: true,
          parking: true,
          pool: true,
          gym: true,
          elevator: true
        },
        priority: 1
      },
      {
        id: 'santafe3770',
        title: 'Santa Fe 3770',
        address: 'Santa Fe 3770, Buenos Aires',
        description: {
          es: 'Moderno departamento de un ambiente en el corazón de Palermo con todas las comodidades necesarias.',
          en: 'Modern one-bedroom apartment in the heart of Palermo with all necessary amenities.',
          pt: 'Apartamento moderno de um ambiente no coração de Palermo com todas as comodidades necessárias.'
        },
        prices: {
          daily: 75,
          weekly: 420,
          monthly: 1300,
          currency: 'USD'
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
            { icon: 'fas fa-wifi', text: 'WiFi Alta Velocidad' },
            { icon: 'fas fa-snowflake', text: 'Aire Acondicionado' }
          ],
          servicios: [
            { icon: 'fas fa-shield-alt', text: 'Seguridad 24hs' },
            { icon: 'fas fa-concierge-bell', text: 'Portería' }
          ],
          amenitiesEdificio: [
            { icon: 'fas fa-dumbbell', text: 'Gimnasio' },
            { icon: 'fas fa-swimming-pool', text: 'Piscina' }
          ]
        },
        location: {
          coordinates: { lat: -34.5847, lng: -58.4140 },
          neighborhood: 'Palermo',
          city: 'Buenos Aires',
          country: 'Argentina'
        },
        capacity: {
          guests: 2,
          bedrooms: 1,
          bathrooms: 1,
          beds: 1
        },
        features: {
          wifi: true,
          airConditioning: true,
          heating: true,
          kitchen: true,
          parking: false,
          pool: true,
          gym: true,
          elevator: true
        },
        priority: 2
      },
      {
        id: 'dorrego1548',
        title: 'Dorrego 1548',
        address: 'Dorrego 1548, Buenos Aires',
        description: {
          es: 'Amplio departamento familiar en Palermo Viejo con espacios únicos.',
          en: 'Spacious family apartment in Palermo Viejo with unique spaces.',
          pt: 'Apartamento familiar espaçoso em Palermo Viejo com espaços únicos.'
        },
        prices: {
          daily: 70,
          weekly: 380,
          monthly: 1150,
          currency: 'USD'
        },
        coverImage: '/img/img-portada-dorrego-1548.jpg',
        heroVideo: '/video/video-portada-dorrego-1548.mp4',
        galleryImages: [
          '/img/img-dorrego1.jpg',
          '/img/img-dorrego2.jpg',
          '/img/img-dorrego3.jpg'
        ],
        amenities: {
          departamento: [
            { icon: 'fas fa-tv', text: 'Smart TV' },
            { icon: 'fas fa-wifi', text: 'WiFi' }
          ],
          servicios: [
            { icon: 'fas fa-shield-alt', text: 'Seguridad' }
          ],
          amenitiesEdificio: []
        },
        location: {
          coordinates: { lat: -34.5820, lng: -58.4200 },
          neighborhood: 'Palermo Viejo',
          city: 'Buenos Aires',
          country: 'Argentina'
        },
        capacity: {
          guests: 4,
          bedrooms: 2,
          bathrooms: 1,
          beds: 2
        },
        features: {
          wifi: true,
          airConditioning: true,
          heating: true,
          kitchen: true,
          parking: false,
          pool: false,
          gym: false,
          elevator: false
        },
        priority: 3
      },
      {
        id: 'convencion1994',
        title: 'Convención 1994',
        address: 'Convención 1994, Buenos Aires',
        description: {
          es: 'Moderno departamento en Palermo con diseño contemporáneo.',
          en: 'Modern apartment in Palermo with contemporary design.',
          pt: 'Apartamento moderno em Palermo com design contemporâneo.'
        },
        prices: {
          daily: 70,
          weekly: 400,
          monthly: 1200,
          currency: 'USD'
        },
        coverImage: '/img/img-portada-convencion-1994.jpg',
        heroVideo: '/video/video-portada-convencion-1994.mp4',
        galleryImages: [
          '/img/img-convencion1.jpg',
          '/img/img-convencion2.jpg'
        ],
        amenities: {
          departamento: [
            { icon: 'fas fa-tv', text: 'Smart TV' },
            { icon: 'fas fa-wifi', text: 'WiFi' }
          ],
          servicios: [
            { icon: 'fas fa-shield-alt', text: 'Seguridad' }
          ],
          amenitiesEdificio: []
        },
        location: {
          coordinates: { lat: -34.5880, lng: -58.4160 },
          neighborhood: 'Palermo',
          city: 'Buenos Aires',
          country: 'Argentina'
        },
        capacity: {
          guests: 3,
          bedrooms: 1,
          bathrooms: 1,
          beds: 1
        },
        features: {
          wifi: true,
          airConditioning: true,
          heating: true,
          kitchen: true,
          parking: false,
          pool: false,
          gym: false,
          elevator: true
        },
        priority: 4
      },
      {
        id: 'ugarteche2824',
        title: 'Ugarteche 2824',
        address: 'Ugarteche 2824, Buenos Aires',
        description: {
          es: 'Elegante departamento en zona premium de Palermo.',
          en: 'Elegant apartment in premium Palermo area.',
          pt: 'Apartamento elegante em área premium de Palermo.'
        },
        prices: {
          daily: 72,
          weekly: 410,
          monthly: 1250,
          currency: 'USD'
        },
        coverImage: '/img/img-portada-ugarteche-2824.jpg',
        heroVideo: '/video/video-portada-ugarteche-2824.mp4',
        galleryImages: [
          '/img/img-ugarteche1.jpg',
          '/img/img-ugarteche2.jpg'
        ],
        amenities: {
          departamento: [
            { icon: 'fas fa-tv', text: 'Smart TV' },
            { icon: 'fas fa-wifi', text: 'WiFi' }
          ],
          servicios: [
            { icon: 'fas fa-shield-alt', text: 'Seguridad' }
          ],
          amenitiesEdificio: []
        },
        location: {
          coordinates: { lat: -34.5900, lng: -58.4100 },
          neighborhood: 'Palermo',
          city: 'Buenos Aires',
          country: 'Argentina'
        },
        capacity: {
          guests: 2,
          bedrooms: 1,
          bathrooms: 1,
          beds: 1
        },
        features: {
          wifi: true,
          airConditioning: true,
          heating: true,
          kitchen: true,
          parking: false,
          pool: false,
          gym: false,
          elevator: true
        },
        priority: 5
      }
    ];

    for (const propertyData of properties) {
      const property = new Property(propertyData);
      await property.save();
    }
    console.log('🏢 Propiedades creadas');

    // Crear algunas reseñas demo
    const reviews = [
      {
        propertyId: 'moldes1680',
        user: guestUser._id,
        guestName: 'María González',
        guestEmail: 'maria@example.com',
        rating: 5,
        comment: 'Excelente departamento, muy bien ubicado y con todas las comodidades. La atención fue perfecta y el edificio cuenta con amenities increíbles.',
        isApproved: true,
        isHighlight: true,
        moderatedBy: adminUser._id,
        moderatedAt: new Date()
      },
      {
        propertyId: 'santafe3770',
        guestName: 'Juan Pérez',
        guestEmail: 'juan@example.com',
        rating: 4,
        comment: 'Muy buen departamento en Palermo. Cómodo y bien equipado.',
        isApproved: true,
        moderatedBy: adminUser._id,
        moderatedAt: new Date()
      }
    ];

    for (const reviewData of reviews) {
      const review = new Review(reviewData);
      await review.save();
    }
    console.log('⭐ Reseñas demo creadas');

    // Actualizar estadísticas de propiedades
    for (const property of await Property.find()) {
      await property.updateReviewStats();
    }
    console.log('📊 Estadísticas actualizadas');

    console.log('✅ Seed completado exitosamente');
    console.log('');
    console.log('👤 Usuarios creados:');
    console.log('   Admin: admin@baconfort.com / admin123');
    console.log('   Usuario: guest@example.com / guest123');
    console.log('');
    console.log('🏢 Propiedades creadas: 5');
    console.log('⭐ Reseñas creadas: 2');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📪 Conexión cerrada');
    process.exit(0);
  }
};

seedDatabase();
