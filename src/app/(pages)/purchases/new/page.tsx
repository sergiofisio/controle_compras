import { Metadata } from "next";
import { NewPurchasePageClient } from "../NewPurchasePageClient";

export const metadata: Metadata = {
  title: "Nova Compra",
  description: "Registre uma nova compra no sistema.",
};

export default function NewPurchasePage() {
  return <NewPurchasePageClient />;
}
