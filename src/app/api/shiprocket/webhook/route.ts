import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Shiprocket Checkout - Order Success Webhook
 * 
 * This endpoint should be registered in the Shiprocket backend to receive
 * real-time order confirmation details once a user successfully completes
 * a checkout through the Shiprocket iframe.
 */
export async function POST(req: Request) {
  try {
    const orderData = await req.json();

    // Verify the webhook if Shiprocket provides a signature mechanism
    // (Ensure you validate authenticity in a production environment)

    const { order_id, cart_data, status, phone, email, payment_type, total_amount_payable, customer_details } = orderData;

    if (status !== 'SUCCESS' && status !== 'NEW') {
      console.warn('Received Shiprocket webhook with non-success status:', status);
      return NextResponse.json({ message: 'Acknowledged' }, { status: 200 });
    }

    if (order_id) {
      // Insert order details into Firestore/Database
      const orderRef = doc(db, 'orders', String(order_id));
      
      await setDoc(orderRef, {
        shiprocketOrderId: order_id,
        customerDetails: customer_details || {
          email: email || '',
          phone: phone || ''
        },
        products: cart_data?.items || [],
        totalAmount: total_amount_payable || 0,
        paymentMethod: payment_type || 'unknown',
        status: "Processing",
        createdAt: serverTimestamp(),
        rawWebhookData: orderData // store raw data for reference
      }, { merge: true });

      console.log('Successfully received and saved Shiprocket Order Webhook for Order ID:', order_id);
    }
    
    // Always return a 200 OK so Shiprocket knows the webhook was received
    return NextResponse.json({ message: 'Order received successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error processing Shiprocket webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
