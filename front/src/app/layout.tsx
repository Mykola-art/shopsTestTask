import type { Metadata } from "next";
import '../styles/global.scss';
import {AuthProvider} from "@/context/AuthContext";
import Header from "@/components/header/Header";
import {ToastContainer} from "react-toastify";

export const metadata: Metadata = {
  title: "Stores App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
            <ToastContainer position='top-center'/>
            <Header/>
            {children}
        </AuthProvider>
      </body>
    </html>
  );
}
