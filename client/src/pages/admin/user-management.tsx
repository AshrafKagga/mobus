import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search, UserPlus, Edit, Trash2, Filter } from "lucide-react";
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

export default function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [userForm, setUserForm] = useState({
    username: "",
    password: "",
    email: "",
    name: "",
    phone: "",
    role: "passenger",
  });

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User created successfully",
        description: "The new user has been added to the system.",
      });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Failed to create user",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User updated successfully",
        description: "The user information has been updated.",
      });
      setEditingUser(null);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Failed to update user",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setUserForm({
      username: "",
      password: "",
      email: "",
      name: "",
      phone: "",
      role: "passenger",
    });
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.username || !userForm.password) {
      toast({
        title: "Missing information",
        description: "Please fill in username and password.",
        variant: "destructive",
      });
      return;
    }
    createUserMutation.mutate(userForm);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setUserForm({
      username: user.username,
      password: "", // Don't populate password
      email: user.email || "",
      name: user.name || "",
      phone: user.phone || "",
      role: user.role,
    });
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    const updates = { ...userForm };
    if (!updates.password) {
      delete updates.password; // Don't update password if empty
    }
    
    updateUserMutation.mutate({ id: editingUser.id, ...updates });
  };

  const filteredUsers = users?.filter((user: any) => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  }) || [];

  const roles = ["passenger", "agent", "operator", "admin"];

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "destructive";
      case "operator": return "default";
      case "agent": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900" data-testid="text-user-management-title">
                User Management
              </h2>
              <p className="text-gray-600 mt-1">Manage system users and their permissions</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-user">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add New User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      value={userForm.username}
                      onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Enter username"
                      data-testid="input-username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter password"
                      data-testid="input-password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={userForm.name}
                      onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter full name"
                      data-testid="input-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email"
                      data-testid="input-email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={userForm.phone}
                      onChange={(e) => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                      data-testid="input-phone"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select 
                      value={userForm.role} 
                      onValueChange={(value) => setUserForm(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger data-testid="select-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createUserMutation.isPending} data-testid="button-submit-user">
                      {createUserMutation.isPending ? "Creating..." : "Create User"}
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
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-users"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger data-testid="select-role-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map(role => (
                      <SelectItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              System Users ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8" data-testid="no-users-message">
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user: any) => (
                      <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                        <TableCell className="font-medium" data-testid={`user-username-${user.id}`}>
                          {user.username}
                        </TableCell>
                        <TableCell data-testid={`user-name-${user.id}`}>
                          {user.name || "-"}
                        </TableCell>
                        <TableCell data-testid={`user-email-${user.id}`}>
                          {user.email || "-"}
                        </TableCell>
                        <TableCell data-testid={`user-phone-${user.id}`}>
                          {user.phone || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={getRoleBadgeVariant(user.role)}
                            data-testid={`user-role-${user.id}`}
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                              data-testid={`button-edit-user-${user.id}`}
                            >
                              <Edit className="h-4 w-4" />
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

        {/* Edit User Dialog */}
        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  value={userForm.username}
                  onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                  data-testid="input-edit-username"
                />
              </div>
              <div>
                <Label htmlFor="edit-password">New Password (leave empty to keep current)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter new password"
                  data-testid="input-edit-password"
                />
              </div>
              <div>
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={userForm.name}
                  onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                  data-testid="input-edit-name"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  data-testid="input-edit-email"
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={userForm.phone}
                  onChange={(e) => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
                  data-testid="input-edit-phone"
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select 
                  value={userForm.role} 
                  onValueChange={(value) => setUserForm(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger data-testid="select-edit-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateUserMutation.isPending} data-testid="button-update-user">
                  {updateUserMutation.isPending ? "Updating..." : "Update User"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
