import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bus, DollarSign, TicketIcon, Route, Plus, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function OperatorDashboard() {
  const { user } = useAuth();
  const operatorId = user?.operator?.id;

  // Fetch operator stats
  const { data: stats } = useQuery({
    queryKey: ["/api/operators", operatorId, "revenue"],
    enabled: !!operatorId,
  });

  // Fetch operator buses
  const { data: buses } = useQuery({
    queryKey: ["/api/operators", operatorId, "buses"],
    enabled: !!operatorId,
  });

  // Fetch recent bookings
  const { data: bookings } = useQuery({
    queryKey: ["/api/operators", operatorId, "bookings"],
    enabled: !!operatorId,
  });

  // Mock revenue data for chart
  const revenueData = [
    { month: "Jan", revenue: 4000 },
    { month: "Feb", revenue: 3000 },
    { month: "Mar", revenue: 5000 },
    { month: "Apr", revenue: 4500 },
    { month: "May", revenue: 6000 },
    { month: "Jun", revenue: 5500 },
  ];

  const recentBookings = bookings?.slice(0, 5) || [];

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900" data-testid="text-dashboard-title">
                Operator Dashboard
              </h2>
              <p className="text-gray-600 mt-1" data-testid="text-welcome-message">
                Welcome back, {user?.operator?.companyName || user?.name}
              </p>
            </div>
            <Link href="/operator/buses">
              <Button data-testid="button-add-bus">
                <Plus className="mr-2 h-4 w-4" />
                Add New Bus
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Bus className="text-primary h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Buses</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="stat-total-buses">
                    {buses?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <TicketIcon className="text-secondary h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="stat-total-bookings">
                    {stats?.totalBookings || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <DollarSign className="text-yellow-600 h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="stat-total-revenue">
                    ${stats?.totalRevenue?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Route className="text-purple-600 h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Active Routes</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="stat-active-routes">
                    {buses?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Revenue Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64" data-testid="chart-revenue">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(213.3, 83.3%, 52.9%)" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4" data-testid="recent-bookings">
                {recentBookings.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent bookings</p>
                ) : (
                  recentBookings.map((booking: any) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900" data-testid={`booking-passenger-${booking.id}`}>
                          {booking.passengerName}
                        </p>
                        <p className="text-sm text-gray-600" data-testid={`booking-route-${booking.id}`}>
                          {booking.route?.fromCity} → {booking.route?.toCity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900" data-testid={`booking-amount-${booking.id}`}>
                          ${booking.totalAmount}
                        </p>
                        <Badge 
                          variant={booking.paymentStatus === 'paid' ? 'default' : 'secondary'}
                          data-testid={`booking-status-${booking.id}`}
                        >
                          {booking.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
