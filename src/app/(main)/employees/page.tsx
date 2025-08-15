"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Plus,
  Users,
  UserCheck,
  UserX,
  MoreHorizontal,
  Edit,
  Trash2,
  Phone,
  Mail,
  TrendingUp,
  Shield,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [newUser, setNewUser] = useState({
    name: "",
    phone: "",
    email: "",
    role: "OPERATOR",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newUserPassword, setNewUserPassword] = useState("");
  
  // Estados para edição de usuário
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    email: "",
    role: "OPERATOR",
    isActive: true,
  });
  
  // Estados para AlertDialogs
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showToggleStatusDialog, setShowToggleStatusDialog] = useState(false);
  const [userToAction, setUserToAction] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        toast.error("Erro ao carregar usuários");
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Usuário criado com sucesso!");
        setNewUserPassword(data.defaultPassword);
        setShowNewPassword(true);
        setNewUser({
          name: "",
          phone: "",
          email: "",
          role: "OPERATOR",
        });
        setIsAddDialogOpen(false);
        fetchUsers();
      } else {
        toast.error(data.error || "Erro ao criar usuário");
      }
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      toast.error("Erro ao criar usuário");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    setUserToAction(user);
    setShowDeleteDialog(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToAction) return;

    try {
      const response = await fetch(`/api/users/${userToAction.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Usuário deletado com sucesso!");
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.error || "Erro ao deletar usuário");
      }
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      toast.error("Erro ao deletar usuário");
    } finally {
      setShowDeleteDialog(false);
      setUserToAction(null);
    }
  };

  const handleResetPassword = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    setUserToAction(user);
    setShowResetDialog(true);
  };

  const confirmResetPassword = async () => {
    if (!userToAction) return;

    try {
      const response = await fetch(`/api/users/${userToAction.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "reset-password" }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Senha resetada! Nova senha: ${data.newPassword}`);
      } else {
        toast.error(data.error || "Erro ao resetar senha");
      }
    } catch (error) {
      console.error("Erro ao resetar senha:", error);
      toast.error("Erro ao resetar senha");
    } finally {
      setShowResetDialog(false);
      setUserToAction(null);
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      phone: user.phone || "",
      email: user.email || "",
      role: user.role || "OPERATOR",
      isActive: user.isActive,
    });
    setShowEditDialog(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Usuário atualizado com sucesso!");
        setShowEditDialog(false);
        setEditingUser(null);
        fetchUsers();
      } else {
        toast.error(data.error || "Erro ao atualizar usuário");
      }
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      toast.error("Erro ao atualizar usuário");
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const user = users.find(u => u.id === userId);
    setUserToAction(user);
    setShowToggleStatusDialog(true);
  };

  const confirmToggleUserStatus = async () => {
    if (!userToAction) return;

    try {
      const response = await fetch(`/api/users/${userToAction.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !userToAction.isActive }),
      });

      if (response.ok) {
        toast.success(`Usuário ${!userToAction.isActive ? 'ativado' : 'desativado'} com sucesso!`);
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.error || "Erro ao alterar status do usuário");
      }
    } catch (error) {
      console.error("Erro ao alterar status do usuário:", error);
      toast.error("Erro ao alterar status do usuário");
    } finally {
      setShowToggleStatusDialog(false);
      setUserToAction(null);
    }
  };



  const getStatusBadge = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200";
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      ROOT: "bg-red-100 text-red-800 border-red-200",
      ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
      SUBADMIN: "bg-orange-100 text-orange-800 border-orange-200",
      OPERATOR: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return variants[role as keyof typeof variants] || variants.OPERATOR;
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.authCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || (statusFilter === "active" ? user.isActive : !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalEmployees = users.length;
  const activeEmployees = users.filter(
    (user) => user.isActive
  ).length;
  const inactiveEmployees = users.filter(
    (user) => !user.isActive
  ).length;
  const rootUsers = users.filter((user) => user.role === "ROOT").length;

  if (isLoading) {
    return (
      <div className="wrapper">
        {/* Header Skeleton */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-64 bg-white/20 mb-2" />
              <Skeleton className="h-6 w-80 bg-white/20" />
            </div>
            <Skeleton className="h-10 w-32 bg-white/20" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters Skeleton */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-48" />
            </div>
          </CardContent>
        </Card>

        {/* Employees Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="wrapper">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestão de Usuários</h1>
            <p className="text-purple-100 text-lg">
              Gerencie os usuários e níveis de acesso do sistema
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Usuário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                  <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input 
                    id="name" 
                    placeholder="João Silva" 
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  />
                  </div>
                  <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input 
                    id="phone" 
                    placeholder="(258) 1234-5678" 
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email (Opcional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="joao@restaurante.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Nível de Acesso</Label>
                  <Select 
                    value={newUser.role} 
                    onValueChange={(value) => setNewUser({...newUser, role: value})}
                  >
                      <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent>
                      <SelectItem value="OPERATOR">Operador</SelectItem>
                      <SelectItem value="SUBADMIN">Sub-Administrador</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                    onClick={handleCreateUser}
                  >
                    Adicionar Usuário
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
                  </Dialog>

        {/* Modal de Senha Gerada */}
        <Dialog open={showNewPassword} onOpenChange={setShowNewPassword}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Usuário Criado com Sucesso!</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-sm font-semibold text-green-900 mb-2">
                  🔑 Credenciais de Acesso
                </h3>
                <div className="text-sm text-green-700 space-y-2">
                  <p><strong>Senha:</strong> {newUserPassword}</p>
                  <p className="text-xs text-green-600 mt-2">
                    Guarde esta senha! Ela será necessária para o primeiro login.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  className="flex-1 bg-green-500 hover:bg-green-600"
                  onClick={() => setShowNewPassword(false)}
                >
                  Entendi
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">
                  Total de Usuários
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {totalEmployees}
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-blue-600 font-medium">
                    Active team
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">
                  Ativos
                </p>
                <p className="text-3xl font-bold text-green-900">
                  {activeEmployees}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">
                    Working today
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-50 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 mb-1">
                  Inativos
                </p>
                <p className="text-3xl font-bold text-red-900">
                  {inactiveEmployees}
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-red-600 font-medium">
                    Off duty
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <UserX className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">
                  Administradores
                </p>
                <p className="text-3xl font-bold text-orange-900">
                  {rootUsers}
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-orange-600 font-medium">
                    Administradores
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, email, código ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32 border-gray-200">
                  <SelectValue placeholder="Nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ROOT">Root</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="SUBADMIN">Sub-Admin</SelectItem>
                  <SelectItem value="OPERATOR">Operador</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 border-gray-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredUsers.map((user) => (
          <Card
            key={user.id}
            className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-sm bg-gradient-to-br from-purple-100 to-blue-100 text-purple-700">
                    {user.name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditUser(user)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
                      <Shield className="h-4 w-4 mr-2" />
                      Resetar Senha
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                      className={user.isActive ? "text-orange-600" : "text-green-600"}
                    >
                      {user.isActive ? (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Ativar
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Deletar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 truncate">
                    {user.name || "Sem nome"}
                  </h3>
                  <p className="text-xs text-gray-500">Código: {user.authCode}</p>
                </div>

                <div className="flex flex-wrap gap-1">
                  <Badge
                    className={`${getRoleBadge(
                      user.role
                    )} text-xs px-2 py-1`}
                  >
                    {user.role.charAt(0).toUpperCase() +
                      user.role.slice(1)}
                  </Badge>
                  <Badge
                    className={`${getStatusBadge(
                      user.isActive ? "active" : "inactive"
                    )} text-xs px-2 py-1`}
                  >
                    {user.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </div>

                <div className="space-y-2 text-xs text-gray-600">
                  {user.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                  </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{user.phone || "Sem telefone"}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Último login:</span>
                    <span className="font-semibold text-green-600">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Nunca"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum usuário encontrado
            </h3>
            <p className="text-gray-600">
              Tente ajustar sua busca ou critérios de filtro.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modal de Edição de Usuário */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editName">Nome Completo</Label>
              <Input 
                id="editName" 
                placeholder="João Silva" 
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="editPhone">Telefone</Label>
              <Input 
                id="editPhone" 
                placeholder="(258) 1234-5678" 
                value={editForm.phone}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="editEmail">Email (Opcional)</Label>
              <Input
                id="editEmail"
                type="email"
                placeholder="joao@restaurante.com"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="editRole">Nível de Acesso</Label>
              <Select 
                value={editForm.role} 
                onValueChange={(value) => setEditForm({...editForm, role: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPERATOR">Operador</SelectItem>
                  <SelectItem value="SUBADMIN">Sub-Administrador</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="editIsActive"
                type="checkbox"
                checked={editForm.isActive}
                onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <Label htmlFor="editIsActive" className="text-sm font-medium">
                Usuário Ativo
              </Label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                className="flex-1 bg-orange-500 hover:bg-orange-600"
                onClick={handleUpdateUser}
              >
                Atualizar Usuário
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setShowEditDialog(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AlertDialog para Deletar Usuário */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o usuário <strong>{userToAction?.name}</strong>? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog para Resetar Senha */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resetar Senha</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja resetar a senha do usuário <strong>{userToAction?.name}</strong>? 
            A nova senha será: <strong>12345678</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmResetPassword}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Resetar Senha
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* AlertDialog para Ativar/Desativar Usuário */}
    <AlertDialog open={showToggleStatusDialog} onOpenChange={setShowToggleStatusDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {userToAction?.isActive ? 'Desativar' : 'Ativar'} Usuário
          </AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja {userToAction?.isActive ? 'desativar' : 'ativar'} o usuário <strong>{userToAction?.name}</strong>?
            {userToAction?.isActive ? ' Usuários desativados não podem fazer login.' : ' Usuários ativados podem fazer login normalmente.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmToggleUserStatus}
            className={userToAction?.isActive ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"}
          >
            {userToAction?.isActive ? 'Desativar' : 'Ativar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </div>
  );
}
