import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import Login from "./pages/login";
import Predictions from "./pages/predictions";
import Candidates from "./pages/candidates";
import AdminCandidates from "./pages/admin/candidates";
import Results from "./pages/results";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/predictions" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/predictions" element={<Predictions />} />
        <Route path="/candidates" element={<Candidates />} />
        <Route path="/admin/candidates" element={<AdminCandidates />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-cream flex flex-col">
          <Navigation />
          <main className="flex-1 mt-16">
            <Toaster />
            <Sonner />
            <AnimatedRoutes />
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;