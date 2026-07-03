import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import ProductClient from "./ProductClient";

export async function generateStaticParams() {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    const paths = querySnapshot.docs
      .filter((doc) => doc.data().status !== "Draft")
      .map((doc) => ({
        id: doc.id,
      }));

    // Ensure local products are also included
    const localIds = ["home-jersey-2024", "away-kit-2024", "international-jersey-2024", "training-top-2024"];
    localIds.forEach((id) => {
      if (!paths.some((p) => p.id === id)) {
        paths.push({ id });
      }
    });

    return paths;
  } catch (error) {
    console.warn("Failed to fetch product list from Firestore at build time. Falling back to local products.", error);
    return [
      { id: "home-jersey-2024" },
      { id: "away-kit-2024" },
      { id: "international-jersey-2024" },
      { id: "training-top-2024" }
    ];
  }
}

export default function ProductPage() {
  return <ProductClient />;
}
