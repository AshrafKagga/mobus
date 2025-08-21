import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Building, UserCheck, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AdminDashboard() {
  // Fetch platform statistics
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  // Fetch pending operators
  const { data: pendingOperators } = useQuery({
    queryKey: ["/api/admin/operators", "pending"],
  });

  // Mock data for charts
  const revenueData = [
    { month: "Jan", revenue: 12000 },
    { month: "Feb", revenue: 15000 },
    { month: "Mar", revenue: 18000 },
    { month: "Apr", revenue: 16000 },
    { month: "May", revenue: 22000 },
    { month: "Jun", revenue: 25000 },
  ];

  const bookingDistribution = [
    { name: "Express Lines", value: 35, color: "hsl(213.3, 83.3%, 52.9%)" },
    { name: "Metro Transport", value: 25, color: "hsl(154.1, 100%, 40%)" },
    { name: "City Buses", value: 20, color: "hsl(249.6, 58.1%, 60.2%)" },
    { name: "Others", value: 20, color: "hsl(42.0290, 92.8251%, 56.2745%)" },
  ];

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900" data-testid="text-admin-dashboard-title">
            Admin Dashboard
          </h2>
          <p className="text-gray-600 mt-1">Platform management and analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="text-primary h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-xl font-bold text-gray-900" data-testid="stat-total-users">
                    {stats?.totalUsers || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Building className="text-secondary h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Operators</p>
                  <p className="text-xl font-bold text-gray-900" data-testid="stat-operators">
                    {stats?.totalOperators || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <UserCheck className="text-purple-600 h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Agents</p>
                  <p className="text-xl font-bold text-gray-900" data-testid="stat-agents">
                    {stats?.totalUsers ? Math.floor(stats.totalUsers * 0.1) : 0}
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
                  <p className="text-xl font-bold text-gray-900" data-testid="stat-revenue">
                    ${stats?.totalRevenue?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-lg">
                  <AlertTriangle className="text-red-600 h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Complaints</p>
                  <p className="text-xl font-bold text-gray-900" data-testid="stat-complaints">
                    {stats?.totalComplaints || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                User Management
                <Users className="text-gray-400 h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/users" className="block">
                <Button variant="outline" className="w-full justify-start" data-testid="button-manage-users">
                  <Users className="mr-3 h-4 w-4 text-primary" />
                  Manage Users
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start" data-testid="button-user-permissions">
                <UserCheck className="mr-3 h-4 w-4 text-secondary" />
                User Permissions
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-user-analytics">
                <TrendingUp className="mr-3 h-4 w-4 text-purple-600" />
                User Analytics
              </Button>
            </CardContent>
          </Card>

          {/* Operator Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Operator Management
                <Building className="text-gray-400 h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/operators" className="block">
                <Button variant="outline" className="w-full justify-between" data-testid="button-pending-approvals">
                  <div className="flex items-center">
                    <AlertTriangle className="mr-3 h-4 w-4 text-yellow-600" />
                    Pending Approvals
                  </div>
                  {pendingOperators && pendingOperators.length > 0 && (
                    <Badge variant="secondary" data-testid="badge-pending-count">
                      {pendingOperators.length}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start" data-testid="button-approved-operators">
                <Building className="mr-3 h-4 w-4 text-secondary" />
                Approved Operators
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-suspended-operators">
                <AlertTriangle className="mr-3 h-4 w-4 text-red-600" />
                Suspended Operators
              </Button>
            </CardContent>
          </Card>

          {/* System Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                System Management
                <TrendingUp className="text-gray-400 h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-between" data-testid="button-handle-complaints">
                <div className="flex items-center">
                  <AlertTriangle className="mr-3 h-4 w-4 text-red-600" />
                  Handle Complaints
                </div>
                {stats?.openComplaints && stats.openComplaints > 0 && (
                  <Badge variant="destructive" data-testid="badge-complaints-count">
                    {stats.openComplaints}
                  </Badge>
                )}
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-platform-analytics">
                <TrendingUp className="mr-3 h-4 w-4 text-primary" />
                Platform Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-export-reports">
                <DollarSign className="mr-3 h-4 w-4 text-secondary" />
                Export Reports
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Platform Revenue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Platform Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64" data-testid="chart-platform-revenue">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="hsl(213.3, 83.3%, 52.9%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Booking Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64" data-testid="chart-booking-distribution">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bookingDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {bookingDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {bookingDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Operator Approvals Table */}
        {pendingOperators && pendingOperators.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Operator Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pendingOperators.map((operator: any) => (
                      <tr key={operator.id} data-testid={`pending-operator-${operator.id}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900" data-testid={`operator-company-${operator.id}`}>
                              {operator.companyName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900" data-testid={`operator-email-${operator.id}`}>
                            {operator.contactEmail}
                          </div>
                          <div className="text-sm text-gray-600" data-testid={`operator-phone-${operator.id}`}>
                            {operator.contactPhone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600" data-testid={`operator-license-${operator.id}`}>
                          {operator.license}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600" data-testid={`operator-date-${operator.id}`}>
                          {new Date(operator.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <Link href="/admin/operators">
                            <Button size="sm" data-testid={`button-review-${operator.id}`}>
                              Review
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
