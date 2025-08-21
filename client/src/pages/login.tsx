import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Building, UserCheck, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { login, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    try {
      setError("");
      await login(username, password);
      
      toast({
        title: "Login successful",
        description: "Welcome to MoBus!",
      });
      
      // Redirect based on role would happen automatically via AuthContext
      setLocation("/");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  };

  const testLogins = [
    { username: "admin", password: "admin123", role: "Admin", icon: Shield, description: "Platform management" },
    { username: "expresslines", password: "operator123", role: "Bus Operator", icon: Building, description: "Manage buses and routes" },
    { username: "agent1", password: "agent123", role: "Agent", icon: UserCheck, description: "Book tickets for customers" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">MoBus</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2" data-testid="text-login-title">Login to your account</h2>
          <p className="text-gray-600">Choose your login type or use test credentials</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  disabled={isLoading}
                  data-testid="input-username"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  data-testid="input-password"
                />
              </div>
              
              {error && (
                <Alert variant="destructive" data-testid="alert-error">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-login">
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Test Login Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {testLogins.map((account) => {
              const Icon = account.icon;
              return (
                <div 
                  key={account.username}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    setUsername(account.username);
                    setPassword(account.password);
                  }}
                  data-testid={`test-login-${account.role.toLowerCase().replace(' ', '-')}`}
                >
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{account.role}</p>
                      <p className="text-xs text-gray-600">{account.description}</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    <p>{account.username}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
