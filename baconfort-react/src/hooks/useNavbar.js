import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para manejar el estado del navbar responsive
 * @returns {Object} Objeto con estado y funciones para manejar el navbar
 */
export const useNavbar = () => {
  const [navbarOpen, setNavbarOpen] = useState(false);

  // Función para alternar el estado del navbar
  const toggleNavbar = useCallback(() => {
    setNavbarOpen(prev => !prev);
  }, []);

  // Función para cerrar el navbar (útil para enlaces)
  const closeNavbar = useCallback(() => {
    setNavbarOpen(false);
  }, []);

  // Cerrar navbar al hacer clic fuera o presionar Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      const navbar = document.querySelector('.navbar-collapse');
      const toggler = document.querySelector('.navbar-toggler');
      
      if (navbarOpen && navbar && !navbar.contains(event.target) && !toggler?.contains(event.target)) {
        setNavbarOpen(false);
      }
    };

    const handleKeyPress = (event) => {
      if (event.key === 'Escape' && navbarOpen) {
        setNavbarOpen(false);
      }
    };

    if (navbarOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [navbarOpen]);

  return {
    navbarOpen,
    toggleNavbar,
    closeNavbar,
  };
};
