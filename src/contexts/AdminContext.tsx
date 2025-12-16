import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";
import { UserRole, UserProfile } from "@/types/admin";

const API_URL = import.meta.env.DEV
  ? "http://localhost:7893/api/admin"
  : "/api/admin";

interface AdminContextType {
  userRole: UserRole | null;
  isAdmin: boolean;
  isOwner: boolean;
  loading: boolean;
  canManageUser: (targetRole: UserRole) => boolean;
  canKickUser: (targetRole: UserRole) => boolean;
  createUser: (
    email: string,
    password: string,
    role: UserRole,
  ) => Promise<{ error: Error | null }>;
  updateUserRole: (
    userId: string,
    newRole: UserRole,
  ) => Promise<{ error: Error | null }>;
  deleteUser: (userId: string) => Promise<{ error: Error | null }>;
  getAllUsers: () => Promise<{
    users: UserProfile[] | null;
    error: Error | null;
  }>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user role from profiles table
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          setUserRole("user"); // Default to user role
        } else {
          setUserRole(data?.role || "user");
        }
      } catch (err) {
        console.error("Error in fetchUserRole:", err);
        setUserRole("user");
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const isAdmin = userRole === "admin" || userRole === "owner";
  const isOwner = userRole === "owner";

  // Role hierarchy: owner > admin > user
  const canManageUser = (targetRole: UserRole): boolean => {
    if (!userRole) return false;
    if (userRole === "owner") return true; // Owner can manage everyone
    if (userRole === "admin" && targetRole === "user") return true; // Admin can manage users
    return false;
  };

  const canKickUser = (targetRole: UserRole): boolean => {
    if (!userRole) return false;
    if (userRole === "owner" && targetRole !== "owner") return true; // Owner can kick admins and users
    if (userRole === "admin" && targetRole === "user") return true; // Admin can kick users
    return false;
  };

  const createUser = async (
    email: string,
    password: string,
    role: UserRole,
  ): Promise<{ error: Error | null }> => {
    try {
      // Check if current user can create users
      if (!isAdmin) {
        return {
          error: new Error("Unauthorized: Only admins can create users"),
        };
      }

      // Prevent creating owner accounts via admin panel (security measure)
      if (role === "owner") {
        return {
          error: new Error(
            "Owner accounts can only be created manually via SQL for security reasons",
          ),
        };
      }

      // Check if current user can assign this role
      if (!canManageUser(role)) {
        return {
          error: new Error(
            `Unauthorized: Cannot create user with role ${role}`,
          ),
        };
      }

      // Get the current user's session token for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        return { error: new Error("No active session") };
      }

      // Create user via server-side API (uses service role key)
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: new Error(data.error || "Failed to create user") };
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const updateUserRole = async (
    userId: string,
    newRole: UserRole,
  ): Promise<{ error: Error | null }> => {
    try {
      // Prevent setting owner role via admin panel (security measure)
      if (newRole === "owner") {
        return {
          error: new Error(
            "Owner role can only be set manually via SQL for security reasons",
          ),
        };
      }

      // Check if current user can manage this role
      if (!canManageUser(newRole)) {
        return {
          error: new Error(`Unauthorized: Cannot assign role ${newRole}`),
        };
      }

      // Get target user's current role to verify permissions
      const { data: targetUser, error: fetchError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (fetchError) {
        return { error: new Error(fetchError.message) };
      }

      if (!canManageUser(targetUser.role)) {
        return {
          error: new Error("Unauthorized: Cannot modify this user's role"),
        };
      }

      // Update the role
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) {
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const deleteUser = async (
    userId: string,
  ): Promise<{ error: Error | null }> => {
    try {
      // Get target user's role to verify permissions
      const { data: targetUser, error: fetchError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (fetchError) {
        return { error: new Error(fetchError.message) };
      }

      if (!canKickUser(targetUser.role)) {
        return { error: new Error("Unauthorized: Cannot kick this user") };
      }

      // Get the current user's session token for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        return { error: new Error("No active session") };
      }

      // Delete user via server-side API
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: new Error(data.error || "Failed to delete user") };
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const getAllUsers = async (): Promise<{
    users: UserProfile[] | null;
    error: Error | null;
  }> => {
    try {
      if (!isAdmin) {
        return {
          users: null,
          error: new Error("Unauthorized: Admin access required"),
        };
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, role, created_at, last_sign_in_at")
        .order("created_at", { ascending: false });

      if (error) {
        return { users: null, error: new Error(error.message) };
      }

      return { users: data as UserProfile[], error: null };
    } catch (err) {
      return { users: null, error: err as Error };
    }
  };

  const value = {
    userRole,
    isAdmin,
    isOwner,
    loading,
    canManageUser,
    canKickUser,
    createUser,
    updateUserRole,
    deleteUser,
    getAllUsers,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
