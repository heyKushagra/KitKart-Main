import { NextResponse } from "next/server";
import { DelhiveryClient } from "@/lib/delhivery/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get("pincode");

    if (!pincode) {
      return NextResponse.json({ error: "Pincode is required" }, { status: 400 });
    }

    const serviceability = await DelhiveryClient.checkServiceability(pincode);

    // Delhivery API returns delivery_codes array if pincode is valid
    if (serviceability && serviceability.delivery_codes && serviceability.delivery_codes.length > 0) {
      return NextResponse.json({
        serviceable: true,
        details: serviceability.delivery_codes[0].postal_code,
      });
    } else {
      return NextResponse.json({
        serviceable: false,
        message: "Delivery is not available for this pincode.",
      });
    }
  } catch (error: any) {
    console.error("Delhivery Serviceability API Error:", error);
    return NextResponse.json(
      { error: "Failed to check serviceability", message: error.message },
      { status: 500 }
    );
  }
}
