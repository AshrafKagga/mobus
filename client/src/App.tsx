import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/auth-context";
import { Navigation } from "@/components/layout/navigation";
import { ProtectedRoute } from "@/components/layout/protected-route";

// Pages
import Home from "@/pages/home";
import Login from "@/pages/login";
import SeatSelection from "@/pages/seat-selection";
import Payment from "@/pages/payment";
import BookingConfirmation from "@/pages/booking-confirmation";

// Operator Pages
import OperatorDashboard from "@/pages/operator/dashboard";
import BusManagement from "@/pages/operator/bus-management";

// Agent Pages
import AgentDashboard from "@/pages/agent/dashboard";

// Admin Pages
import AdminDashboard from "@/pages/admin/dashboard";
import UserManagement from "@/pages/admin/user-management";
import OperatorApproval from "@/pages/admin/operator-approval";

import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/seat-selection" component={SeatSelection} />
      <Route path="/payment" component={Payment} />
      <Route path="/booking-confirmation" component={BookingConfirmation} />
      
      {/* Operator Routes */}
      <Route path="/operator">
        <ProtectedRoute requiredRole="operator">
          <OperatorDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/operator/buses">
        <ProtectedRoute requiredRole="operator">
          <BusManagement />
        </ProtectedRoute>
      </Route>
      <Route path="/operator/bookings">
        <ProtectedRoute requiredRole="operator">
          <OperatorDashboard />
        </ProtectedRoute>
      </Route>
      
      {/* Agent Routes */}
      <Route path="/agent">
        <ProtectedRoute requiredRole="agent">
          <AgentDashboard />
        </ProtectedRoute>
      </Route>
      
      {/* Admin Routes */}
      <Route path="/admin">
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute requiredRole="admin">
          <UserManagement />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/operators">
        <ProtectedRoute requiredRole="admin">
          <OperatorApproval />
        </ProtectedRoute>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <Router />
          </div>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
