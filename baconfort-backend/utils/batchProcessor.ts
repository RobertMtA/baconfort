/**
 * batchProcessor.ts - Utilidad para procesamiento de datos en lotes
 * Previene errores de memoria al dividir grandes conjuntos de datos
 */

/**
 * Función de procesamiento pesado (debes reemplazarla con tu lógica real)
 * @param item Elemento a procesar
 * @returns Elemento procesado
 */
function heavyProcessing<T>(item: T): T {
  // Ejemplo: Transformación compleja del elemento
  // Reemplaza esto con tu lógica real
  return { ...item, processed: true };
}

/**
 * Procesa todos los datos de una vez (puede causar problemas de memoria)
 * @param data Array de datos a procesar
 * @returns Array de datos procesados
 */
export function processAll<T>(data: T[]): T[] {
  if (!Array.isArray(data)) {
    throw new Error('Input must be an array');
  }
  return data.map(item => heavyProcessing(item));
}

/**
 * Procesa datos en lotes para evitar sobrecarga de memoria
 * @param data Array de datos a procesar
 * @param batchSize Tamaño del lote (default: 100)
 * @returns Promise que resuelve con los datos procesados
 */
export async function processInBatches<T>(
  data: T[],
  batchSize: number = 100
): Promise<T[]> {
  if (!Array.isArray(data)) {
    throw new Error('Input must be an array');
  }
  if (batchSize <= 0) {
    throw new Error('Batch size must be greater than 0');
  }

  const results: T[] = [];
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const processedBatch = batch.map(item => heavyProcessing(item));
    results.push(...processedBatch);
    
    // Pausa para permitir que el recolector de basura funcione
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Opcional: Mostrar progreso
    console.log(`Processed ${Math.min(i + batchSize, data.length)}/${data.length} items`);
  }
  
  return results;
}

/**
 * Ejemplo de uso
 */
async function exampleUsage() {
  // Datos de ejemplo (en un caso real, esto podría ser mucho más grande)
  const largeData = Array.from({ length: 1000 }, (_, i) => ({ id: i, value: `item-${i}` }));
  
  try {
    console.time('Batch processing');
    const processedData = await processInBatches(largeData, 50);
    console.timeEnd('Batch processing');
    console.log('Processing completed. Total items:', processedData.length);
  } catch (error) {
    console.error('Error during processing:', error);
  }
}

// Ejecutar ejemplo (opcional)
// exampleUsage();