import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Building, Check, X, Eye, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function OperatorApproval() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all operators
  const { data: allOperators, isLoading } = useQuery({
    queryKey: ["/api/admin/operators"],
  });

  // Fetch pending operators
  const { data: pendingOperators } = useQuery({
    queryKey: ["/api/admin/operators", "pending"],
  });

  // Fetch approved operators
  const { data: approvedOperators } = useQuery({
    queryKey: ["/api/admin/operators", "approved"],
  });

  // Approve operator mutation
  const approveMutation = useMutation({
    mutationFn: async (operatorId: string) => {
      const response = await apiRequest("PATCH", `/api/admin/operators/${operatorId}`, {
        status: "approved"
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/operators"] });
      toast({
        title: "Operator approved",
        description: "The operator has been approved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to approve operator",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Reject operator mutation
  const rejectMutation = useMutation({
    mutationFn: async (operatorId: string) => {
      const response = await apiRequest("PATCH", `/api/admin/operators/${operatorId}`, {
        status: "suspended"
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/operators"] });
      toast({
        title: "Operator rejected",
        description: "The operator application has been rejected.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to reject operator",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (operatorId: string) => {
    if (confirm("Are you sure you want to approve this operator?")) {
      approveMutation.mutate(operatorId);
    }
  };

  const handleReject = (operatorId: string) => {
    if (confirm("Are you sure you want to reject this operator application?")) {
      rejectMutation.mutate(operatorId);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved": return "default";
      case "pending": return "secondary";
      case "suspended": return "destructive";
      default: return "outline";
    }
  };

  const OperatorDetailsDialog = ({ operator }: { operator: any }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" data-testid={`button-view-${operator.id}`}>
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Operator Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900">Company Information</h4>
              <div className="mt-2 space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Company Name:</span>
                  <span className="ml-2 font-medium" data-testid={`detail-company-${operator.id}`}>
                    {operator.companyName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">License Number:</span>
                  <span className="ml-2 font-medium" data-testid={`detail-license-${operator.id}`}>
                    {operator.license}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <Badge 
                    variant={getStatusBadgeVariant(operator.status)} 
                    className="ml-2"
                    data-testid={`detail-status-${operator.id}`}
                  >
                    {operator.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Contact Information</h4>
              <div className="mt-2 space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-medium" data-testid={`detail-email-${operator.id}`}>
                    {operator.contactEmail}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <span className="ml-2 font-medium" data-testid={`detail-phone-${operator.id}`}>
                    {operator.contactPhone}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Applied Date:</span>
                  <span className="ml-2 font-medium" data-testid={`detail-date-${operator.id}`}>
                    {new Date(operator.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {operator.status === "pending" && (
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => handleReject(operator.id)}
                disabled={rejectMutation.isPending}
                data-testid={`button-reject-detail-${operator.id}`}
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button
                onClick={() => handleApprove(operator.id)}
                disabled={approveMutation.isPending}
                data-testid={`button-approve-detail-${operator.id}`}
              >
                <Check className="mr-2 h-4 w-4" />
                Approve
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  const OperatorTable = ({ operators, showActions = false }: { operators: any[], showActions?: boolean }) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>License</TableHead>
            <TableHead>Applied Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {operators.map((operator: any) => (
            <TableRow key={operator.id} data-testid={`operator-row-${operator.id}`}>
              <TableCell>
                <div>
                  <div className="font-medium text-gray-900" data-testid={`operator-company-${operator.id}`}>
                    {operator.companyName}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div className="text-gray-900" data-testid={`operator-email-${operator.id}`}>
                    {operator.contactEmail}
                  </div>
                  <div className="text-gray-600" data-testid={`operator-phone-${operator.id}`}>
                    {operator.contactPhone}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm text-gray-600" data-testid={`operator-license-${operator.id}`}>
                {operator.license}
              </TableCell>
              <TableCell className="text-sm text-gray-600" data-testid={`operator-date-${operator.id}`}>
                {new Date(operator.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Badge 
                  variant={getStatusBadgeVariant(operator.status)}
                  data-testid={`operator-status-${operator.id}`}
                >
                  {operator.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <OperatorDetailsDialog operator={operator} />
                  {showActions && operator.status === "pending" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleApprove(operator.id)}
                        disabled={approveMutation.isPending}
                        data-testid={`button-approve-${operator.id}`}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReject(operator.id)}
                        disabled={rejectMutation.isPending}
                        data-testid={`button-reject-${operator.id}`}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900" data-testid="text-operator-approval-title">
            Operator Management
          </h2>
          <p className="text-gray-600 mt-1">Review and manage bus operator applications</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <AlertTriangle className="text-yellow-600 h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Pending Approval</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="stat-pending-operators">
                    {pendingOperators?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Check className="text-green-600 h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="stat-approved-operators">
                    {approvedOperators?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Building className="text-primary h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Operators</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="stat-total-operators">
                    {allOperators?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Operator Management Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Operator Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : (
              <Tabs defaultValue="pending" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="pending" data-testid="tab-pending">
                    Pending Approval ({pendingOperators?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="approved" data-testid="tab-approved">
                    Approved ({approvedOperators?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="all" data-testid="tab-all">
                    All Operators ({allOperators?.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                  {pendingOperators && pendingOperators.length > 0 ? (
                    <OperatorTable operators={pendingOperators} showActions={true} />
                  ) : (
                    <div className="text-center py-8" data-testid="no-pending-operators">
                      <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">No pending operator applications</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="approved" className="space-y-4">
                  {approvedOperators && approvedOperators.length > 0 ? (
                    <OperatorTable operators={approvedOperators} />
                  ) : (
                    <div className="text-center py-8" data-testid="no-approved-operators">
                      <Check className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">No approved operators yet</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="all" className="space-y-4">
                  {allOperators && allOperators.length > 0 ? (
                    <OperatorTable operators={allOperators} />
                  ) : (
                    <div className="text-center py-8" data-testid="no-operators">
                      <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">No operators in the system</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
