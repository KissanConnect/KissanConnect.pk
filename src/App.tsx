import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { FirebaseBanner } from './components/FirebaseBanner';
import { DatabaseOfflineBanner } from './components/DatabaseOfflineBanner';

import { HomePage } from './pages/HomePage';
import { WeatherPage } from './pages/WeatherPage';
import { NewsPage } from './pages/NewsPage';
import { SchemesPage } from './pages/SchemesPage';
import { FertilizerPage } from './pages/FertilizerPage';
import { TractorsPage } from './pages/TractorsPage';
import { LearnPage } from './pages/LearnPage';
import { CropDetailPage } from './pages/CropDetailPage';
import { CalendarPage } from './pages/CalendarPage';
import { MarketPage } from './pages/MarketPage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { CreateListingPage } from './pages/CreateListingPage';
import { FarmerDashboardPage } from './pages/FarmerDashboardPage';
import { WholesalerDashboardPage } from './pages/WholesalerDashboardPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { SuggestionPage } from './pages/SuggestionPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Scroll to top helper on navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col bg-[#FFF8E7] text-[#1B1B1B] overflow-x-hidden">
            {/* Small bilingual banner if database connection is down */}
            <DatabaseOfflineBanner />

            {/* Helpful setup banner if Firebase placeholders are present */}
            <FirebaseBanner />

            {/* Top Navigation */}
            <Navbar />

            {/* Main Page Content */}
            <main className="flex-1 pb-16 xl:pb-0">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/weather" element={<WeatherPage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/schemes" element={<SchemesPage />} />
                <Route path="/fertilizer" element={<FertilizerPage />} />
                <Route path="/tractors" element={<TractorsPage />} />
                <Route path="/learn" element={<LearnPage />} />
                <Route path="/learn/:cropId" element={<CropDetailPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/market" element={<MarketPage />} />
                <Route path="/market/:listingId" element={<ListingDetailPage />} />
                <Route path="/create-listing" element={<CreateListingPage />} />
                <Route path="/farmer-dashboard" element={<FarmerDashboardPage />} />
                <Route path="/wholesaler-dashboard" element={<WholesalerDashboardPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/suggestions" element={<SuggestionPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>

            {/* Footer */}
            <Footer />

            {/* Mobile Bottom Thumb Navigation */}
            <MobileBottomNav />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
