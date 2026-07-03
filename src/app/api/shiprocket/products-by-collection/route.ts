import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { hashStringToLong } from '@/lib/shiprocket/checkout';

export async function GET(req: Request) {
  try {
    const apiKeyHeader = req.headers.get('X-Api-Key');
    const expectedApiKey = process.env.SHIPROCKET_API_KEY;

    // Log the incoming request to Firestore for diagnostics
    try {
      await addDoc(collection(db, 'shiprocket_api_logs'), {
        endpoint: 'products-by-collection',
        timestamp: new Date().toISOString(),
        headers: {
          'x-api-key': apiKeyHeader,
          'host': req.headers.get('host'),
          'user-agent': req.headers.get('user-agent'),
        },
        authorized: expectedApiKey ? apiKeyHeader === expectedApiKey : true,
      });
    } catch (logError) {
      console.error('Failed to log to Firestore:', logError);
    }

    // Secure the API: Validate API key if configured
    if (expectedApiKey && apiKeyHeader !== expectedApiKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const collectionIdParam = searchParams.get('collection_id');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const skip = (page - 1) * limit;

    if (!collectionIdParam) {
      return NextResponse.json({ error: 'Missing collection_id parameter' }, { status: 400 });
    }

    const targetCollectionId = parseInt(collectionIdParam, 10);

    // Fetch products
    const querySnapshot = await getDocs(collection(db, 'products'));
    const fbProducts: any[] = [];
    
    // Track categories to map collection_id back to category name
    const categoryNames = new Set<string>();

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.status !== 'Draft') {
        fbProducts.push({ id: docSnap.id, ...data });
        if (data.category) {
          categoryNames.add(data.category);
        }
      }
    });

    // Find the category matching the collection_id hash
    let matchedCategoryName: string | null = null;
    for (const catName of Array.from(categoryNames)) {
      if (hashStringToLong(catName) === targetCollectionId) {
        matchedCategoryName = catName;
        break;
      }
    }

    // Filter products belonging to this category
    const filteredProducts = matchedCategoryName
      ? fbProducts.filter((p) => p.category === matchedCategoryName)
      : [];

    const total = filteredProducts.length;
    const paginatedProducts = filteredProducts.slice(skip, skip + limit);

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
            id: longId,
            title: 'Default Title',
            price: priceVal.toFixed(2),
            compare_at_price: (priceVal * 1.2).toFixed(2),
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
    console.error('Shiprocket Fetch Products by Collection API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
