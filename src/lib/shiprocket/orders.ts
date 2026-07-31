import { authenticateShiprocket } from './auth';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { adminDb } from '@/lib/firebase-admin';

const BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

export interface ShiprocketOrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: string;
  discount?: string;
  tax?: string;
  hsn?: number;
}

export interface ShiprocketOrderPayload {
  order_id: string;
  order_date: string;
  billing_customer_name: string;
  billing_last_name: string;
  billing_address: string;
  billing_address_2?: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  shipping_customer_name?: string;
  shipping_last_name?: string;
  shipping_address?: string;
  shipping_address_2?: string;
  shipping_city?: string;
  shipping_pincode?: string;
  shipping_country?: string;
  shipping_state?: string;
  shipping_email?: string;
  shipping_phone?: string;
  order_items: ShiprocketOrderItem[];
  payment_method: string;
  shipping_charges?: number;
  giftwrap_charges?: number;
  transaction_charges?: number;
  total_discount?: number;
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

export async function createAdhocOrder(orderPayload: ShiprocketOrderPayload) {
  const { token } = await authenticateShiprocket();

  const response = await fetch(`${BASE_URL}/orders/create/adhoc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(orderPayload)
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.message || `Failed to create order: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }

  return data;
}

export function mapFirebaseOrderToShiprocketPayload(orderId: string, orderData: any): ShiprocketOrderPayload {
  const customer = orderData.customerDetails || {};

  // Split fullName into first and last name if needed
  const rawName = (customer.fullName || customer.name || '').trim();
  const nameParts = rawName ? rawName.split(/\s+/) : [];
  const firstName = customer.firstName || nameParts[0] || 'Customer';
  const lastName = customer.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '.');

  // Date formatting: YYYY-MM-DD HH:MM
  let orderDateFormatted = '';
  if (orderData.createdAt?.toDate) {
    orderDateFormatted = orderData.createdAt.toDate().toISOString().replace('T', ' ').substring(0, 16);
  } else if (typeof orderData.createdAt === 'string') {
    orderDateFormatted = orderData.createdAt.replace('T', ' ').substring(0, 16);
  } else {
    orderDateFormatted = new Date().toISOString().replace('T', ' ').substring(0, 16);
  }

  // Map products
  const orderItems: ShiprocketOrderItem[] = (orderData.products || []).map((item: any) => ({
    name: item.name || 'Product',
    sku: item.sku || item.id || `SKU-${item.name}`,
    units: Number(item.quantity) || 1,
    selling_price: String(item.price || 0),
  }));

  // Payment method mapping: "COD" or "Prepaid"
  const method = String(orderData.paymentMethod || '').toLowerCase();
  const payment_method = method === 'cod' ? 'COD' : 'Prepaid';

  return {
    order_id: orderId,
    order_date: orderDateFormatted,
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: customer.address || 'Address',
    billing_city: customer.city || 'City',
    billing_state: customer.state || 'State',
    billing_country: customer.country || 'India',
    billing_pincode: String(customer.pincode || '000000'),
    billing_phone: String(customer.phone || '0000000000'),
    billing_email: customer.email || 'customer@example.com',
    shipping_is_billing: true,
    order_items: orderItems,
    // TEMP TEST: Force COD and ₹899 collectable amount.
    // Revert after Shiprocket dashboard verification.
    payment_method: 'COD',
    sub_total: 899,
    length: orderData.length || 15,
    breadth: orderData.breadth || 10,
    height: orderData.height || 5,
    weight: orderData.weight || 0.5,
  };
}

export async function processShiprocketOrderForDoc(orderId: string, orderDataInput?: any) {
  if (!adminDb) {
    throw new Error('Firebase Admin SDK is not initialized.');
  }

  const orderRef = adminDb.collection('orders').doc(orderId);
  let orderData = orderDataInput;

  if (!orderData) {
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
      throw new Error(`Order ${orderId} not found in Firestore`);
    }
    orderData = orderSnap.data();
  }

  try {
    console.log("Calling Shiprocket...", orderId);
    const payload = mapFirebaseOrderToShiprocketPayload(orderId, orderData);
    const response = await createAdhocOrder(payload);
    console.log("Shiprocket response:", response);

    const updatePayload: any = {
      shiprocket_status: 'Created',
      shiprocket_order_id: response.order_id || null,
      shipment_id: response.shipment_id || null,
      shiprocket_error: null,
      shiprocket_updated_at: new Date().toISOString(),
    };

    if (response.channel_order_id) {
      updatePayload.channel_order_id = response.channel_order_id;
    }

    await orderRef.update(updatePayload);
    return { success: true, response };
  } catch (error: any) {
    const errorMessage = error.message || String(error);
    console.error("Shiprocket error:", error);

    try {
      await orderRef.update({
        shiprocket_status: 'Failed',
        shiprocket_error: errorMessage,
        shiprocket_updated_at: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.error(`[Shiprocket Integration] Failed to save failure status for ${orderId}:`, dbErr);
    }

    return { success: false, error: errorMessage };
  }
}
