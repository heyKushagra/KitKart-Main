import { NextResponse } from 'next/server';

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

    const { order_id, cart_data, status, phone, email, payment_type, total_amount_payable } = orderData;

    if (status !== 'SUCCESS') {
      console.warn('Received Shiprocket webhook with non-success status:', status);
      return NextResponse.json({ message: 'Acknowledged' }, { status: 200 });
    }

    // TODO: Create the order in your backend system
    // 1. Verify inventory logic for the cart items
    // 2. Insert order details into Firestore/Database
    // 3. Send email/SMS notifications if needed

    console.log('Successfully received Shiprocket Order Webhook for Order ID:', order_id);
    
    // Always return a 200 OK so Shiprocket knows the webhook was received
    return NextResponse.json({ message: 'Order received successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error processing Shiprocket webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
