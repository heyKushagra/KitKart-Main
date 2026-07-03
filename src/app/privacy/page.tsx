import { Metadata } from "next";
import PrivacyPolicyClient from "../privacy-policy/PrivacyPolicyClient";

export const metadata: Metadata = {
  title: "Privacy Policy | KitKart",
  description: "Read the Privacy Policy of KitKart. Learn how we collect, store, protect, and use your personal information when you browse our website or purchase football jerseys.",
};

export default function PrivacyPage() {
  return <PrivacyPolicyClient />;
}
