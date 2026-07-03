import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { hashStringToLong } from '@/lib/shiprocket/checkout';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cart } = body;

    const apiKey = process.env.SHIPROCKET_API_KEY;
    const apiSecret = process.env.SHIPROCKET_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error('Shiprocket API Key or Secret Key is not configured in environment variables');
      return NextResponse.json({ error: 'Shiprocket environment variables are not configured' }, { status: 500 });
    }

    // Build the redirect URL based on environment
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Shiprocket requires cart_data and redirect_url in the token payload.
    // variant_id must match the IDs from the Catalog Sync API.
    const payload: any = {
      cart_data: {
        items: cart.map((item: any) => ({
          variant_id: hashStringToLong(item.id), // Must be integer, not string
          quantity: item.quantity || 1
        }))
      },
      redirect_url: `${baseUrl}/checkout/success`,
      timestamp: new Date().toISOString()
    };

    const payloadString = JSON.stringify(payload);

    // Calculate HMAC-SHA256 signature encoded in Base64
    const hmac = crypto
      .createHmac('sha256', apiSecret)
      .update(payloadString)
      .digest('base64');

    console.log('[Shiprocket Debug] Payload:', payloadString);
    console.log('[Shiprocket Debug] HMAC:', hmac);

    // Call Shiprocket Access Token API
    const response = await fetch('https://checkout-api.shiprocket.com/api/v1/access-token/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
        'X-Api-HMAC-SHA256': hmac,
      },
      body: payloadString,
    });

    const responseText = await response.text();
    console.log('[Shiprocket Debug] Response Status:', response.status);
    console.log('[Shiprocket Debug] Response Body:', responseText);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to get Shiprocket checkout token', details: responseText },
        { status: 500 }
      );
    }

    const data = JSON.parse(responseText);

    // Based on Shiprocket docs, token is in data.result.token
    const token = data?.result?.token || data?.token || data?.data?.token;

    if (!token) {
      console.error('[Shiprocket Debug] No token in response:', responseText);
      return NextResponse.json(
        { error: 'Token not found in Shiprocket response', details: responseText },
        { status: 500 }
      );
    }

    console.log('[Shiprocket Debug] Token obtained successfully!');
    return NextResponse.json({ token });
  } catch (error: any) {
    console.error('Shiprocket token API internal error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
