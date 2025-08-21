import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Bus, Search } from "lucide-react";
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

export default function BusManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const operatorId = user?.operator?.id;

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [busForm, setBusForm] = useState({
    busNumber: "",
    busType: "",
    totalSeats: "",
    amenities: [] as string[],
    status: "active",
  });

  // Fetch buses
  const { data: buses, isLoading } = useQuery({
    queryKey: ["/api/operators", operatorId, "buses"],
    enabled: !!operatorId,
  });

  // Create bus mutation
  const createBusMutation = useMutation({
    mutationFn: async (busData: any) => {
      const response = await apiRequest("POST", "/api/buses", {
        ...busData,
        operatorId,
        totalSeats: parseInt(busData.totalSeats),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/operators", operatorId, "buses"] });
      toast({
        title: "Bus added successfully",
        description: "The new bus has been added to your fleet.",
      });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Failed to add bus",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update bus mutation
  const updateBusMutation = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const response = await apiRequest("PATCH", `/api/buses/${id}`, {
        ...updates,
        totalSeats: updates.totalSeats ? parseInt(updates.totalSeats) : undefined,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/operators", operatorId, "buses"] });
      toast({
        title: "Bus updated successfully",
        description: "The bus information has been updated.",
      });
      setEditingBus(null);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Failed to update bus",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete bus mutation
  const deleteBusMutation = useMutation({
    mutationFn: async (busId: string) => {
      await apiRequest("DELETE", `/api/buses/${busId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/operators", operatorId, "buses"] });
      toast({
        title: "Bus deleted successfully",
        description: "The bus has been removed from your fleet.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete bus",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setBusForm({
      busNumber: "",
      busType: "",
      totalSeats: "",
      amenities: [],
      status: "active",
    });
  };

  const handleAddBus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!busForm.busNumber || !busForm.busType || !busForm.totalSeats) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createBusMutation.mutate(busForm);
  };

  const handleEditBus = (bus: any) => {
    setEditingBus(bus);
    setBusForm({
      busNumber: bus.busNumber,
      busType: bus.busType,
      totalSeats: bus.totalSeats.toString(),
      amenities: bus.amenities || [],
      status: bus.status,
    });
  };

  const handleUpdateBus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBus) return;
    updateBusMutation.mutate({ id: editingBus.id, ...busForm });
  };

  const handleDeleteBus = (busId: string) => {
    if (confirm("Are you sure you want to delete this bus?")) {
      deleteBusMutation.mutate(busId);
    }
  };

  const filteredBuses = buses?.filter((bus: any) => {
    const matchesSearch = bus.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bus.busType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || bus.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const busTypes = ["AC Sleeper", "Semi-Sleeper", "Seater", "Luxury Coach"];
  const availableAmenities = ["WiFi", "Charging Port", "Entertainment", "Blanket", "Reading Light", "AC"];

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900" data-testid="text-bus-management-title">
                Bus Fleet Management
              </h2>
              <p className="text-gray-600 mt-1">Manage your buses and routes</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-bus">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Bus
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Bus</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddBus} className="space-y-4">
                  <div>
                    <Label htmlFor="bus-number">Bus Number *</Label>
                    <Input
                      id="bus-number"
                      value={busForm.busNumber}
                      onChange={(e) => setBusForm(prev => ({ ...prev, busNumber: e.target.value }))}
                      placeholder="e.g., EL001"
                      data-testid="input-bus-number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bus-type">Bus Type *</Label>
                    <Select 
                      value={busForm.busType} 
                      onValueChange={(value) => setBusForm(prev => ({ ...prev, busType: value }))}
                    >
                      <SelectTrigger data-testid="select-bus-type">
                        <SelectValue placeholder="Select bus type" />
                      </SelectTrigger>
                      <SelectContent>
                        {busTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="total-seats">Total Seats *</Label>
                    <Input
                      id="total-seats"
                      type="number"
                      value={busForm.totalSeats}
                      onChange={(e) => setBusForm(prev => ({ ...prev, totalSeats: e.target.value }))}
                      placeholder="e.g., 40"
                      min="1"
                      max="60"
                      data-testid="input-total-seats"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createBusMutation.isPending} data-testid="button-submit-bus">
                      {createBusMutation.isPending ? "Adding..." : "Add Bus"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search buses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-buses"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger data-testid="select-status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bus Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Bus Fleet</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : filteredBuses.length === 0 ? (
              <div className="text-center py-8" data-testid="no-buses-message">
                <Bus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No buses found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bus ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Seats</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBuses.map((bus: any) => (
                      <TableRow key={bus.id} data-testid={`bus-row-${bus.id}`}>
                        <TableCell className="font-medium" data-testid={`bus-number-${bus.id}`}>
                          {bus.busNumber}
                        </TableCell>
                        <TableCell data-testid={`bus-type-${bus.id}`}>
                          {bus.busType}
                        </TableCell>
                        <TableCell data-testid={`bus-seats-${bus.id}`}>
                          {bus.totalSeats}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              bus.status === 'active' ? 'default' : 
                              bus.status === 'maintenance' ? 'secondary' : 'destructive'
                            }
                            data-testid={`bus-status-${bus.id}`}
                          >
                            {bus.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditBus(bus)}
                              data-testid={`button-edit-${bus.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteBus(bus.id)}
                              data-testid={`button-delete-${bus.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Bus Dialog */}
        <Dialog open={!!editingBus} onOpenChange={(open) => !open && setEditingBus(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Bus</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateBus} className="space-y-4">
              <div>
                <Label htmlFor="edit-bus-number">Bus Number *</Label>
                <Input
                  id="edit-bus-number"
                  value={busForm.busNumber}
                  onChange={(e) => setBusForm(prev => ({ ...prev, busNumber: e.target.value }))}
                  data-testid="input-edit-bus-number"
                />
              </div>
              <div>
                <Label htmlFor="edit-bus-type">Bus Type *</Label>
                <Select 
                  value={busForm.busType} 
                  onValueChange={(value) => setBusForm(prev => ({ ...prev, busType: value }))}
                >
                  <SelectTrigger data-testid="select-edit-bus-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {busTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-total-seats">Total Seats *</Label>
                <Input
                  id="edit-total-seats"
                  type="number"
                  value={busForm.totalSeats}
                  onChange={(e) => setBusForm(prev => ({ ...prev, totalSeats: e.target.value }))}
                  min="1"
                  max="60"
                  data-testid="input-edit-total-seats"
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={busForm.status} 
                  onValueChange={(value) => setBusForm(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger data-testid="select-edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditingBus(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateBusMutation.isPending} data-testid="button-update-bus">
                  {updateBusMutation.isPending ? "Updating..." : "Update Bus"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
