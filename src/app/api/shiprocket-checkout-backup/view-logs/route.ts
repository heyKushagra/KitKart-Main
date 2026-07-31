import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export async function GET() {
  try {
    const q = query(
      collection(db, 'shiprocket_api_logs'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    const querySnapshot = await getDocs(q);
    const logs: any[] = [];
    querySnapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error('Failed to fetch logs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
