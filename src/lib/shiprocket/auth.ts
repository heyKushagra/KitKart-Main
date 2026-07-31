const BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

export async function authenticateShiprocket(): Promise<{ token: string }> {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error('SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD must be defined in environment variables.');
  }

  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });

  if (!response.ok) {
    let errorMessage = `Shiprocket authentication failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.message) errorMessage = errorData.message;
    } catch (e) {
      // Ignore JSON parse errors if response is not JSON
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();

  if (!data.token) {
    throw new Error('Invalid response from Shiprocket API: Token not found.');
  }

  return { token: data.token };
}
