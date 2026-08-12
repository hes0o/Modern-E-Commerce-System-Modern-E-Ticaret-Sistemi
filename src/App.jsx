import { Routes, Route } from "react-router-dom";

import Layout from "./components/layout/Layout";
import AccountLayout from "./components/layout/AccountLayout";

import HomePage from "./pages/HomePage";
import CategoryPage from "./pages/CategoryPage";
import SearchPage from "./pages/SearchPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import FavoritesPage from "./pages/FavoritesPage";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

import ProfilePage from "./pages/ProfilePage";
import AddressesPage from "./pages/AddressesPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";

import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import FaqPage from "./pages/FaqPage";
import {
  KvkkPage,
  DistanceSalesPage,
  ReturnPolicyPage,
  PrivacyPolicyPage,
} from "./pages/LegalPages";

// Rota haritası SRS Bölüm 4'teki 21 sayfayla birebir eşleşir.
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/kategori/:idSlug" element={<CategoryPage />} />
        <Route path="/urun/:idSlug" element={<ProductDetailPage />} />
        <Route path="/arama" element={<SearchPage />} />
        <Route path="/sepet" element={<CartPage />} />
        <Route path="/odeme" element={<CheckoutPage />} />
        <Route path="/siparis-onay/:orderNumber" element={<OrderConfirmationPage />} />

        <Route path="/giris" element={<LoginPage />} />
        <Route path="/uye-ol" element={<RegisterPage />} />
        <Route path="/sifremi-unuttum" element={<ForgotPasswordPage />} />

        <Route element={<AccountLayout />}>
          <Route path="/profil" element={<ProfilePage />} />
          <Route path="/adreslerim" element={<AddressesPage />} />
          <Route path="/siparislerim" element={<OrdersPage />} />
          <Route path="/siparislerim/:id" element={<OrderDetailPage />} />
          <Route path="/favorilerim" element={<FavoritesPage />} />
        </Route>

        <Route path="/iletisim" element={<ContactPage />} />
        <Route path="/hakkimizda" element={<AboutPage />} />
        <Route path="/sss" element={<FaqPage />} />
        <Route path="/kvkk" element={<KvkkPage />} />
        <Route path="/mesafeli-satis-sozlesmesi" element={<DistanceSalesPage />} />
        <Route path="/iade-politikasi" element={<ReturnPolicyPage />} />
        <Route path="/gizlilik-politikasi" element={<PrivacyPolicyPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

function NotFoundPage() {
  return (
    <div className="container-page py-24 text-center">
      <p className="font-display text-2xl">404</p>
      <p className="mt-2 text-sm text-ink-soft">Aradığınız sayfa bulunamadı.</p>
    </div>
  );
}
