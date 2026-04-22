import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/contexts/SettingsContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import TransactionsPage from "./pages/TransactionsPage.tsx";
import ReportPage from "./pages/ReportPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import UserGuidePage from "./pages/UserGuidePage.tsx";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage.tsx";
import WalletsPage from "./pages/WalletsPage.tsx";
import WalletDetailPage from "./pages/WalletDetailPage.tsx";
import CategoriesPage from "./pages/CategoriesPage.tsx";
import RecurringPage from "./pages/RecurringPage.tsx";
import MorePage from "./pages/MorePage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SettingsProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/more" element={<MorePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/user-guide" element={<UserGuidePage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/wallets" element={<WalletsPage />} />
            <Route path="/wallet/:id" element={<WalletDetailPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/recurring" element={<RecurringPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SettingsProvider>
  </QueryClientProvider>
);

export default App;
