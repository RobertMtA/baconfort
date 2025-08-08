import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// import App from './App-DEBUGGING'; // DEBUGGING ULTRA SIMPLE ✅ FUNCIONÓ
// import App from './App-PASO1-ROUTER'; // PASO 1: Testing Router ✅ ESTABLE
// import App from './App-PASO2-AUTH-PROVIDER'; // PASO 2: Router + AuthProvider ✅ ESTABLE
// import App from './App-PASO3-FINAL-TEST'; // PASO 3: FINAL TEST - Bucles
// import App from './App-EMERGENCY-NO-ADMIN'; // 🚨 EMERGENCY: SIN AdminProvider ✅ ESTABLE
// import App from './App-TEST-ULTRA-BASIC'; // 🔬 TEST: AdminProvider ULTRA-BÁSICO ✅ ESTABLE
// import App from './App-ULTRA-MINIMAL'; // 🏠 ULTRA-MINIMAL: Sin componentes complejos ✅ ESTABLE
// import App from './App-TEST-HOME-PAGE'; // 🔍 TEST: Agregando Home page ✅ ESTABLE
// import App from './App-TEST-WITH-FOOTER'; // 🔍 TEST: Home + Footer ✅ ESTABLE
import './styles/main.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  // <React.StrictMode> // DESHABILITADO - PUEDE CAUSAR RENDERS DOBLES
    <App />
  // </React.StrictMode>
);