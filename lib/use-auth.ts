"use client";

import { useEffect, useState } from 'react';
import { useObraStore } from './store';
import { obtenerUsuarioActual, cerrarSesion } from './auth-appwrite';

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { setUsuarioAutenticado, setRolActual, cargarDatosDesdeAppwrite } = useObraStore();

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const resultado = await obtenerUsuarioActual();
        if (!isMounted) return;

        if (resultado.success && resultado.user) {
          setUser(resultado.user);
          setUsuarioAutenticado(resultado.usuario);
          if (resultado.usuario?.rol) {
            setRolActual(resultado.usuario.rol);
          }

          if (typeof document !== 'undefined') {
            document.cookie = `obralogix_session=active; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
          }

          if (resultado.empresa) {
            const empId = resultado.empresa.$id || resultado.empresa.id;
            const empresaFormateada = {
              id: empId,
              nombre: resultado.empresa.nombre,
              tipo: resultado.empresa.tipo || 'electrico',
              ruc: resultado.empresa.ruc || '80000000-1',
              moneda: resultado.empresa.moneda || 'PYG (₲)',
              contacto: resultado.empresa.contacto || resultado.user.email
            };
            useObraStore.setState((state) => ({
              empresas: [empresaFormateada, ...state.empresas.filter(e => e.id !== empId)],
              empresaActual: empresaFormateada,
            }));
            await cargarDatosDesdeAppwrite(empId);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.warn('Verificación de sesión:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [setUsuarioAutenticado, setRolActual, cargarDatosDesdeAppwrite]);

  const logout = async () => {
    try {
      await cerrarSesion();
      setUser(null);
      setUsuarioAutenticado(null);
      setRolActual('admin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return {
    user,
    loading,
    logout,
    isAuthenticated: !!user,
  };
}