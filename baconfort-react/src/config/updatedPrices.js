
// Precios actualizados desde backend - 2025-07-05T22:20:09.570Z
export const UPDATED_PRICES = {
  "moldes-1680": {
    "daily": 75,
    "weekly": 330,
    "monthly": 700,
    "currency": "USD",
    "_id": "6869a507a8ef4042ea0e8f92"
  },
  "santa-fe-3770": {
    "daily": 80,
    "weekly": 350,
    "monthly": 750,
    "currency": "USD",
    "_id": "6869a509a8ef4042ea0e8fa1"
  },
  "dorrego-1548": {
    "daily": 70,
    "weekly": 320,
    "monthly": 680,
    "currency": "USD",
    "_id": "6869a50ba8ef4042ea0e8fab"
  },
  "convencion-1994": {
    "daily": 90,
    "weekly": 380,
    "monthly": 800,
    "currency": "USD",
    "_id": "6869a50da8ef4042ea0e8fb0"
  },
  "ugarteche-2824": {
    "daily": 95,
    "weekly": 400,
    "monthly": 850,
    "currency": "USD",
    "_id": "6869a50fa8ef4042ea0e8fb5"
  }
};

// Función para convertir precios numéricos a formato string del frontend
export const convertToFrontendFormat = (prices) => {
    if (!prices) return null;
    
    return {
        daily: prices.daily ? `USD ${prices.daily}` : 'N/A',
        weekly: prices.weekly ? `USD ${prices.weekly}` : 'N/A',
        monthly: prices.monthly ? `USD ${prices.monthly}` : 'N/A',
        currency: prices.currency || 'USD'
    };
};

// Precios formateados para el frontend
export const FRONTEND_PRICES = {
    'moldes-1680': {
        daily: 'USD 75',
        weekly: 'USD 330',
        monthly: 'USD 700',
        currency: 'USD'
    },
    'santa-fe-3770': {
        daily: 'USD 80',
        weekly: 'USD 350',
        monthly: 'USD 750',
        currency: 'USD'
    },
    'dorrego-1548': {
        daily: 'USD 70',
        weekly: 'USD 320',
        monthly: 'USD 680',
        currency: 'USD'
    },
    'convencion-1994': {
        daily: 'USD 90',
        weekly: 'USD 380',
        monthly: 'USD 800',
        currency: 'USD'
    },
    'ugarteche-2824': {
        daily: 'USD 95',
        weekly: 'USD 400',
        monthly: 'USD 850',
        currency: 'USD'
    }
};
