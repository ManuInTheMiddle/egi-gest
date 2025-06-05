"use client";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Retorceder from "../users/componentes/retorceder"
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  UserCheck,
  UserX,
  Loader2,
} from "lucide-react";
import { Grid } from "react-loader-spinner";
import { TooltipCustomizado } from "@/components/tooltipCustomizado";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface User {
  idUser: number;
  username: string;
  role: string;
  email: string;
  fullName: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface UserFormData {
  username: string;
  password: string;
  role: string;
  email: string;
  fullName: string;
  active: boolean;
}

const ROLES = [
  { value: "admin", label: "Administrador" },
  { value: "gestor", label: "Gestor" },
  { value: "rececaomp", label: "Receção de Matéria-Prima" },
  { value: "receitas", label: "Gestão de Receitas" },
  { value: "formulacao", label: "Formulação" },
  { value: "producao", label: "Produção" },
  { value: "expedicao", label: "Expedição" },
];

const UsersPage = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentUser, setCurrentUser] = useState<string>("");
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    password: "",
    role: "",
    email: "",
    fullName: "",
    active: true,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getSession();
        if (!session || session.user.role !== "admin") {
          router.push("/");
          return;
        }
        setCurrentUser(session.user.id);
        await fetchUsers();
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        router.push("/");
      }
    };
    checkAuth();
  }, [router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users");
      
      if (!response.ok) {
        throw new Error("Falha ao carregar utilizadores");
      }
      
      const usersData = await response.json();
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error("Erro ao carregar utilizadores:", error);
      alert("Erro ao carregar utilizadores");
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Active filter
    if (activeFilter !== "all") {
      filtered = filtered.filter((user) => 
        activeFilter === "active" ? user.active : !user.active
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, activeFilter]);

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      role: "",
      email: "",
      fullName: "",
      active: true,
    });
    setErrors({});
    setShowPassword(false);
  };

  const validateForm = (isEdit = false) => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Nome de utilizador é obrigatório";
    }
    
    if (!isEdit && !formData.password.trim()) {
      newErrors.password = "Password é obrigatória";
    }
    
    if (!formData.role) {
      newErrors.role = "Role é obrigatória";
    }
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Nome completo é obrigatório";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddUser = async () => {
    if (!validateForm()) return;

    try {
      setFormLoading(true);
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao criar utilizador");
      }

      await fetchUsers();
      setIsAddModalOpen(false);
      resetForm();
      alert("Utilizador criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar utilizador:", error);
      alert(error instanceof Error ? error.message : "Erro ao criar utilizador");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!editingUser || !validateForm(true)) return;

    try {
      setFormLoading(true);
      const updateData = { ...formData };
      
      // Don't send password if it's empty (keep existing password)
      if (!updateData.password.trim()) {
        delete (updateData as any).password;
      }

      const response = await fetch(`/api/users/${editingUser.idUser}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao atualizar utilizador");
      }

      await fetchUsers();
      setIsEditModalOpen(false);
      setEditingUser(null);
      resetForm();
      alert("Utilizador atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar utilizador:", error);
      alert(error instanceof Error ? error.message : "Erro ao atualizar utilizador");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (user.idUser.toString() === currentUser) {
      alert("Não pode eliminar a sua própria conta");
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.idUser}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao eliminar utilizador");
      }

      await fetchUsers();
      alert("Utilizador eliminado com sucesso!");
    } catch (error) {
      console.error("Erro ao eliminar utilizador:", error);
      alert(error instanceof Error ? error.message : "Erro ao eliminar utilizador");
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: "", // Keep empty for security
      role: user.role,
      email: user.email,
      fullName: user.fullName,
      active: user.active,
    });
    setIsEditModalOpen(true);
  };

  const getRoleLabel = (role: string) => {
    return ROLES.find((r) => r.value === role)?.label || role;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="text-sm text-gray-600">A carregar utilizadores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Retorceder />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 flex-none rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Gestão de Utilizadores
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Gerir contas de utilizador e permissões do sistema
                </p>
              </div>
            </div>
            
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    resetForm();
                    setIsAddModalOpen(true);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Adicionar Utilizador</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Utilizador</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do novo utilizador
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username">Nome de Utilizador *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className={errors.username ? "border-red-500" : ""}
                    />
                    {errors.username && (
                      <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className={errors.password ? "border-red-500" : ""}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="role">Role *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        setFormData({ ...formData, role: value })
                      }
                    >
                      <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecione uma role" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.role && (
                      <p className="text-red-500 text-sm mt-1">{errors.role}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="fullName">Nome Completo *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className={errors.fullName ? "border-red-500" : ""}
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={formData.active}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, active: checked })
                      }
                    />
                    <Label htmlFor="active">Utilizador Ativo</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                    disabled={formLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAddUser}
                    disabled={formLoading}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {formLoading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>A criar...</span>
                      </div>
                    ) : (
                      "Criar Utilizador"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 flex-none rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-auto">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-900">Total de Utilizadores</span>
                  <span className="font-semibold text-gray-900">{users.length}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 flex-none rounded-full bg-green-100 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div className="min-w-0 flex-auto">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-900">Utilizadores Ativos</span>
                  <span className="font-semibold text-gray-900">
                    {users.filter((u) => u.active).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 flex-none rounded-full bg-red-100 flex items-center justify-center">
                <UserX className="h-5 w-5 text-red-600" />
              </div>
              <div className="min-w-0 flex-auto">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-900">Utilizadores Inativos</span>
                  <span className="font-semibold text-gray-900">
                    {users.filter((u) => !u.active).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-lime-500 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Pesquisar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="search"
                  placeholder="Nome, utilizador ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="roleFilter">Filtrar por Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Roles</SelectItem>
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="activeFilter">Filtrar por Estado</Label>
              <Select value={activeFilter} onValueChange={setActiveFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Estados</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("all");
                  setActiveFilter("all");
                }}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-lime-600 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Utilizador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.idUser} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 flex-none rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-auto">
                          <p className="text-sm font-semibold leading-6 text-gray-900">
                            {user.fullName}
                          </p>
                          <p className="text-xs leading-5 text-gray-500">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium leading-6 text-gray-900">
                        {user.email}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.active ? (
                          <>
                            <UserCheck className="h-3 w-3 mr-1" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <UserX className="h-3 w-3 mr-1" />
                            Inativo
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <TooltipCustomizado textoDoTooltip="Editar utilizador">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(user)}
                            className="hover:bg-blue-50 hover:border-blue-200"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipCustomizado>
                        
                        {user.idUser.toString() !== currentUser && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                              >
                                <TooltipCustomizado textoDoTooltip="Eliminar utilizador">
                                  <Trash2 className="h-4 w-4" />
                                </TooltipCustomizado>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Eliminação</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem a certeza que pretende eliminar o utilizador{" "}
                                  <strong>{user.fullName}</strong>? Esta ação não pode ser revertida.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Users className="h-12 w-12 text-gray-300" />
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  Nenhum utilizador encontrado
                </p>
                <p className="text-xs text-gray-500">
                  Ajuste os filtros ou adicione novos utilizadores para começar.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Utilizador</DialogTitle>
            <DialogDescription>
              Altere os dados do utilizador {editingUser?.fullName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-username">Nome de Utilizador *</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className={errors.username ? "border-red-500" : ""}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            <div>
              <Label htmlFor="edit-password">
                Nova Password (deixe vazio para manter a atual)
              </Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Deixe vazio para manter a password atual"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-red-500 text-sm mt-1">{errors.role}</p>
              )}
            </div>

            <div>
              <Label htmlFor="edit-fullName">Nome Completo *</Label>
              <Input
                id="edit-fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className={errors.fullName ? "border-red-500" : ""}
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: checked })
                }
              />
              <Label htmlFor="edit-active">Utilizador Ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingUser(null);
                resetForm();
              }}
              disabled={formLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditUser}
              disabled={formLoading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {formLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>A atualizar...</span>
                </div>
              ) : (
                "Atualizar Utilizador"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;