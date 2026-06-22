import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Contactez-nous",
  description: "Une question sur Verebona ? Contactez notre équipe.",
  alternates: { canonical: 'https://verebona.app/contact' },
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
