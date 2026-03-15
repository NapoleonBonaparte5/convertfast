import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

const HomePage    = lazy(() => import('./pages/HomePage.jsx'));
const AboutPage   = lazy(() => import('./pages/AboutPage.jsx'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage.jsx'));
const TermsPage   = lazy(() => import('./pages/TermsPage.jsx'));
const NotFound    = lazy(() => import('./pages/NotFound.jsx'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      <span className="text-gray-500 text-sm">Cargando...</span>
    </div>
  </div>
);

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"        element={<HomePage />} />
            <Route path="/about"   element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms"   element={<TermsPage />} />
            <Route path="*"        element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
