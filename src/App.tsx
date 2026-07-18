import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ContactDialogProvider } from "@/components/ContactFormDialog";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Pricing from "./pages/Pricing";
import About from "./pages/About";

import Blog from "./pages/Blog";
import Portfolio from "./pages/Portfolio";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
import { PortalAuthProvider } from "@/portal/PortalAuthContext";
import PortalLayout from "@/portal/PortalLayout";
import PortalLogin from "./pages/portal/Login";
import AcceptInvite from "./pages/portal/AcceptInvite";
import PortalDashboard from "./pages/portal/Dashboard";
import PortalTasks from "./pages/portal/Tasks";
import PortalAnnouncements from "./pages/portal/Announcements";
import PortalDocuments from "./pages/portal/Documents";
import PortalAdmin from "./pages/portal/Admin";
import PortalProfile from "./pages/portal/Profile";
import PortalTeam from "./pages/portal/Team";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ContactDialogProvider>
          <PortalAuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<Services />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/portal/login" element={<PortalLogin />} />
            <Route path="/portal/accept-invite" element={<AcceptInvite />} />
            <Route path="/portal" element={<PortalLayout />}>
              <Route index element={<PortalDashboard />} />
              <Route path="tasks" element={<PortalTasks />} />
              <Route path="announcements" element={<PortalAnnouncements />} />
              <Route path="documents" element={<PortalDocuments />} />
              <Route path="team" element={<PortalTeam />} />
              <Route path="profile" element={<PortalProfile />} />
              <Route path="admin" element={<PortalAdmin />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </PortalAuthProvider>
        </ContactDialogProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
