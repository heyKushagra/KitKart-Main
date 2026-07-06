import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import SplashScreen from "@/components/SplashScreen";

export const metadata: Metadata = {
  title: "KitKart – Premium Sports Jerseys | Wear The Game",
  description: "Premium quality sports jerseys crafted for fans who expect more than just merchandise. Shop football, cricket & international jerseys.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (!sessionStorage.getItem('kitkart_splash_shown')) {
                  document.documentElement.style.setProperty('--content-opacity', '0');
                  document.documentElement.classList.add('splash-active');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        <SplashScreen />
        <div id="main-content" style={{ opacity: "var(--content-opacity, 1)", transition: "opacity 0.6s ease-in" }}>
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
