import { NextRequest, NextResponse } from 'next/server';
import { cerrarSesion } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const resultado = await cerrarSesion();

    if (!resultado.success) {
      return NextResponse.json(
        { success: false, error: resultado.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en API logout:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}