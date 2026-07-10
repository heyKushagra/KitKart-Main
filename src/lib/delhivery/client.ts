import { DelhiveryServiceabilityResponse, DelhiveryShipmentRequest, DelhiveryShipmentResponse, DelhiveryTrackResponse } from "./types";

export class DelhiveryClient {
  private static getApiToken() {
    const token = process.env.DELHIVERY_API_TOKEN;
    if (!token) {
      throw new Error("Delhivery API token is not configured.");
    }
    return token;
  }

  private static getBaseUrl() {
    return process.env.DELHIVERY_BASE_URL || "https://track.delhivery.com";
  }

  private static getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Token ${this.getApiToken()}`,
    };
  }

  /**
   * Check if a pincode is serviceable by Delhivery
   */
  static async checkServiceability(pincode: string): Promise<DelhiveryServiceabilityResponse> {
    const url = `${this.getBaseUrl()}/c/api/pin-codes/json/?filter_codes=${pincode}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Delhivery API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data as DelhiveryServiceabilityResponse;
  }

  /**
   * Create a shipment in Delhivery
   */
  static async createShipment(request: DelhiveryShipmentRequest): Promise<DelhiveryShipmentResponse> {
    const url = `${this.getBaseUrl()}/api/cmu/create.json`;
    
    // Delhivery expects the request in format `format=json&data={json_string}`
    const formData = new URLSearchParams();
    formData.append("format", "json");
    formData.append("data", JSON.stringify(request.data));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Token ${this.getApiToken()}`,
        "Content-Type": "application/x-www-form-urlencoded", // Required for this endpoint
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error(`Delhivery Create Shipment API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data as DelhiveryShipmentResponse;
  }

  /**
   * Track a shipment by Waybill (AWB)
   */
  static async trackShipment(waybill: string): Promise<DelhiveryTrackResponse> {
    const url = `${this.getBaseUrl()}/api/v1/packages/json/?waybill=${waybill}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Delhivery Track API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data as DelhiveryTrackResponse;
  }
}
