async function test() {
  try {
    const res = await fetch('https://kitkarttest.vercel.app/api/shiprocket/products', {
      headers: {
        'X-Api-Key': 'eifpUTzeesakx5cH'
      }
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text.substring(0, 500)); // Log first 500 chars to avoid huge output
  } catch(e) {
    console.error(e);
  }
}
test();
