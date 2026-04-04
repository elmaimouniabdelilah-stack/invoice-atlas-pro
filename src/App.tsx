import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { InvoiceProvider } from "@/contexts/InvoiceContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import InvoicePage from "./pages/InvoicePage";
import ClientsPage from "./pages/ClientsPage";
import ProductsPage from "./pages/ProductsPage";
import SettingsPage from "./pages/SettingsPage";
import HistoryPage from "./pages/HistoryPage";
import NotFound from "./pages/NotFound";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AuthPage from "./pages/AuthPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <LanguageProvider>
          <AuthProvider>
            <InvoiceProvider>
              <PWAInstallPrompt />
              <BrowserRouter>
                <Routes>
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/invoice" element={<ProtectedRoute><InvoicePage /></ProtectedRoute>} />
                  <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
                  <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                  <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </InvoiceProvider>
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
