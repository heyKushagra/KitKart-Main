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

    // Construct the Shiprocket cart payload.
    // IMPORTANT: In a production scenario, `variant_id` must perfectly match 
    // the synced product variants on Shiprocket's backend via the Catalog Sync API.
    // Since this is a temporary testing integration, we map our existing IDs.
    const shiprocketPayload = {
      cart_data: {
        items: cart.map((item: any) => ({
          variant_id: hashStringToLong(item.id).toString(), // Align with Catalog Sync variant ID
          quantity: item.quantity || 1
        }))
      },
      // The redirect URL when checkout succeeds
      redirect_url: process.env.NEXT_PUBLIC_BASE_URL
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`
        : 'http://localhost:3000/checkout/success',
      timestamp: new Date().toISOString()
    };

    const payloadString = JSON.stringify(shiprocketPayload);

    // Calculate HMAC-SHA256 signature encoded in Base64
    const hmac = crypto
      .createHmac('sha256', apiSecret)
      .update(payloadString)
      .digest('base64');

    // Call Shiprocket Access Token API
    const response = await fetch('https://checkout-api.shiprocket.com/api/v1/access-token/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey, // API Example uses exact key without "Bearer " prefix
        'X-Api-HMAC-SHA256': hmac,
      },
      body: payloadString,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Shiprocket API Error generating token:', errorData);

      // If Shiprocket rejects the request (e.g. invalid keys during testing),
      // we still return a 500 error so the frontend can catch it and fallback.
      return NextResponse.json(
        { error: 'Failed to authenticate with Shiprocket API' },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Based on the Shiprocket documentation, the token lies in data.result.token
    const token = data?.result?.token || data?.token;

    if (!token) {
      throw new Error('Token not found in Shiprocket response');
    }

    return NextResponse.json({ token });
  } catch (error: any) {
    console.error('Shiprocket token API internal error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
