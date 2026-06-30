import { Metadata } from "next";
import ShippingReturnsClient from "./ShippingReturnsClient";

export const metadata: Metadata = {
  title: "Shipping & Returns | KitKart",
  description: "Read KitKart's shipping, exchange, and return policy. Learn about delivery timelines, size exchanges, damaged product exchanges, and important purchase guidelines.",
};

export default function ShippingReturnsPage() {
  return <ShippingReturnsClient />;
}
