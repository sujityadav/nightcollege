import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import "./globals.css";
import "./menu.css";

import { StoreProvider } from "../StoreProvider";
import ConditionalLayoutWrapper from "./components/common/ConditionalLayoutWrapper";
// import WebsiteTop from "./components/layout/website/top";


const myroboto = Roboto({
  weight: ['100', '300', '400', '500', '700','900'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Night College, Ichalkaranji",
  keywords:"Night College in ichalkaranji, night college in ichalkaranji, night college in kolhapur, nightich, night mahavidyalaya in ichalkaranji, night colleges in kolhpur ,night college kolhapur district, ichalkaranji colleges, kolhapur district colleges, hatkanangale taluka colleges, colleges in hatkanangale, kolhapur district night colleges, night college in maharashtra, best night colleges, Industrial Estate Ichalkaranji, Night College of Art &amp; Commerece, Ichalkaranji, ichalkaranji best colleges, best night college in ichalkaranji,  Art &amp; Commerece in Ichalkaranji,  ichalkaranji colleges, kolhapur colleges, deshbhakt babasaheb baausaheb khanjire shikshan sanstha&#39;s, khanjire colleges, night colleges",
  description: "The Institute has come into existence as an essential need of the neighborhood society, specially working community in 1983. Accordingly three dimensional HE-Formal, Open (ODL) and Extension mode is offered with utility specialization and entire flexible mobility. As per vision, since last 30 years, the institute has been pursuing to empower the deprived weaker, workers, minority men and woman sections of the society and it has achieved great success by adopting distinctive motto ‘Work is Worship’ The Institute is affiliated to Shivaji university, Kolhapur and is eligible to receive assistance from U.G.C. under section 2F &amp; 12 B of the U.G.C. Act of 1956. The institution achieved “B” Grade in the Re-assessment &amp; accreditation by NAAC in Aug.2016.",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={myroboto.className}>
        {/* <WebsiteTop/> */}
          <StoreProvider>
          <ConditionalLayoutWrapper>{children}</ConditionalLayoutWrapper>
        </StoreProvider>
      </body>
    </html>
  );
}


