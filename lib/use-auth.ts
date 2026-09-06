"use client";

import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useObraStore } from './store';
import { obtenerUsuarioActual } from './auth';

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
            await cargarDatosDesdeSupabase(resultado.empresa.id);
          }
        }
      } catch (error) {
        console.error('Error verificando sesión:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const resultado = await obtenerUsuarioActual();
          if (resultado.success) {
            setUser(resultado.user);
            setUsuarioAutenticado(resultado.usuario);
            
            if (resultado.empresa) {
              await cargarDatosDesdeSupabase(resultado.empresa.id);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUsuarioAutenticado(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setUsuarioAutenticado, cargarDatosDesdeSupabase]);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
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