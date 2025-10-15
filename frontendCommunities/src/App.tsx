import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Index from "./pages/Index";
import Calculator from "./pages/Calculator";
import Journal from "./pages/Journal";
import Stories from "./pages/Stories";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import CommunityAuth from "./pages/Auth";
import FloatingChat from "@/components/FloatingChat";
import { I18nProvider } from "@/i18n/I18nProvider";

const queryClient = new QueryClient();

const RequireCommunityAuth = ({ children }: { children: JSX.Element }) => {
  const uid = typeof window !== "undefined" ? localStorage.getItem("community_user_id") : null;
  if (!uid) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

const AppInner = () => {
  const location = useLocation();
  const showChat = location.pathname !== "/auth";
  return (
    <>
      <Routes>
          <Route path="/auth" element={<CommunityAuth />} />
          <Route
            path="/"
            element={
              <RequireCommunityAuth>
                <Index />
              </RequireCommunityAuth>
            }
          />
          <Route
            path="/calculator"
            element={
              <RequireCommunityAuth>
                <Calculator />
              </RequireCommunityAuth>
            }
          />
          <Route
            path="/journal"
            element={
              <RequireCommunityAuth>
                <Journal />
              </RequireCommunityAuth>
            }
          />
          <Route
            path="/stories"
            element={
              <RequireCommunityAuth>
                <Stories />
              </RequireCommunityAuth>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireCommunityAuth>
                <Dashboard />
              </RequireCommunityAuth>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <RequireCommunityAuth>
                <Leaderboard />
              </RequireCommunityAuth>
            }
          />
          <Route path="*" element={<NotFound />} />
      </Routes>
      {showChat && <FloatingChat />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <I18nProvider>
        <BrowserRouter>
          <AppInner />
        </BrowserRouter>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
