"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Package, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryForm } from "@/components/category-form";
import { MenuItemForm } from "@/components/menu-item-form";
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
} from "@/components/ui/alert-dialog";

interface Category {
  id: string;
  name: string;
  icon: string;
  createdAt: string;
  _count?: {
    menuItems: number;
  };
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    icon: string;
  };
  createdAt: string;
}

export default function AdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"categories" | "menu">("categories");
  
  // Estados dos formulários
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showMenuItemForm, setShowMenuItemForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  
  // Estados dos diálogos de confirmação
  const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] = useState(false);
  const [showDeleteMenuItemDialog, setShowDeleteMenuItemDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Category | MenuItem | null>(null);

  // Carregar dados
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [categoriesRes, menuItemsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/menu-items"),
      ]);

      const categoriesData = await categoriesRes.json();
      const menuItemsData = await menuItemsRes.json();

      setCategories(categoriesData);
      setMenuItems(menuItemsData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers para categorias
  const handleCreateCategory = async (data: { name: string; icon: string }) => {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Categoria criada com sucesso!");
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao criar categoria");
      }
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      toast.error("Erro ao criar categoria");
    }
  };

  const handleUpdateCategory = async (data: { name: string; icon: string }) => {
    if (!editingCategory) return;

    try {
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Categoria atualizada com sucesso!");
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao atualizar categoria");
      }
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      toast.error("Erro ao atualizar categoria");
    }
  };

  const handleDeleteCategory = async () => {
    if (!itemToDelete || !("icon" in itemToDelete)) return;

    try {
      const response = await fetch(`/api/categories/${itemToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Categoria deletada com sucesso!");
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao deletar categoria");
      }
    } catch (error) {
      console.error("Erro ao deletar categoria:", error);
      toast.error("Erro ao deletar categoria");
    } finally {
      setShowDeleteCategoryDialog(false);
      setItemToDelete(null);
    }
  };

  // Handlers para itens do menu
  const handleCreateMenuItem = async (data: {
    name: string;
    description?: string;
    price: number;
    image?: string | null;
    categoryId: string;
  }) => {
    try {
      const response = await fetch("/api/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Item criado com sucesso!");
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao criar item");
      }
    } catch (error) {
      console.error("Erro ao criar item:", error);
      toast.error("Erro ao criar item");
    }
  };

  const handleUpdateMenuItem = async (data: {
    name: string;
    description?: string;
    price: number;
    image?: string | null;
    categoryId: string;
  }) => {
    if (!editingMenuItem) return;

    try {
      const response = await fetch(`/api/menu-items/${editingMenuItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Item atualizado com sucesso!");
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao atualizar item");
      }
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      toast.error("Erro ao atualizar item");
    }
  };

  const handleDeleteMenuItem = async () => {
    if (!itemToDelete || "icon" in itemToDelete) return;

    try {
      const response = await fetch(`/api/menu-items/${itemToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Item deletado com sucesso!");
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao deletar item");
      }
    } catch (error) {
      console.error("Erro ao deletar item:", error);
      toast.error("Erro ao deletar item");
    } finally {
      setShowDeleteMenuItemDialog(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Administração do Sistema
          </h1>
          <p className="text-gray-600">
            Gerencie categorias e itens do seu cardápio
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("categories")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "categories"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Tag className="w-4 h-4 inline mr-2" />
                Categorias ({categories.length})
              </button>
              <button
                onClick={() => setActiveTab("menu")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "menu"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Package className="w-4 h-4 inline mr-2" />
                Itens do Menu ({menuItems.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              <>
                {/* Categorias */}
                {activeTab === "categories" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Categorias
                      </h2>
                      <Button
                        onClick={() => {
                          setEditingCategory(null);
                          setShowCategoryForm(true);
                        }}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Categoria
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categories.map((category) => (
                        <Card key={category.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                  <span className="text-lg">🎯</span>
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{category.name}</CardTitle>
                                  <p className="text-sm text-gray-500">{category.icon}</p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingCategory(category);
                                    setShowCategoryForm(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setItemToDelete(category);
                                    setShowDeleteCategoryDialog(true);
                                  }}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                {category._count?.menuItems || 0} itens
                              </span>
                              <Badge variant="secondary">
                                {new Date(category.createdAt).toLocaleDateString()}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Itens do Menu */}
                {activeTab === "menu" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Itens do Menu
                      </h2>
                      <Button
                        onClick={() => {
                          setEditingMenuItem(null);
                          setShowMenuItemForm(true);
                        }}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Item
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {menuItems.map((item) => (
                        <Card key={item.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <Package className="w-6 h-6" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-lg truncate">
                                    {item.name}
                                  </CardTitle>
                                  <p className="text-sm text-gray-500 truncate">
                                    {item.category.name}
                                  </p>
                                  <p className="text-lg font-bold text-orange-600">
                                    R${item.price.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingMenuItem(item);
                                    setShowMenuItemForm(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setItemToDelete(item);
                                    setShowDeleteMenuItemDialog(true);
                                  }}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          {item.description && (
                            <CardContent>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {item.description}
                              </p>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Formulário de Categoria */}
      <CategoryForm
        isOpen={showCategoryForm}
        onClose={() => {
          setShowCategoryForm(false);
          setEditingCategory(null);
        }}
        onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
        initialData={editingCategory ? { name: editingCategory.name, icon: editingCategory.icon } : undefined}
        isEditing={!!editingCategory}
      />

      {/* Formulário de Item do Menu */}
      <MenuItemForm
        isOpen={showMenuItemForm}
        onClose={() => {
          setShowMenuItemForm(false);
          setEditingMenuItem(null);
        }}
        onSubmit={editingMenuItem ? handleUpdateMenuItem : handleCreateMenuItem}
        initialData={editingMenuItem ? {
          name: editingMenuItem.name,
          description: editingMenuItem.description,
          price: editingMenuItem.price,
          image: editingMenuItem.image || undefined,
          categoryId: editingMenuItem.categoryId,
        } : undefined}
        isEditing={!!editingMenuItem}
      />

      {/* Diálogo de confirmação para deletar categoria */}
      <AlertDialog open={showDeleteCategoryDialog} onOpenChange={setShowDeleteCategoryDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta categoria? Esta ação não pode ser desfeita.
                      {itemToDelete && "icon" in itemToDelete && itemToDelete._count && itemToDelete._count.menuItems > 0 && (
          <span className="block mt-2 text-red-600 font-medium">
            ⚠️ Esta categoria possui {itemToDelete._count.menuItems} item(s) associado(s).
          </span>
        )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-red-600 hover:bg-red-700"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de confirmação para deletar item */}
      <AlertDialog open={showDeleteMenuItemDialog} onOpenChange={setShowDeleteMenuItemDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Item</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este item do menu? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMenuItem}
              className="bg-red-600 hover:bg-red-700"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
