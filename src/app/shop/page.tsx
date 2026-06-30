import { Metadata } from "next";
import ShopClient from "./ShopClient";

export const metadata: Metadata = {
  title: "Shop Premium Sports Jerseys Online | Cricket, Football & Custom Jerseys | KitKart",
  description: "Buy premium cricket jerseys, football jerseys, basketball jerseys, esports jerseys, and custom team uniforms online at KitKart. High-quality sportswear, fast shipping, and affordable prices across India.",
  keywords: "Sports Jerseys, Cricket Jersey, Football Jersey, Team Jerseys, Custom Jerseys, Sports Apparel India, Buy Jerseys Online, Premium Jerseys, KitKart",
};

export default function ShopPage() {
  return <ShopClient />;
}
