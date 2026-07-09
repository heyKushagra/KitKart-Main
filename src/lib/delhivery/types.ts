export interface DelhiveryServiceabilityRequest {
  filter_codes: string; // pincode
}

export interface DelhiveryServiceabilityResponse {
  delivery_codes: Array<{
    postal_code: {
      pin: number;
      pre_paid: string;
      cash: string;
      pickup: string;
      repl: string;
      cod: string;
      sort_code: string;
    };
  }>;
}

export interface DelhiveryShipmentRequest {
  format: "json";
  data: {
    shipments: Array<{
      name: string;
      add: string;
      pin: string;
      city: string;
      state: string;
      country: string;
      phone: string;
      order: string;
      payment_mode: "Prepaid" | "COD";
      return_pin: string;
      return_city: string;
      return_phone: string;
      return_add: string;
      return_state: string;
      return_country: string;
      products_desc: string;
      hsn_code?: string;
      cod_amount: number;
      order_date: string;
      total_amount: number;
      seller_add: string;
      seller_name: string;
      seller_inv?: string;
      quantity: string;
      waybill?: string;
      shipment_width: number;
      shipment_height: number;
      shipment_length: number;
      weight: number;
    }>;
    pickup_location: {
      name: string;
      add?: string;
      city?: string;
      pin?: string;
      country?: string;
      phone?: string;
    };
  };
}

export interface DelhiveryShipmentResponse {
  success: boolean;
  packages: Array<{
    status: string;
    client: string;
    sort_code: string;
    waybill: string;
    cod_amount: number;
    payment: string;
    serviceable: boolean;
    refnum: string; // Order ID
  }>;
  rmk?: string; // Remark or error message
  error?: string; // If api level error
}

export interface DelhiveryTrackRequest {
  waybill: string;
}

export interface DelhiveryTrackResponse {
  ShipmentData: Array<{
    Shipment: {
      AWB: string;
      Status: {
        Status: string;
        StatusDateTime: string;
        Instructions: string;
      };
    };
  }>;
}
