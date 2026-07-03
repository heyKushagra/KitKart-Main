async function testVercel() {
  try {
    const res = await fetch('https://kitkarttest.vercel.app/api/shiprocket/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cart: [{ id: 'Swr6B9Ah30oDeGkZ7wCQ', quantity: 1 }]
      })
    });
    console.log('Vercel Token Status:', res.status);
    const data = await res.text();
    console.log('Vercel Token Response:', data);
  } catch (e) {
    console.error(e);
  }
}
testVercel();
