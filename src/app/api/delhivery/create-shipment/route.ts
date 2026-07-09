import { NextResponse } from "next/server";
import { DelhiveryClient } from "@/lib/delhivery/client";
import { DelhiveryShipmentRequest } from "@/lib/delhivery/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, customerDetails, products, subtotal, shipping, discount, totalAmount, paymentMethod } = body;

    if (!orderId || !customerDetails || !products) {
      return NextResponse.json({ error: "Missing required order details" }, { status: 400 });
    }

    // Prepare products description
    const productsDesc = products.map((p: any) => `${p.name} (Size: ${p.size}, Qty: ${p.quantity})`).join(", ");

    // Prepare the shipment payload
    const shipmentRequest: DelhiveryShipmentRequest = {
      format: "json",
      data: {
        shipments: [
          {
            name: customerDetails.fullName,
            add: customerDetails.address,
            pin: customerDetails.pincode,
            city: customerDetails.city,
            state: customerDetails.state,
            country: customerDetails.country || "India",
            phone: customerDetails.phone,
            order: orderId, // Our order ID
            payment_mode: paymentMethod === "cod" ? "COD" : "Prepaid",
            
            // Return address (assuming same as pickup for now)
            return_pin: customerDetails.pincode, // Ideally this should be seller's pincode, but falling back
            return_city: customerDetails.city,
            return_phone: process.env.DELHIVERY_SELLER_PHONE || "",
            return_add: customerDetails.address,
            return_state: customerDetails.state,
            return_country: "India",
            
            products_desc: productsDesc,
            cod_amount: paymentMethod === "cod" ? totalAmount : 0,
            order_date: new Date().toISOString(),
            total_amount: totalAmount,
            
            // Seller Details
            seller_add: process.env.DELHIVERY_PICKUP_LOCATION || "",
            seller_name: process.env.DELHIVERY_SELLER_NAME || "KitKart",
            seller_inv: "", // Optional invoice number
            quantity: products.reduce((acc: number, p: any) => acc + p.quantity, 0).toString(),
            
            // Default dimensions & weight if not provided per product
            shipment_width: 10,
            shipment_height: 10,
            shipment_length: 10,
            weight: 500, // in grams
          }
        ],
        pickup_location: {
          name: process.env.DELHIVERY_PICKUP_LOCATION || "KitKart Warehouse",
        }
      }
    };

    const shipmentResponse = await DelhiveryClient.createShipment(shipmentRequest);

    if (shipmentResponse && shipmentResponse.success && shipmentResponse.packages.length > 0) {
      const packageInfo = shipmentResponse.packages[0];
      return NextResponse.json({
        success: true,
        shipment: {
          courier: "Delhivery",
          awb: packageInfo.waybill,
          shipmentId: packageInfo.waybill,
          status: packageInfo.status,
          serviceable: packageInfo.serviceable,
          client: packageInfo.client,
          sortCode: packageInfo.sort_code,
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: shipmentResponse.rmk || shipmentResponse.error || "Failed to create shipment on Delhivery.",
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Delhivery Create Shipment API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
