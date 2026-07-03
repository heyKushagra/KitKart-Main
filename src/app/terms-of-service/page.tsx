import { Metadata } from "next";
import TermsOfServiceClient from "./TermsOfServiceClient";

export const metadata: Metadata = {
  title: "Terms of Service | KitKart",
  description: "Read the Terms of Service for KitKart. Find information on store purchases, service conditions, copyright, user guidelines, and operational procedures.",
};

export default function TermsOfServicePage() {
  return <TermsOfServiceClient />;
}
