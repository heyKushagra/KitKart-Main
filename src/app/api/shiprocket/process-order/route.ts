import { NextRequest, NextResponse } from 'next/server';
import { processShiprocketOrderForDoc } from '@/lib/shiprocket/orders';

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'orderId is required' }, { status: 400 });
    }

    const result = await processShiprocketOrderForDoc(orderId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Shiprocket Process Order API Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
