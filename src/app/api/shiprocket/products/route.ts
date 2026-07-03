import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { hashStringToLong } from '@/lib/shiprocket/checkout';

export async function GET(req: Request) {
  try {
    const apiKeyHeader = req.headers.get('X-Api-Key');
    const expectedApiKey = process.env.SHIPROCKET_API_KEY;

    // Secure the API: Validate API key if configured
    if (expectedApiKey && apiKeyHeader !== expectedApiKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const skip = (page - 1) * limit;

    // Fetch all products from Firestore
    const querySnapshot = await getDocs(collection(db, 'products'));
    const fbProducts: any[] = [];
    querySnapshot.forEach((docSnap) => {
      if (docSnap.data().status !== 'Draft') {
        fbProducts.push({ id: docSnap.id, ...docSnap.data() });
      }
    });

    const total = fbProducts.length;
    const paginatedProducts = fbProducts.slice(skip, skip + limit);

    // Map to Shiprocket JSON Schema
    const products = paginatedProducts.map((p) => {
      const longId = hashStringToLong(p.id);
      const priceVal = (typeof p.price === 'string' ? parseFloat(p.price) : p.price) || 0;
      const imageUrl = p.mainImage || p.image || '';

      return {
        id: longId,
        title: p.name || 'Premium Product',
        body_html: `<p>${p.description || p.name || ''}</p>`,
        vendor: 'KitKart',
        product_type: p.category || 'Jerseys',
        created_at: p.createdAt?.seconds ? new Date(p.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
        updated_at: new Date().toISOString(),
        handle: (p.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        tags: `KitKart, ${p.category || 'Jerseys'}`,
        status: p.status === 'Out of Stock' ? 'archived' : 'active',
        image: {
          src: imageUrl
        },
        variants: [
          {
            id: longId, // Variant ID must also be a unique long
            title: 'Default Title',
            price: priceVal.toFixed(2),
            compare_at_price: (priceVal * 1.2).toFixed(2), // Mock compare price
            sku: p.sku || `KK-${longId}`,
            quantity: p.stock !== undefined ? Number(p.stock) : 10,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            taxable: true,
            weight: p.weight || 0.25,
            weight_unit: 'kg',
            image: {
              src: imageUrl
            }
          }
        ],
        options: [
          {
            name: 'Title',
            values: ['Default Title']
          }
        ]
      };
    });

    return NextResponse.json({
      data: {
        total,
        products
      }
    });
  } catch (error: any) {
    console.error('Shiprocket Fetch Products API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
