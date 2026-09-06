import { NextRequest, NextResponse } from 'next/server';
import { iniciarSesion } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email y contraseña son obligatorios' },
        { status: 400 }
      );
    }

    const resultado = await iniciarSesion({ email, password });

    if (!resultado.success) {
      return NextResponse.json(
        { success: false, error: resultado.error },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: resultado.user,
      usuario: resultado.usuario,
      empresa: resultado.empresa,
    });
  } catch (error) {
    console.error('Error en API login:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}