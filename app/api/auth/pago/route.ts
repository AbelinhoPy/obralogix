import { NextRequest, NextResponse } from 'next/server';
import { procesarPago } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { metodoPago, plan, monto, empresaId } = body;
    
    if (!metodoPago || !plan || !monto || !empresaId) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    const resultado = await procesarPago(
      { metodoPago, plan, monto },
      empresaId
    );

    if (!resultado.success) {
      return NextResponse.json(
        { success: false, error: resultado.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      pago: resultado.pago,
    });
  } catch (error) {
    console.error('Error en API pago:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}