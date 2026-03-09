import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchModal from "@/components/overlays/SearchModal";
import CartDrawer from "@/components/overlays/CartDrawer";
import SmoothScroll from "@/components/providers/SmoothScroll";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SmoothScroll />

      <AnnouncementBar />
      <Header />

      {/* overlays */}
      <SearchModal />
      <CartDrawer />

      <main className="min-h-[60vh]">{children}</main>

      {/* Premium Footer */}
      <Footer />
    </>
  );
}