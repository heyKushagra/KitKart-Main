async function test() {
  try {
    // Step 1: Fetch products from our API to see the variant IDs
    console.log('--- Fetching products from local API ---');
    const res = await fetch('http://localhost:3000/api/shiprocket/products', {
      headers: { 'X-Api-Key': 'eifpUTzeesakx5cH' }
    });
    const data = await res.json();
    
    if (data?.data?.products) {
      console.log('Total products:', data.data.total);
      data.data.products.forEach(p => {
        console.log(`\nProduct: ${p.title}`);
        console.log(`  Product ID: ${p.id}`);
        if (p.variants) {
          p.variants.forEach(v => {
            console.log(`  Variant ID: ${v.id}, Title: ${v.title}, Price: ${v.price}`);
          });
        }
      });
    }

    // Step 2: Test token with one of the actual variant IDs from our catalog
    if (data?.data?.products?.[0]?.variants?.[0]) {
      const variantId = data.data.products[0].variants[0].id;
      console.log(`\n--- Testing token with variant_id: ${variantId} ---`);
      
      const tokenRes = await fetch('http://localhost:3000/api/shiprocket/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: [{ id: 'Swr6B9Ah30oDeGkZ7wCQ', quantity: 1 }]
        })
      });
      const tokenData = await tokenRes.text();
      console.log('Status:', tokenRes.status);
      console.log('Response:', tokenData);
    }
  } catch (e) {
    console.error(e);
  }
}
test();
