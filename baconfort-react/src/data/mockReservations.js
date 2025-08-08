// Datos de prueba para demostrar fechas ocupadas en el calendario
// Estos datos simulan reservas existentes para cada propiedad

export const mockReservations = {
  'moldes-1680': [
    {
      _id: 'res1',
      propertyId: 'moldes-1680',
      propertyName: 'Moldes 1680',
      checkIn: '2025-07-16',  // ← Cambiado de 12 a 16 para coincidir con admin
      checkOut: '2025-07-18', // ← Esto incluirá 16, 17, 18
      status: 'confirmed',
      createdAt: '2025-07-01T10:00:00Z'
    },
    {
      _id: 'res2',
      propertyId: 'moldes-1680',
      propertyName: 'Moldes 1680',
      checkIn: '2025-07-22',
      checkOut: '2025-07-28',
      status: 'confirmed',
      createdAt: '2025-07-02T14:30:00Z'
    },
    {
      _id: 'res3',
      propertyId: 'moldes-1680',
      propertyName: 'Moldes 1680',
      checkIn: '2025-08-05',
      checkOut: '2025-08-12',
      status: 'pending',
      createdAt: '2025-07-05T09:15:00Z'
    },
    {
      _id: 'res4',
      propertyId: 'moldes-1680',
      propertyName: 'Moldes 1680',
      checkIn: '2025-08-15',
      checkOut: '2025-08-20',
      status: 'confirmed',
      createdAt: '2025-07-08T11:20:00Z'
    },
    {
      _id: 'res5',
      propertyId: 'moldes-1680',
      propertyName: 'Moldes 1680',
      checkIn: '2025-09-02',
      checkOut: '2025-09-08',
      status: 'confirmed',
      createdAt: '2025-07-08T11:20:00Z'
    }
  ],
  'santa-fe-3770': [
    {
      _id: 'res6',
      propertyId: 'santa-fe-3770',
      propertyName: 'Santa Fe 3770',
      checkIn: '2025-07-14',
      checkOut: '2025-07-19',
      status: 'confirmed',
      createdAt: '2025-07-03T16:45:00Z'
    },
    {
      _id: 'res7',
      propertyId: 'santa-fe-3770',
      propertyName: 'Santa Fe 3770',
      checkIn: '2025-07-25',
      checkOut: '2025-07-30',
      status: 'confirmed',
      createdAt: '2025-07-04T11:20:00Z'
    },
    {
      _id: 'res8',
      propertyId: 'santa-fe-3770',
      propertyName: 'Santa Fe 3770',
      checkIn: '2025-08-10',
      checkOut: '2025-08-17',
      status: 'pending',
      createdAt: '2025-07-04T11:20:00Z'
    }
  ],
  'dorrego-1548': [
    {
      _id: 'res9',
      propertyId: 'dorrego-1548',
      propertyName: 'Dorrego 1548',
      checkIn: '2025-07-20',
      checkOut: '2025-07-27',
      status: 'confirmed',
      createdAt: '2025-07-06T13:10:00Z'
    },
    {
      _id: 'res10',
      propertyId: 'dorrego-1548',
      propertyName: 'Dorrego 1548',
      checkIn: '2025-08-01',
      checkOut: '2025-08-05',
      status: 'confirmed',
      createdAt: '2025-07-07T15:30:00Z'
    }
  ],
  'convencion-1994': [
    {
      _id: 'res11',
      propertyId: 'convencion-1994',
      propertyName: 'Convención 1994',
      checkIn: '2025-07-12',
      checkOut: '2025-07-16',
      status: 'confirmed',
      createdAt: '2025-07-08T09:20:00Z'
    },
    {
      _id: 'res12',
      propertyId: 'convencion-1994',
      propertyName: 'Convención 1994',
      checkIn: '2025-07-28',
      checkOut: '2025-08-03',
      status: 'pending',
      createdAt: '2025-07-09T11:45:00Z'
    }
  ],
  'ugarteche-2824': [
    {
      _id: 'res13',
      propertyId: 'ugarteche-2824',
      propertyName: 'Ugarteche 2824',
      checkIn: '2025-07-15',
      checkOut: '2025-07-19',
      status: 'confirmed',
      createdAt: '2025-07-09T12:00:00Z'
    },
    {
      _id: 'res14',
      propertyId: 'ugarteche-2824',
      propertyName: 'Ugarteche 2824',
      checkIn: '2025-08-08',
      checkOut: '2025-08-14',
      status: 'confirmed',
      createdAt: '2025-07-09T12:00:00Z'
    }
  ]
};

// Función para simular la respuesta de la API
export const getMockReservationsForProperty = (propertyId) => {
  return new Promise((resolve) => {
    // Simular delay de red
    setTimeout(() => {
      const reservations = mockReservations[propertyId] || [];
      resolve({
        success: true,
        data: reservations,
        count: reservations.length
      });
    }, 100); // 100ms de delay para simular red (reducido de 500ms)
  });
};

// Función para obtener todas las reservas mock
export const getAllMockReservations = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const allReservations = Object.values(mockReservations).flat();
      resolve({
        success: true,
        data: allReservations,
        count: allReservations.length
      });
    }, 300);
  });
};
