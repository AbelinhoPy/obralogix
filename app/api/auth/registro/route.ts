import { NextRequest, NextResponse } from 'next/server';
import { registrarUsuario } from '@/lib/auth-appwrite';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { email, password, nombre, nombreEmpresa, ruc, tipoEmpresa, plan } = body;
    
    if (!email || !password || !nombre || !nombreEmpresa || !plan) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    const resultado = await registrarUsuario({
      email,
      password,
      nombre,
      nombreEmpresa,
      ruc,
      tipoEmpresa: tipoEmpresa || 'electrico',
      plan,
    });

    if (!resultado.success) {
      return NextResponse.json(
        { success: false, error: resultado.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: resultado.user,
      empresa: resultado.empresa,
      usuario: resultado.usuario,
    });
  } catch (error) {
    console.error('Error en API registro:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}