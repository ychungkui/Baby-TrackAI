import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { BabyProvider } from "@/contexts/BabyContext";
import { LanguageProvider } from "@/i18n";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import DailySummary from "./pages/DailySummary";
import Chat from "./pages/Chat";
import Subscription from "./pages/Subscription";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import Growth from "./pages/Growth";
import Landing from "./pages/Landing";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import DeleteAccount from "./pages/DeleteAccount";
import ResetPassword from "./pages/ResetPassword";

// 🔥 新增這行（最關鍵）
import Confirm from "./pages/Confirm";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <BabyProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>

                <Route path="/" element={<Index />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/summary" element={<DailySummary />} />
                <Route path="/growth" element={<Growth />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/subscription/success" element={<SubscriptionSuccess />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/delete-account" element={<DeleteAccount />} />

                <Route path="/reset-password" element={<ResetPassword />} />

                {/* 🔥🔥🔥 關鍵新增（修你404問題） */}
                <Route path="/confirm" element={<Confirm />} />

                {/* CATCH ALL */}
                <Route path="*" element={<NotFound />} />

              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </BabyProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;