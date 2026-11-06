import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AgriSmart AI - Nông Sản Minh Bạch, Mua Bán An Tâm Cùng AI",
  description:
    "AgriSmart AI - Nền tảng kết nối người bán/nông dân với người mua nông sản và trái cây. Hệ thống AI hỗ trợ kiểm tra, phân loại, đóng gói, bảo quản và điều phối giao hàng minh bạch.",
  keywords: [
    "AgriSmart AI",
    "nông sản sạch",
    "trái cây tươi",
    "AI nông nghiệp",
    "truy xuất nguồn gốc",
    "kiểm định chất lượng",
    "đóng gói nông sản",
  ],
  authors: [{ name: "AgriSmart Team" }],
  openGraph: {
    title: "AgriSmart AI - Nông Sản Minh Bạch, Mua Bán An Tâm Cùng AI",
    description: "Nền tảng nông sản + trái cây tích hợp AI kiểm tra và bảo quản.",
    siteName: "AgriSmart AI",
    type: "website",
    locale: "vi_VN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${beVietnam.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
