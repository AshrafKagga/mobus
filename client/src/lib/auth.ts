import type { User } from "@shared/schema";

export async function registerUser(userData: {
  username: string;
  password: string;
  email?: string;
  name?: string;
  phone?: string;
  role?: string;
}): Promise<User> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error("Registration failed");
  }

  const data = await response.json();
  return data.user;
}

export function getUserRole(user: User | null): string {
  return user?.role || "passenger";
}

export function canAccessRoute(user: User | null, requiredRole: string): boolean {
  if (!user) return false;
  
  const roleHierarchy = {
    admin: 4,
    operator: 3,
    agent: 2,
    passenger: 1,
  };

  const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

  return userLevel >= requiredLevel;
}
