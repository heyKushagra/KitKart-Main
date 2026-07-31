import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    // 1. Verify webhook (if secret is configured)
    const webhookSecret = process.env.SHIPROCKET_WEBHOOK_SECRET;
    if (webhookSecret) {
      // Shiprocket sends a custom header, typically x-api-key or x-shiprocket-signature
      const authHeader = request.headers.get('x-api-key');
      if (authHeader !== webhookSecret) {
        console.error('[Shiprocket Webhook] Unauthorized request.');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // 2. Parse payload
    const payload = await request.json();
    console.log('[Shiprocket Webhook] Received payload:', JSON.stringify(payload, null, 2));

    const channelOrderId = payload.channel_order_id || payload.order_ref_id;
    const shipmentId = payload.shipment_id;
    const awbCode = payload.awb || payload.awb_code;
    const courierName = payload.courier_name;
    const currentStatus = payload.current_status || payload.shipment_status;
    const trackingUrl = payload.tracking_url; // if provided

    if (!channelOrderId && !shipmentId) {
      console.warn('[Shiprocket Webhook] Missing both channel_order_id and shipment_id.');
      return NextResponse.json({ error: 'Missing identifiers' }, { status: 400 });
    }

    if (!adminDb) {
      console.error('[Shiprocket Webhook] Firebase Admin not initialized.');
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    // 3. Find order
    let orderDoc = null;

    if (channelOrderId) {
      const channelQuery = await adminDb.collection('orders').where('channel_order_id', '==', String(channelOrderId)).limit(1).get();
      if (!channelQuery.empty) {
        orderDoc = channelQuery.docs[0];
      }
    }

    if (!orderDoc && shipmentId) {
      const shipmentQuery = await adminDb.collection('orders').where('shipment_id', '==', Number(shipmentId)).limit(1).get();
      if (!shipmentQuery.empty) {
        orderDoc = shipmentQuery.docs[0];
      } else {
        // Fallback: sometimes shipmentId is stored as a string
        const shipmentStrQuery = await adminDb.collection('orders').where('shipment_id', '==', String(shipmentId)).limit(1).get();
        if (!shipmentStrQuery.empty) {
          orderDoc = shipmentStrQuery.docs[0];
        }
      }
    }

    if (!orderDoc) {
      console.warn(`[Shiprocket Webhook] Order not found for channelOrderId: ${channelOrderId}, shipmentId: ${shipmentId}`);
      // Returning 200 so Shiprocket doesn't retry endlessly for missing orders
      return NextResponse.json({ success: true, message: 'Order not found, ignored.' }, { status: 200 });
    }

    const orderData = orderDoc.data();

    // 4. Idempotency Check & Update
    const isSameStatus = orderData.shipment_status === currentStatus && orderData.awb_code === awbCode;

    if (isSameStatus) {
      console.log(`[Shiprocket Webhook] Order ${orderDoc.id} already up-to-date with status ${currentStatus}.`);
      return NextResponse.json({ success: true, message: 'Already up-to-date.' }, { status: 200 });
    }

    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };

    if (currentStatus) {
      updatePayload.shiprocket_status = currentStatus;
      updatePayload.shipment_status = currentStatus;
    }
    if (awbCode) updatePayload.awb_code = awbCode;
    if (courierName) updatePayload.courier_name = courierName;
    if (trackingUrl) updatePayload.tracking_url = trackingUrl;

    await orderDoc.ref.update(updatePayload);
    console.log(`[Shiprocket Webhook] Order ${orderDoc.id} updated successfully.`);

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('[Shiprocket Webhook] Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

