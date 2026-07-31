import { NextResponse } from 'next/server';

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

export async function getShiprocketToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const email = process.env.SHIPROCKET_API_EMAIL;
  const password = process.env.SHIPROCKET_API_PASSWORD;

  if (!email || !password) {
    throw new Error('SHIPROCKET_API_EMAIL or SHIPROCKET_API_PASSWORD is not set');
  }

  const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error('Failed to authenticate with Shiprocket: ' + err);
  }

  const data = await response.json();
  cachedToken = data.token;
  // Token is valid for 10 days, we'll cache it for 9 days to be safe
  tokenExpiresAt = Date.now() + (9 * 24 * 60 * 60 * 1000);
  
  return cachedToken;
}

