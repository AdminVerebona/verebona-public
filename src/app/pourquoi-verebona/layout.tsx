import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Pourquoi Verebona ?",
  description: "Comprendre pourquoi gérer ses biens dans le temps change vraiment quelque chose.",
  alternates: { canonical: 'https://verebona.app/pourquoi-verebona' },
};

export default function PourquoiVerebonaLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
