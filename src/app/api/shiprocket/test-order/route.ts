import { NextResponse } from 'next/server';
import { createAdhocOrder, ShiprocketOrderPayload } from '@/lib/shiprocket/orders';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Generate a unique order ID for testing to avoid "order ID already exists" errors in Shiprocket
    const testOrderId = `TEST-${Date.now()}`;

    // Formatting date as YYYY-MM-DD HH:MM (e.g., "2026-07-31 02:00")
    const now = new Date();
    const formattedDate = now.toISOString().replace('T', ' ').substring(0, 16);

    const testOrder: ShiprocketOrderPayload = {
      order_id: testOrderId,
      order_date: formattedDate,
      billing_customer_name: 'John',
      billing_last_name: 'Doe',
      billing_address: '123 Test Street, Near Landmark',
      billing_city: 'New Delhi',
      billing_state: 'Delhi',
      billing_country: 'India',
      billing_pincode: '110001',
      billing_phone: '9876543210',
      billing_email: 'john.doe@example.com',
      payment_method: 'Prepaid',
      sub_total: 499.00,
      shipping_is_billing: true,
      order_items: [
        {
          name: 'Test Premium Kit',
          sku: 'SKU-TEST-001',
          units: 1,
          selling_price: '499.00',
        }
      ],
      weight: 0.5,
      length: 15,
      breadth: 10,
      height: 5,
    };

    const response = await createAdhocOrder(testOrder);
    return NextResponse.json({
      success: true,
      message: 'Test order created successfully',
      shiprocketResponse: response
    });
  } catch (error: any) {
    console.error('[Shiprocket Test API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
