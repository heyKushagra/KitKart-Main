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
  console.log('[Shiprocket Client] Starting checkout initiation with cart:', cart);
  
  // 1. Fetch Access Token from our secure backend API
  console.log('[Shiprocket Client] Fetching access token...');
  const response = await fetch('/api/shiprocket/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cart }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Shiprocket Client] Token fetch failed:', response.status, errorText);
    throw new Error(`Failed to generate Shiprocket access token: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const { token } = data;
  console.log('[Shiprocket Client] Access token response:', data);

  if (!token) {
    throw new Error('No token received from backend API');
  }

  // 2. Load the Shiprocket script and styles if not already loaded
  console.log('[Shiprocket Client] Loading assets...');
  await loadShiprocketAssets();
  console.log('[Shiprocket Client] Assets loaded successfully.');

  // 3. Trigger the checkout iframe
  console.log('[Shiprocket Client] Triggering HeadlessCheckout...');
  
  if (typeof window !== 'undefined' && (window as any).HeadlessCheckout) {
    try {
      console.log('[Shiprocket Client] Calling HeadlessCheckout.addToCart...');
      (window as any).HeadlessCheckout.addToCart(
        new Event('click'),
        token, 
        { }, // Removed fallbackUrl to debug live redirect issue
        (callbackEvent: any) => {
          console.log('[Shiprocket Client] Checkout Callback received:', callbackEvent);
        }
      );
      console.log('[Shiprocket Client] HeadlessCheckout.addToCart called successfully.');
    } catch (checkoutErr) {
      console.error('[Shiprocket Client] HeadlessCheckout.addToCart threw an error:', checkoutErr);
      // Removed automatic redirect to let the error display on screen
      const errorMessage = checkoutErr instanceof Error ? checkoutErr.message : String(checkoutErr);
      alert("Shiprocket checkout error: " + errorMessage);
    }
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
      // Always use the registered store domain to prevent domain authorization mismatch (e.g. on localhost)
      hiddenInput.value = 'kitkarttest.vercel.app';
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

    // Set channel to CUSTOM
    (window as any).shiprocketCheckoutChannel = 'CUSTOM';

    // Load checkout script
    const script = document.createElement('script');
    script.id = 'shiprocket-checkout-script';
    script.src = 'https://checkout-ui.shiprocket.com/assets/js/channels/custom.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Shiprocket checkout script'));

    document.body.appendChild(script);
  });
};
