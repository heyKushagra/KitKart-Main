const crypto = require('crypto');

const apiKey = 'eifpUTzeesakx5cH';
const apiSecret = 'MvONXMzJ9YPnd4tgPi1vWCJn3KWU5vmL';

// Test with full product details in the cart items
const payload = {
  cart_data: {
    items: [
      {
        variant_id: 853942153,
        quantity: 1,
        name: "Etihad Premium Jersey",
        price: 1299.00,
        selling_price: 1299.00,
        sku: "KK-853942153",
        image_url: "https://kitkarttest.vercel.app/images/etihad.jpg"
      }
    ]
  },
  redirect_url: "https://kitkarttest.vercel.app/checkout/success",
  timestamp: new Date().toISOString()
};

const payloadString = JSON.stringify(payload);

const hmac = crypto
  .createHmac('sha256', apiSecret)
  .update(payloadString)
  .digest('base64');

async function test() {
  const response = await fetch('https://checkout-api.shiprocket.com/api/v1/access-token/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
      'X-Api-HMAC-SHA256': hmac,
    },
    body: payloadString,
  });
  
  const text = await response.text();
  console.log('Status:', response.status);
  console.log('Response:', text);
}

test();
