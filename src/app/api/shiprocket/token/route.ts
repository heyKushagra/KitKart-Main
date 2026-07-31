import { NextResponse } from 'next/server';
import { authenticateShiprocket } from '@/lib/shiprocket/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { token } = await authenticateShiprocket();
    return NextResponse.json({ token });
  } catch (error: any) {
    console.error('[Shiprocket API] Token generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 401 }
    );
  }
}

export async function POST() {
  try {
    const { token } = await authenticateShiprocket();
    return NextResponse.json({ token });
  } catch (error: any) {
    console.error('[Shiprocket API] Token generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 401 }
    );
  }
}
