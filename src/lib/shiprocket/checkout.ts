// Helper to convert Firestore string ID to a stable 32-bit positive integer
export function hashStringToLong(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}


export const initiateShiprocketCheckout = async (cart: any[]) => {
  // 1. Fetch Access Token from our secure backend API
  const response = await fetch('/api/shiprocket/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cart }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate Shiprocket access token');
  }

  const { token } = await response.json();

  if (!token) {
    throw new Error('No token received from backend');
  }

  // 2. Load the Shiprocket script and styles if not already loaded
  await loadShiprocketAssets();

  // 3. Trigger the checkout iframe
  const fallbackUrl = window.location.origin + '/checkout';
  
  if (typeof window !== 'undefined' && (window as any).HeadlessCheckout) {
    // The HeadlessCheckout.addToCart expects an event as first argument.
    // We pass a synthetic event to satisfy it.
    (window as any).HeadlessCheckout.addToCart(
      new Event('click'),
      token, 
      { fallbackUrl }
    );
  } else {
    throw new Error('Shiprocket HeadlessCheckout script not found');
  }
};

const loadShiprocketAssets = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if script already exists to prevent duplicate loading
    if (document.getElementById('shiprocket-checkout-script')) {
      resolve();
      return;
    }

    // Inject hidden input for seller domain (required by Shiprocket JS)
    if (!document.getElementById('sellerDomain')) {
      const hiddenInput = document.createElement('input');
      hiddenInput.type = 'hidden';
      hiddenInput.value = window.location.hostname; // e.g. "www.example.com"
      hiddenInput.id = 'sellerDomain';
      document.body.appendChild(hiddenInput);
    }

    // Load stylesheet
    if (!document.getElementById('shiprocket-checkout-style')) {
      const link = document.createElement('link');
      link.id = 'shiprocket-checkout-style';
      link.rel = 'stylesheet';
      link.href = 'https://checkout-ui.shiprocket.com/assets/styles/shopify.css';
      document.head.appendChild(link);
    }

    // Load checkout script
    const script = document.createElement('script');
    script.id = 'shiprocket-checkout-script';
    script.src = 'https://checkout-ui.shiprocket.com/assets/js/channels/shopify.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Shiprocket checkout script'));

    document.body.appendChild(script);
  });
};
