import { NextRequest, NextResponse } from 'next/server';
import { obtenerUsuarioActual } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const resultado = await obtenerUsuarioActual();

    if (!resultado.success) {
      return NextResponse.json(
        { success: false, user: null },
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
    console.error('Error en API me:', error);
    return NextResponse.json(
      { success: false, user: null },
      { status: 500 }
    );
  }
}