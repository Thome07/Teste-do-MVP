import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CASA ALMA — vestir também é sentir",
  description: "Peças atemporais, feitas para acompanhar a sua vida. Conheça a nova coleção CASA ALMA.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
