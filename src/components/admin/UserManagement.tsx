import { useState, useEffect } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { UserProfile, UserRole } from "@/types/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Shield, User as UserIcon, Crown } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const roleIcons = {
  owner: Crown,
  admin: Shield,
  user: UserIcon,
};

const roleBadgeVariants = {
  owner: "bg-gradient-primary text-primary-foreground",
  admin: "bg-secondary text-secondary-foreground",
  user: "bg-muted text-muted-foreground",
};

export const UserManagement = () => {
  const {
    getAllUsers,
    updateUserRole,
    deleteUser,
    canManageUser,
    canKickUser,
    userRole,
  } = useAdmin();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { users: fetchedUsers, error } = await getAllUsers();

    if (error) {
      toast.error("Failed to load users", {
        description: error.message,
      });
      setLoading(false);
      return;
    }

    setUsers(fetchedUsers || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingUserId(userId);

    const { error } = await updateUserRole(userId, newRole);

    if (error) {
      toast.error("Failed to update role", {
        description: error.message,
      });
    } else {
      toast.success("Role updated successfully");
      // Refresh users list
      fetchUsers();
    }

    setUpdatingUserId(null);
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    setDeletingUserId(userId);

    const { error } = await deleteUser(userId);

    if (error) {
      toast.error("Failed to delete user", {
        description: error.message,
      });
    } else {
      toast.success(`User ${userEmail} has been removed`);
      // Refresh users list
      fetchUsers();
    }

    setDeletingUserId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
        <UserIcon className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No users found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Sign In</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const RoleIcon = roleIcons[user.role];
            const canManage = canManageUser(user.role);
            const canKick = canKickUser(user.role);
            const isCurrentUser = userRole && user.role === userRole;

            return (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>
                  {canManage && !isCurrentUser ? (
                    <Select
                      value={user.role}
                      onValueChange={(value) =>
                        handleRoleChange(user.id, value as UserRole)
                      }
                      disabled={updatingUserId === user.id}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {userRole === "owner" && (
                          <SelectItem value="owner">
                            <div className="flex items-center gap-2">
                              <Crown className="w-4 h-4" />
                              Owner
                            </div>
                          </SelectItem>
                        )}
                        {(userRole === "owner" || userRole === "admin") && (
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              Admin
                            </div>
                          </SelectItem>
                        )}
                        <SelectItem value="user">
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4" />
                            User
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge
                      className={roleBadgeVariants[user.role]}
                      variant="secondary"
                    >
                      <RoleIcon className="w-3 h-3 mr-1" />
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(user.created_at)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {user.last_sign_in_at
                    ? formatDate(user.last_sign_in_at)
                    : "Never"}
                </TableCell>
                <TableCell className="text-right">
                  {canKick && !isCurrentUser && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={deletingUserId === user.id}
                        >
                          {deletingUserId === user.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete User Account
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            <span className="font-semibold">{user.email}</span>?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
