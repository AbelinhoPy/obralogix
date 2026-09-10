"use client";

import { useEffect, useState } from 'react';
import { account } from './appwrite';
import { useObraStore } from './store';
import { obtenerUsuarioActual, cerrarSesion } from './auth-appwrite';

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { setUsuarioAutenticado, cargarDatosDesdeSupabase } = useObraStore();

  useEffect(() => {
    // Verificar sesión actual
    const checkSession = async () => {
      try {
        const resultado = await obtenerUsuarioActual();
        
        if (resultado.success && resultado.user) {
          setUser(resultado.user);
          setUsuarioAutenticado(resultado.usuario);
          
          // Cargar datos de la empresa si hay una
          if (resultado.empresa) {
            await cargarDatosDesdeSupabase(resultado.empresa.$id);
          }
        }
      } catch (error) {
        console.error('Error verificando sesión:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Nota: Appwrite no tiene un equivalente directo a onAuthStateChange de Supabase
    // En un sistema real, podrías implementar polling o usar webhooks
  }, [setUsuarioAutenticado, cargarDatosDesdeSupabase]);

  const logout = async () => {
    try {
      await cerrarSesion();
      setUser(null);
      setUsuarioAutenticado(null);
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