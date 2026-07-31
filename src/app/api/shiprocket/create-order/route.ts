import { NextRequest, NextResponse } from 'next/server';
import { createAdhocOrder, ShiprocketOrderPayload } from '@/lib/shiprocket/orders';

export async function POST(req: NextRequest) {
  try {
    const body: ShiprocketOrderPayload = await req.json();

    const responseData = await createAdhocOrder(body);
    
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('[Shiprocket API] Create Adhoc Order Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
