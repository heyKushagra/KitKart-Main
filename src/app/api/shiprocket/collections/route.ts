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
        endpoint: 'collections',
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
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const skip = (page - 1) * limit;

    // Scan products to compile unique categories (collections)
    const querySnapshot = await getDocs(collection(db, 'products'));
    const uniqueCategories = new Set<string>();

    querySnapshot.forEach((docSnap) => {
      const category = docSnap.data().category;
      if (category) {
        uniqueCategories.add(category);
      }
    });

    // Fallback if no categories are fetched
    if (uniqueCategories.size === 0) {
      uniqueCategories.add('Football');
      uniqueCategories.add('Cricket');
    }

    const categoriesArray = Array.from(uniqueCategories);
    const total = categoriesArray.length;
    const paginatedCategories = categoriesArray.slice(skip, skip + limit);

    const collections = paginatedCategories.map((catName) => {
      const longId = hashStringToLong(catName);

      return {
        id: longId,
        title: catName,
        handle: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        body_html: `<p>Premium ${catName} sports products and jerseys</p>`,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        image: {
          src: 'https://cdn.shopify.com/s/files/1/0005/4838/0009/collections/ipod_nano_8gb.jpg'
        }
      };
    });

    return NextResponse.json({
      data: {
        total,
        collections
      }
    });
  } catch (error: any) {
    console.error('Shiprocket Fetch Collections API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
