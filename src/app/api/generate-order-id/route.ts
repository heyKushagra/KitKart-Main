import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST() {
  if (!adminDb) {
    return NextResponse.json(
      { success: false, error: 'Firebase Admin not initialized' },
      { status: 500 }
    );
  }

  try {
    const counterRef = adminDb.collection('counters').doc('orderCounter');
    
    const newOrderId = await adminDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(counterRef);
      let nextId = 1001;
      
      if (doc.exists) {
        const data = doc.data();
        if (data && data.lastOrderId) {
          nextId = data.lastOrderId + 1;
        }
      }
      
      transaction.set(counterRef, { lastOrderId: nextId }, { merge: true });
      return nextId;
    });

    return NextResponse.json({ success: true, order_id: newOrderId });
  } catch (error: any) {
    console.error('Error generating order ID:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
