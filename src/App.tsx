// Deploy trigger
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import Home from "./pages/Home";
import Sobre from "./pages/Sobre";
import Segmentos from "./pages/Segmentos";
import SegmentoDetalhes from "./pages/SegmentoDetalhes";
import Portfolio from "./pages/Portfolio";
import Contato from "./pages/Contato";
import NotFound from "./pages/NotFound";
import { ServicesProvider } from "./contexts/ServicesContext";
import { PortfolioProvider } from "./contexts/PortfolioContext";
import { AnimationProvider } from "./contexts/AnimationContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { PermissionsProvider } from "./contexts/PermissionsContext";

// Admin
import AdminLayout from "./admin/components/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminPortfolio from "./admin/pages/AdminPortfolio";
import AdminPortfolioForm from "./admin/pages/AdminPortfolioForm";
import AdminLeads from "./admin/pages/AdminLeads";
import AdminSegmentos from "./admin/pages/AdminSegmentos";
import AdminSegmentosForm from "./admin/pages/AdminSegmentosForm";
import AdminConfiguracoes from "./admin/pages/AdminConfiguracoes";
import AdminLogin from "./admin/pages/AdminLogin";
import AdminPerfil from "./admin/pages/AdminPerfil";
import AdminUsuarios from "./admin/pages/AdminUsuarios";
import AdminPermissoes from "./admin/pages/AdminPermissoes";
import AdminHeader from "./admin/pages/AdminHeader";

function App() {
  return (
    <HelmetProvider>
    <SettingsProvider>
    <AnimationProvider>
    <ServicesProvider>
      <PortfolioProvider>
        <PermissionsProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/*"
              element={
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/sobre" element={<Sobre />} />
                      <Route path="/segmentos" element={<Segmentos />} />
                      <Route path="/segmentos/:slug" element={<SegmentoDetalhes />} />
                      <Route path="/portfolio" element={<Portfolio />} />
                      <Route path="/contato" element={<Contato />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                  <WhatsAppButton />
                </div>
              }
            />

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="segmentos" element={<AdminSegmentos />} />
              <Route path="segmentos-seo/novo" element={<AdminSegmentosForm />} />
              <Route path="segmentos-seo/:id/editar" element={<AdminSegmentosForm />} />
              <Route path="portfolio" element={<AdminPortfolio />} />
              <Route path="portfolio/novo" element={<AdminPortfolioForm />} />
              <Route path="portfolio/:id/editar" element={<AdminPortfolioForm />} />
              <Route path="leads" element={<AdminLeads />} />
              <Route path="usuarios" element={<AdminUsuarios />} />
              <Route path="permissoes" element={<AdminPermissoes />} />
              <Route path="configuracoes" element={<AdminConfiguracoes />} />
              <Route path="header" element={<AdminHeader />} />
              <Route path="perfil" element={<AdminPerfil />} />
            </Route>
          </Routes>
          <Toaster position="top-right" />
        </BrowserRouter>
        </PermissionsProvider>
      </PortfolioProvider>
    </ServicesProvider>
    </AnimationProvider>
    </SettingsProvider>
    </HelmetProvider>
  );
}

export default App;
