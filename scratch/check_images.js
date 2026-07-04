async function checkImages() {
  try {
    const res = await fetch('http://localhost:3000/api/shiprocket/products');
    const data = await res.json();
    if (data?.data?.products) {
      data.data.products.forEach(p => {
        console.log(`Product: ${p.title}`);
        console.log(`Image URL: ${p.image?.src ? p.image.src.substring(0, 100) : 'none'}`);
      });
    }
  } catch (e) {
    console.error(e);
  }
}
checkImages();
