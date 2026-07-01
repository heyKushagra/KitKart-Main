import { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact KitKart | Customer Support & WhatsApp Assistance",
  description: "Contact KitKart for product inquiries, order support, exchanges, and customer assistance. Reach us by phone, email, or WhatsApp for quick support across India.",
  keywords: [
    "Contact KitKart",
    "KitKart Customer Support",
    "Sports Jersey Support",
    "Football Boots Support",
    "WhatsApp Support",
    "Buy Sports Jerseys India",
    "KitKart Contact"
  ]
};

export default function ContactPage() {
  return <ContactClient />;
}
