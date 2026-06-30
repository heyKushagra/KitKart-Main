import { Metadata } from "next";
import CategoriesClient from "./CategoriesClient";

export const metadata: Metadata = {
  title: "Shop Sports Jerseys & Football Boots | KitKart Categories",
  description: "Browse premium sports jerseys and football boots at KitKart. Shop football jerseys, cricket jerseys, custom team jerseys, and performance football boots with fast delivery across India.",
  keywords: "Sports Jerseys, Football Jerseys, Cricket Jerseys, Football Boots, Buy Jerseys Online, Sports Apparel India, Custom Team Jerseys, KitKart",
};

export default function CategoriesPage() {
  return <CategoriesClient />;
}
