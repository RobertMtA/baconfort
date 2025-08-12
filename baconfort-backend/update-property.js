/**
 * Script para actualizar campos específicos de una propiedad
 * Uso: node update-property.js <propertyId> <campo> <valor>
 * 
 * Ejemplos:
 *   - Para bloquear: node update-property.js moldes-1680 isBlocked true
 *   - Para desbloquear: node update-property.js moldes-1680 isBlocked false
 */

const mongoose = require('mongoose');
const Property = require('./models/Property');
require('dotenv').config();

// Conectarse a MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/baconfort';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('📊 MongoDB conectado');
    return true;
  } catch (err) {
    console.error('❌ Error de conexión a MongoDB:', err.message);
    process.exit(1);
  }
};

// Función para convertir strings a sus tipos de datos correspondientes
const convertValue = (value) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (value === 'undefined') return undefined;
  if (!isNaN(value)) return Number(value);
  return value;
};

// Función principal
const updateProperty = async () => {
  // Obtener argumentos
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error('❌ Error: Argumentos insuficientes');
    console.log('Uso: node update-property.js <propertyId> <campo> <valor>');
    console.log('Ejemplos:');
    console.log('  - Para bloquear: node update-property.js moldes-1680 isBlocked true');
    console.log('  - Para desbloquear: node update-property.js moldes-1680 isBlocked false');
    process.exit(1);
  }
  
  const [propertyId, field, rawValue] = args;
  const value = convertValue(rawValue);
  
  try {
    // Conectar a la base de datos
    await connectDB();
    
    // Buscar la propiedad
    const property = await Property.findOne({ id: propertyId });
    
    if (!property) {
      console.error(`❌ Error: No se encontró la propiedad con ID ${propertyId}`);
      process.exit(1);
    }
    
    console.log(`🏠 Propiedad encontrada: ${property.title || property.name} (ID: ${property.id})`);
    console.log(`📊 Valor actual de ${field}: ${property[field]}`);
    
    // Actualizar el campo
    const updateQuery = {};
    updateQuery[field] = value;
    
    // También actualizar campos relacionados si es el campo isBlocked
    if (field === 'isBlocked') {
      if (value === true) {
        updateQuery.blockReason = 'Actualizado por script update-property.js';
        updateQuery.blockedAt = new Date();
      } else {
        updateQuery.blockReason = null;
        updateQuery.blockedAt = null;
      }
    }
    
    // Actualizar en la base de datos
    await Property.updateOne({ id: propertyId }, { $set: updateQuery });
    
    console.log(`✅ Campo ${field} actualizado a: ${value}`);
    
    // Verificar que se aplicó el cambio
    const updatedProperty = await Property.findOne({ id: propertyId });
    console.log(`📊 Nuevo valor de ${field}: ${updatedProperty[field]}`);
    
    // Desconectar de la base de datos
    await mongoose.disconnect();
    console.log('📊 Desconectado de MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Ejecutar la función principal
updateProperty();
