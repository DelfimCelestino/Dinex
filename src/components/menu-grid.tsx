"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useDebounce } from "use-debounce";
import {
  ShoppingCart,
  MapPin,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { Edit, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CategoryFilter, Category } from "@/components/category-filter";
import { MenuItemCard, MenuItem } from "@/components/menu-item-card";
import { Receipt } from "@/components/ui/receipt";
import { CategoryForm } from "@/components/category-form";
import { MenuItemForm } from "@/components/menu-item-form";
import { Skeleton } from "@/components/ui/skeleton";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  dbId?: string; // ID do banco de dados
  hasStock?: boolean;
  stockQuantity?: number | null;
  minStockAlert?: number | null;
}

// Função para obter role do usuário via API
const getUserRole = async () => {
  try {
    const response = await fetch('/api/auth/me');
    
    if (!response.ok) {
      return null;
    }
    
    const userData = await response.json();
    
    if (!userData.id || !userData.role) {
      return null;
    }
    
    const normalizedRole = userData.role ? userData.role.toUpperCase() : '';
    return normalizedRole;
  } catch (error) {
    console.error('❌ Erro ao obter dados do usuário:', error);
    return null;
  }
};



export function MenuGrid() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTakeaway, setIsTakeaway] = useState(true);
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedTable, setSelectedTable] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [showKitchenDialog, setShowKitchenDialog] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [amountReceived, setAmountReceived] = useState("");
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState("");
  const [generateReceipt, setGenerateReceipt] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRoleLoaded, setIsRoleLoaded] = useState(false);
  const [isOperatorUser, setIsOperatorUser] = useState(false);
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set());
  const [categories, setCategories] = useState<Category[]>([
    { id: "all", name: "Todos", icon: "🍽️", count: 0, active: true },
    { id: "favorites", name: "Favoritos", icon: "❤️", count: 0, active: false, isFavorite: true },
  ]);
  
  // Estados dos formulários
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showMenuItemForm, setShowMenuItemForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<any>(null);
  
  // Estados dos diálogos de confirmação
  const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] = useState(false);
  const [showDeleteMenuItemDialog, setShowDeleteMenuItemDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  
  // Estado de busca
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [isSearchingMenu, setIsSearchingMenu] = useState(false);
  const [searchResults, setSearchResults] = useState<MenuItem[]>([]);
  const [hasSearchedDatabase, setHasSearchedDatabase] = useState(false);

  // Estados para scroll infinito
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const itemsPerPage = 12; // Número de itens por página

  // Observer para scroll infinito automático
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);

  // Função helper para calcular estoque disponível considerando o carrinho
  const getAvailableStock = (item: MenuItem) => {
    if (!item.hasStock || item.stockQuantity === null || item.stockQuantity === undefined) {
      return null; // Sem controle de estoque
    }
    
    const cartQuantity = cart.find(cartItem => cartItem.id === item.id)?.quantity || 0;
    const availableStock = item.stockQuantity - cartQuantity;
    

    
    return availableStock;
  };

  // Função helper para converter dados do banco
  const convertMenuData = (menuData: any[]) => {
    return menuData.map((item: any, index: number) => {
      // Gerar ID único baseado no ID do banco ou índice
      let uniqueId: number;
      if (item.id && typeof item.id === 'string') {
        // Tentar extrair números do ID do banco
        const numericPart = item.id.replace(/\D/g, '');
        if (numericPart.length > 0) {
          uniqueId = parseInt(numericPart.slice(-6)) || (index + 1);
        } else {
          uniqueId = index + 1;
        }
      } else {
        uniqueId = index + 1;
      }
      
      return {
        id: uniqueId,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image || "/placeholder.jpg", // Garantir que sempre tenha uma imagem
        category: item.category.name.toLowerCase().replace(/\s+/g, "-"),
        categoryId: item.categoryId || item.category.id, // ID da categoria no banco
        isFavorite: item.isFavorite,
        dbId: item.id, // ID original do banco
        // Campos de estoque
        hasStock: item.hasStock || false,
        stockQuantity: item.stockQuantity,
        minStockAlert: item.minStockAlert,
      } as MenuItem;
    });
  };

  // Carregar dados do banco
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Debug: verificar o role do usuário
        const currentUserRole = await getUserRole();
        setUserRole(currentUserRole);
        setIsOperatorUser(currentUserRole === 'OPERATOR');
        setIsRoleLoaded(true);
        
        const [menuItemsRes, categoriesRes, paymentMethodsRes, areasRes, tablesRes, ordersRes] = await Promise.all([
          fetch("/api/menu-items"),
          fetch("/api/categories"),
          fetch("/api/payment-methods"),
          fetch("/api/areas"),
          fetch("/api/tables"),
          fetch("/api/orders?activeOnly=true"),
        ]);

        if (menuItemsRes.ok) {
          const menuData = await menuItemsRes.json();
          const convertedItems = convertMenuData(menuData);
          setMenuItems(convertedItems);
          
          // Carregar favoritos do banco de dados
          const favoriteItems = convertedItems.filter(item => item.isFavorite);
          const favoriteIds = new Set(favoriteItems.map(item => item.id));
          setFavorites(favoriteIds);
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setDbCategories(categoriesData);
          
          // Adicionar categorias do banco com ícones corretos
          const dbCategoryItems = categoriesData.map((cat: any) => ({
            id: cat.name.toLowerCase().replace(/\s+/g, "-"),
            name: cat.name,
            icon: cat.icon || "🎯", // Usar o ícone do banco ou fallback
            count: 0,
            active: false,
          }));
          
          setCategories(prev => [
            ...prev.slice(0, 2), // Manter "Todos" e "Favoritos"
            ...dbCategoryItems,
          ]);
        }

        if (paymentMethodsRes.ok) {
          const paymentMethodsData = await paymentMethodsRes.json();
          setPaymentMethods(paymentMethodsData);
        }

        if (areasRes.ok) {
          const areasData = await areasRes.json();
          setAreas(areasData);
        }

        if (tablesRes.ok) {
          const tablesData = await tablesRes.json();
          setTables(tablesData);
        }

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setExistingOrders(ordersData);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Obter role do usuário
  useEffect(() => {
    const fetchUserRole = async () => {
      const role = await getUserRole();
      setUserRole(role);
      setIsOperatorUser(role === 'OPERATOR');
    };
    fetchUserRole();
  }, []);

  const updateCartItemQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      // Verificar estoque se o item tem controle de estoque
      const menuItem = menuItems.find(item => item.id === itemId);
      if (menuItem && menuItem.hasStock && menuItem.stockQuantity !== null && menuItem.stockQuantity !== undefined) {
        // Para updateCartItemQuantity, verificamos se a nova quantidade não excede o estoque total
        if (newQuantity > menuItem.stockQuantity) {
          toast.error("Estoque insuficiente!", {
            description: `Só há ${menuItem.stockQuantity} unidade(s) disponível(is) de ${menuItem.name}`,
            duration: 3000,
            position: "top-left",
          });
          return;
        }
      }
      
      setCart(
        cart.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeFromCart = (itemId: number) => {
    setCart(cart.filter((item) => item.id !== itemId));
    toast("Removido do carrinho", {
      description: "Item removido com sucesso",
      duration: 2000,
      position: "top-left",
    });
  };

  const playAddToCartSound = () => {
    try {
      const audio = new Audio("/sound/click.mp3");
      audio.volume = 0.3;
      audio.play().catch((e) => console.log("Sound play failed:", e));
    } catch (error) {
      console.log("Sound creation failed:", error);
    }
  };

  const playDoorbellSound = () => {
    try {
      const audio = new Audio("/sound/doorbel.mp3");
      audio.volume = 0.4;
      audio.play().catch((e) => console.log("Doorbell sound play failed:", e));
    } catch (error) {
      console.log("Doorbell sound creation failed:", error);
    }
  };

  const addToCart = (item: (typeof menuItems)[0]) => {
    // Verificar se o item tem controle de estoque e se há estoque disponível
    const availableStock = getAvailableStock(item);
    
    if (availableStock !== null) {
      if (availableStock <= 0) {
        toast.error("Produto sem estoque!", {
          description: `${item.name} está indisponível no momento`,
          duration: 3000,
          position: "top-left",
        });
        return;
      }
      
      // Verificar se há estoque suficiente para adicionar mais uma unidade
      if (availableStock < 1) {
        toast.error("Estoque insuficiente!", {
          description: `Só há ${availableStock} unidade(s) disponível(is) de ${item.name}`,
          duration: 3000,
          position: "top-left",
        });
        return;
      }
    }

    const existingItem = cart.find((cartItem) => cartItem.id === item.id);

    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { 
        ...item, 
        quantity: 1,
        dbId: item.dbId // Incluir o dbId
      }]);
    }

    // Visual feedback
    setAddedItems(prev => new Set([...prev, item.id]));
    setTimeout(() => {
      setAddedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }, 1000);

    playAddToCartSound();
    toast("Adicionado ao carrinho", {
      description: `${item.name} foi adicionado ao carrinho`,
      duration: 2000,
      position: "top-left",
    });
  };

  const toggleFavorite = async (itemId: number) => {
    // Encontrar o item no menuItems para obter o ID do banco
    const menuItem = menuItems.find(item => item.id === itemId);
    if (!menuItem || !menuItem.dbId) return;

    const isCurrentlyFavorite = favorites.has(itemId);
    
    try {
      const response = await fetch(`/api/menu-items/${menuItem.dbId}/favorite`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !isCurrentlyFavorite }),
      });

      if (response.ok) {
        // Atualizar favoritos localmente
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
          if (isCurrentlyFavorite) {
        newFavorites.delete(itemId);
      } else {
        newFavorites.add(itemId);
      }
      return newFavorites;
    });

        // Atualizar o item na lista local
        setMenuItems(prev => 
          prev.map(item => 
            item.id === itemId 
              ? { ...item, isFavorite: !isCurrentlyFavorite }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar favorito:", error);
      toast.error("Erro ao atualizar favorito");
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Update active state
    setCategories(prev => prev.map(cat => ({
      ...cat,
      active: cat.id === categoryId
    })));
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowCategoryForm(true);
  };

  const handleCreateCategory = async (data: { name: string; icon: string }) => {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Categoria criada com sucesso!");
        // Recarregar dados
        const categoriesRes = await fetch("/api/categories");
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setDbCategories(categoriesData);
          
          const dbCategoryItems = categoriesData.map((cat: any) => ({
            id: cat.name.toLowerCase().replace(/\s+/g, "-"),
            name: cat.name,
            icon: cat.icon || "🎯",
            count: 0,
            active: false,
          }));
          
          setCategories(prev => [
            ...prev.slice(0, 2), // Manter "Todos" e "Favoritos"
            ...dbCategoryItems,
          ]);
          
          // Resetar categoria selecionada para "all" após criar nova
          setSelectedCategory("all");
          setCategories(prev => prev.map(cat => ({
            ...cat,
            active: cat.id === "all"
          })));
        }
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
        // Recarregar dados
        const categoriesRes = await fetch("/api/categories");
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setDbCategories(categoriesData);
          
          const dbCategoryItems = categoriesData.map((cat: any) => ({
            id: cat.name.toLowerCase().replace(/\s+/g, "-"),
            name: cat.name,
            icon: cat.icon || "🎯",
            count: 0,
            active: false,
          }));
          
          setCategories(prev => [
            ...prev.slice(0, 2),
            ...dbCategoryItems,
          ]);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao atualizar categoria");
      }
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      toast.error("Erro ao atualizar categoria");
    }
  };

  const handleCreateMenuItem = async (data: {
    name: string;
    description?: string;
    price: number;
    image?: string | null;
    categoryId: string;
    hasStock?: boolean;
    stockQuantity?: number | null;
    minStockAlert?: number | null;
  }) => {
    try {
      const response = await fetch("/api/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Item criado com sucesso!");
        // Recarregar dados
        const menuItemsRes = await fetch("/api/menu-items");
        if (menuItemsRes.ok) {
          const menuData = await menuItemsRes.json();
          const convertedItems = convertMenuData(menuData);
          setMenuItems(convertedItems);
          
          // Atualizar favoritos
          const favoriteItems = convertedItems.filter(item => item.isFavorite);
          const favoriteIds = new Set(favoriteItems.map(item => item.id));
          setFavorites(favoriteIds);
        }
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
    hasStock?: boolean;
    stockQuantity?: number | null;
    minStockAlert?: number | null;
  }) => {
    if (!editingMenuItem) return;

    try {
      // Usar o dbId se disponível, senão usar o id normal
      const itemId = editingMenuItem.dbId || editingMenuItem.id;
      const response = await fetch(`/api/menu-items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Item atualizado com sucesso!");
        // Recarregar dados
        const menuItemsRes = await fetch("/api/menu-items");
        if (menuItemsRes.ok) {
          const menuData = await menuItemsRes.json();
          const convertedItems = convertMenuData(menuData);
          setMenuItems(convertedItems);
          
          // Atualizar favoritos
          const favoriteItems = convertedItems.filter(item => item.isFavorite);
          const favoriteIds = new Set(favoriteItems.map(item => item.id));
          setFavorites(favoriteIds);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao atualizar item");
      }
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      toast.error("Erro ao atualizar item");
    }
  };

  const handleDeleteCategory = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(`/api/categories/${itemToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Categoria deletada com sucesso!");
        // Recarregar dados
        const categoriesRes = await fetch("/api/categories");
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setDbCategories(categoriesData);
          
          const dbCategoryItems = categoriesData.map((cat: any) => ({
            id: cat.name.toLowerCase().replace(/\s+/g, "-"),
            name: cat.name,
            icon: cat.icon || "🎯",
            count: 0,
            active: false,
          }));
          
          setCategories(prev => [
            ...prev.slice(0, 2),
            ...dbCategoryItems,
          ]);
        }
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

  const handleDeleteMenuItem = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(`/api/menu-items/${itemToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Item deletado com sucesso!");
        // Recarregar dados
        const menuItemsRes = await fetch("/api/menu-items");
        if (menuItemsRes.ok) {
          const menuData = await menuItemsRes.json();
          const convertedItems = convertMenuData(menuData);
          setMenuItems(convertedItems);
          
          // Atualizar favoritos
          const favoriteItems = convertedItems.filter(item => item.isFavorite);
          const favoriteIds = new Set(favoriteItems.map(item => item.id));
          setFavorites(favoriteIds);
        }
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

  const handleSendToKitchen = () => {
    // Abre diálogo de pagamento apenas para confirmar envio à cozinha sem pagamento
    setShowPaymentDialog(false);
    setShowKitchenDialog(true);
  };

  const handleConfirmKitchen = async () => {
    try {
      // Verificar estoque antes de criar o pedido
      const stockErrors: string[] = [];
      
      for (const cartItem of cart) {
        const menuItem = menuItems.find(item => item.id === cartItem.id);
        if (menuItem && menuItem.hasStock && menuItem.stockQuantity !== null && menuItem.stockQuantity !== undefined) {
          if (menuItem.stockQuantity < cartItem.quantity) {
            stockErrors.push(`${menuItem.name}: só há ${menuItem.stockQuantity} unidade(s) disponível(is), mas foram solicitadas ${cartItem.quantity}`);
          }
        }
      }
      
      if (stockErrors.length > 0) {
        toast.error("Estoque insuficiente para alguns produtos!", {
          description: stockErrors.join('\n'),
          duration: 5000,
          position: "top-left",
        });
        return;
      }

      // Criar pedido sem pagamento (status NEW)
      const orderData = {
        customerName: customerName.trim() || null,
        isDelivery: isTakeaway,
        areaId: selectedAreaId || null,
        tableId: selectedTableId || null,
        items: cart.map(item => ({
          menuItemId: item.dbId || item.id.toString(),
          quantity: item.quantity,
          unitPrice: item.price,
          notes: null,
        })),
        paymentMethodId: null,
        amountReceived: null,
        notes: orderNotes.trim() || null,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();
        
        // Atualizar estoque localmente
        const updatedMenuItems = menuItems.map(item => {
          const cartItem = cart.find(ci => ci.id === item.id);
          if (cartItem && item.hasStock && item.stockQuantity !== null && item.stockQuantity !== undefined) {
            return {
              ...item,
              stockQuantity: item.stockQuantity - cartItem.quantity
            };
          }
          return item;
        });
        setMenuItems(updatedMenuItems);
        
        // Tocar som de doorbell
        playDoorbellSound();
        
        toast("Pedido enviado para a cozinha!", {
          description: `Pedido ${order.orderNumber} foi enviado para preparo`,
          duration: 3000,
          position: "top-left",
        });
        setCart([]);
        setIsCartOpen(false);
        setShowKitchenDialog(false);
        setCustomerName("");
        setSelectedAreaId("");
        setSelectedTableId("");
        setSelectedPayment("");
        setSelectedPaymentMethod("");
        setAmountReceived("");
        setOrderNotes("");
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao enviar para preparo");
      }
    } catch (error) {
      console.error("Erro ao enviar para preparo:", error);
      toast.error("Erro ao enviar para preparo");
    }
  };

  // Função para buscar pedidos com termo de pesquisa
  const searchOrders = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      // Se não há termo de busca, carregar todos os pedidos ativos
      const response = await fetch("/api/orders?activeOnly=true");
      if (response.ok) {
        const ordersData = await response.json();
        setExistingOrders(ordersData);
      }
      return;
    }

    setIsSearchingOrders(true);
    try {
      const response = await fetch(`/api/orders?activeOnly=true&orderSearch=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const ordersData = await response.json();
        setExistingOrders(ordersData);
      }
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
      toast.error("Erro ao buscar pedidos");
    } finally {
      setIsSearchingOrders(false);
    }
  };

  // Função para busca híbrida no menu (local + banco de dados)
  const searchMenuItems = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setHasSearchedDatabase(false);
      return;
    }

    setIsSearchingMenu(true);
    try {
      // Primeiro, buscar nos itens já carregados localmente
      const localResults = menuItems.filter((item) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          item.name.toLowerCase().includes(searchLower) ||
          (item.description && item.description.toLowerCase().includes(searchLower)) ||
          item.category.toLowerCase().includes(searchLower)
        );
      });

      setSearchResults(localResults);

      // Se não encontrou resultados suficientes localmente, buscar no banco
      if (localResults.length < 3) {
        const response = await fetch(`/api/menu-items?search=${encodeURIComponent(searchTerm)}`);
        if (response.ok) {
          const dbResults = await response.json();
          const convertedDbResults = convertMenuData(dbResults);
          
          // Combinar resultados locais com resultados do banco
          const combinedResults = [...localResults];
          
          // Adicionar apenas itens do banco que não estão nos resultados locais
          dbResults.forEach((dbItem: any) => {
            const convertedItem = convertedDbResults.find(item => item.dbId === dbItem.id);
            if (convertedItem && !localResults.find(local => local.dbId === dbItem.id)) {
              combinedResults.push(convertedItem);
            }
          });

          setSearchResults(combinedResults);
          setHasSearchedDatabase(true);
          
          // Mostrar toast informativo se encontrou resultados no banco
          if (combinedResults.length > localResults.length) {
            toast.success(`Busca expandida: ${combinedResults.length - localResults.length} item(s) encontrado(s) no banco de dados`, {
              duration: 3000,
            });
          }
        }
      } else {
        setHasSearchedDatabase(false);
      }
    } catch (error) {
      console.error("Erro ao buscar itens do menu:", error);
      toast.error("Erro ao buscar itens do menu");
    } finally {
      setIsSearchingMenu(false);
    }
  };

  // Função para adicionar itens a pedidos existentes
  const handleAddToExistingOrder = async () => {
    if (!selectedExistingOrder) {
      toast.error("Selecione um pedido para adicionar os itens");
      return;
    }

    try {
      const orderToUpdate = existingOrders.find(o => o.id === selectedExistingOrder);
      if (!orderToUpdate) {
        toast.error("Pedido não encontrado");
        return;
      }

      // Verificar se o pedido já foi pago
      if (orderToUpdate.isPaid) {
        toast.error("Não é possível adicionar itens a um pedido já pago!", {
          description: "Crie um novo pedido para os itens adicionais",
          duration: 5000,
        });
        return;
      }

      // Verificar estoque antes de adicionar itens
      const stockErrors: string[] = [];
      
      for (const cartItem of cart) {
        const menuItem = menuItems.find(item => item.id === cartItem.id);
        if (menuItem && menuItem.hasStock && menuItem.stockQuantity !== null && menuItem.stockQuantity !== undefined) {
          if (menuItem.stockQuantity < cartItem.quantity) {
            stockErrors.push(`${menuItem.name}: só há ${menuItem.stockQuantity} unidade(s) disponível(is), mas foram solicitadas ${cartItem.quantity}`);
          }
        }
      }
      
      if (stockErrors.length > 0) {
        toast.error("Estoque insuficiente para alguns produtos!", {
          description: stockErrors.join('\n'),
          duration: 5000,
          position: "top-left",
        });
        return;
      }

      // Preparar itens para adicionar
      const newItems = cart.map(item => ({
        menuItemId: item.dbId || item.id.toString(),
        quantity: item.quantity,
        unitPrice: item.price,
        notes: null,
      }));

      // Adicionar itens ao pedido existente
      const response = await fetch(`/api/orders/${selectedExistingOrder}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          items: [
            ...orderToUpdate.orderItems.map((oi: any) => ({
              id: oi.id,
              quantity: oi.quantity,
              unitPrice: oi.unitPrice,
            })),
            ...newItems
          ]
        }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        
        // Atualizar estoque localmente
        const updatedMenuItems = menuItems.map(item => {
          const cartItem = cart.find(ci => ci.id === item.id);
          if (cartItem && item.hasStock && item.stockQuantity !== null && item.stockQuantity !== undefined) {
            return {
              ...item,
              stockQuantity: item.stockQuantity - cartItem.quantity
            };
          }
          return item;
        });
        setMenuItems(updatedMenuItems);
        
        toast.success("Itens adicionados ao pedido existente!", {
          description: `Pedido ${updatedOrder.orderNumber} foi atualizado`,
          duration: 3000,
        });
        
        // Limpar carrinho e resetar estados
        setCart([]);
        setIsCartOpen(false);
        setSelectedExistingOrder("");
        setOrderMode('new');
        
        // Recarregar pedidos para atualizar a lista
        const ordersRes = await fetch("/api/orders?activeOnly=true");
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setExistingOrders(ordersData);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao adicionar itens ao pedido");
      }
    } catch (error) {
      console.error("Erro ao adicionar itens ao pedido:", error);
      toast.error("Erro ao adicionar itens ao pedido");
    }
  };

  const handlePayNow = () => {
    // Abre o diálogo de pagamento para finalizar como DELIVERED
    setShowPaymentDialog(true);
  };

  const handleConfirmPayment = async () => {
    const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);
    // Exigir montante para qualquer método selecionado
    if (selectedPaymentMethod) {
      const received = parseFloat(amountReceived);
      if (!amountReceived || Number.isNaN(received) || received < totalPrice) {
        const missing = totalPrice - (Number.isNaN(received) ? 0 : received);
        toast("Valor insuficiente!", {
          description: `Faltam R$${missing.toFixed(2)} para completar o pagamento`,
          duration: 4000,
          position: "top-left",
        });
        return;
      }
    }

    try {
      // Verificar estoque antes de criar o pedido
      const stockErrors: string[] = [];
      
      for (const cartItem of cart) {
        const menuItem = menuItems.find(item => item.id === cartItem.id);
        if (menuItem && menuItem.hasStock && menuItem.stockQuantity !== null && menuItem.stockQuantity !== undefined) {
          if (menuItem.stockQuantity < cartItem.quantity) {
            stockErrors.push(`${menuItem.name}: só há ${menuItem.stockQuantity} unidade(s) disponível(is), mas foram solicitadas ${cartItem.quantity}`);
          }
        }
      }
      
      if (stockErrors.length > 0) {
        toast.error("Estoque insuficiente para alguns produtos!", {
          description: stockErrors.join('\n'),
          duration: 5000,
          position: "top-left",
        });
        return;
      }

      const orderData = {
        customerName: customerName.trim() || null,
        isDelivery: isTakeaway,
        areaId: selectedAreaId || null,
        tableId: selectedTableId || null,
        items: cart.map(item => ({
          menuItemId: item.dbId || item.id.toString(),
          quantity: item.quantity,
          unitPrice: item.price,
          notes: null,
        })),
        paymentMethodId: selectedPaymentMethod || null,
        amountReceived: selectedPaymentMethod ? parseFloat(amountReceived) : null,
        notes: orderNotes.trim() || null,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();
        
        // Atualizar estoque localmente
        const updatedMenuItems = menuItems.map(item => {
          const cartItem = cart.find(ci => ci.id === item.id);
          if (cartItem && item.hasStock && item.stockQuantity !== null && item.stockQuantity !== undefined) {
            return {
              ...item,
              stockQuantity: item.stockQuantity - cartItem.quantity
            };
          }
          return item;
        });
        setMenuItems(updatedMenuItems);
        
        toast("Pedido pago e finalizado com sucesso!", {
          description: `Pedido ${order.orderNumber} foi entregue`,
      duration: 3000,
      position: "top-left",
    });
    const audio = new Audio("/sound/coins.mp3");
    audio.volume = 0.5;
        audio.play().catch(() => {});
    
    if (generateReceipt) {
      setShowPaymentDialog(false);
      setShowReceiptDialog(true);
    } else {
      setCart([]);
      setIsCartOpen(false);
          setShowPaymentDialog(false);
      setCustomerName("");
          setSelectedAreaId("");
          setSelectedTableId("");
      setSelectedPayment("");
          setSelectedPaymentMethod("");
      setAmountReceived("");
          setOrderNotes("");
      setGenerateReceipt(false);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao finalizar pagamento");
      }
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      toast.error("Erro ao criar pedido");
    }
  };

  const handleCloseReceipt = () => {
    setShowReceiptDialog(false);
    setCart([]);
    setIsCartOpen(false);
    setCustomerName("");
    setSelectedArea("");
    setSelectedTable("");
    setSelectedPayment("");
    setAmountReceived("");
    setGenerateReceipt(false);
  };

  // Update category counts
  const updatedCategories = useMemo(() => {
    return categories.map(category => {
      if (category.id === "all") {
        return { ...category, count: menuItems.length };
      }
      if (category.id === "favorites") {
        return { ...category, count: favorites.size };
      }
      const count = menuItems.filter(item => item.category === category.id).length;
      return { ...category, count };
    });
  }, [menuItems, favorites, categories]);

  // Filter items based on category
  const filteredItems = useMemo(() => {
    let filtered = menuItems;

    // Debug: log dos valores
    console.log("Filtro - selectedCategory:", selectedCategory);
    console.log("Filtro - menuItems:", menuItems.length);
    console.log("Filtro - dbCategories:", dbCategories.length);

    // Filtrar por categoria
    if (selectedCategory === "all") {
      filtered = menuItems;
    } else if (selectedCategory === "favorites") {
      filtered = menuItems.filter(item => favorites.has(item.id));
    } else {
      // Filtrar por categoria usando o campo category (que é o slug da categoria)
      filtered = menuItems.filter(item => item.category === selectedCategory);
      console.log("Filtro - categoria selecionada:", selectedCategory);
      console.log("Filtro - itens filtrados:", filtered.length);
      console.log("Filtro - exemplo de item:", filtered[0]);
    }

    // Se há termo de busca, usar resultados da busca híbrida
    if (debouncedSearchTerm.trim()) {
      filtered = searchResults;
    }

    return filtered;
  }, [menuItems, selectedCategory, favorites, debouncedSearchTerm, searchResults]);

  // Items paginados para exibição
  const paginatedItems = useMemo(() => {
    const startIndex = 0;
    const endIndex = currentPage * itemsPerPage;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, currentPage, itemsPerPage]);

  // Verificar se há mais itens
  useEffect(() => {
    setHasMore(paginatedItems.length < filteredItems.length);
  }, [paginatedItems.length, filteredItems.length]);

  // Resetar página quando mudar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);

  // Função para carregar mais itens
  const loadMoreItems = () => {
    if (hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setIsLoadingMore(false);
      }, 500); // Simular delay de carregamento
    }
  };

  // Configurar observer para último item
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreItems();
        }
      },
      { threshold: 0.1 }
    );

    if (lastItemRef.current) {
      observerRef.current.observe(lastItemRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingMore, paginatedItems.length]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Estados para pagamento
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  
  // Estados para áreas e mesas
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [selectedTableId, setSelectedTableId] = useState<string>("");

  // Estados para gerenciar pedidos existentes
  const [existingOrders, setExistingOrders] = useState<any[]>([]);
  const [selectedExistingOrder, setSelectedExistingOrder] = useState<string>("");
  const [showOrderSelection, setShowOrderSelection] = useState(false);
  const [orderMode, setOrderMode] = useState<'new' | 'existing'>('new');
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [isSearchingOrders, setIsSearchingOrders] = useState(false);

  // Buscar pedidos quando o termo de pesquisa mudar
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchOrders(orderSearchTerm);
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [orderSearchTerm]);

  // Buscar itens do menu quando o termo de busca com debounce mudar
  useEffect(() => {
    searchMenuItems(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="wrapper">
        {/* Search Bar */}
        <div className="relative mb-6">
            <input
              type="text"
            placeholder="Pesquisar no cardápio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 pr-20 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          
          {/* Indicadores de busca */}
          {isSearchingMenu && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {searchTerm && !isSearchingMenu && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          
          {/* Info de busca */}
          {debouncedSearchTerm && (
            <div className="absolute -bottom-8 left-0 text-xs text-gray-500">
              {searchResults.length > 0 ? (
                <div className="flex items-center gap-2">
                  <span>🔍 {searchResults.length} resultado(s) encontrado(s)</span>
                  {hasSearchedDatabase && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                      Banco de dados
                    </span>
                  )}
                  {isSearchingMenu && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full animate-pulse">
                      Buscando...
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>❌ Nenhum resultado encontrado</span>
                  {isSearchingMenu && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full animate-pulse">
                      Expandindo busca...
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dica sobre busca híbrida */}
        {!debouncedSearchTerm && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <span className="text-lg">💡</span>
              <div className="text-sm">
                <p className="font-medium">Busca Inteligente</p>
                <p className="text-blue-600">
                  Digite para buscar primeiro nos itens carregados, depois automaticamente no banco de dados
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Categories */}
        <CategoryFilter
          categories={updatedCategories}
          onCategoryChange={handleCategoryChange}
          onAddCategory={!isOperatorUser ? handleAddCategory : undefined}
          onEditCategory={!isOperatorUser ? (category) => {
            setEditingCategory(category);
            setShowCategoryForm(true);
          } : undefined}
          onDeleteCategory={!isOperatorUser ? (category) => {
            setItemToDelete(category);
            setShowDeleteCategoryDialog(true);
          } : undefined}
          dbCategories={dbCategories}
          showAdminControls={!isOperatorUser}
        />

        {/* Instruction */}
        {/* <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
          <p className="text-orange-700 font-medium">
            💡 <strong>Dica:</strong> Clique em qualquer card para adicionar o item ao carrinho!
          </p>
          <p className="text-sm text-orange-600 mt-1">
            Cada clique adiciona +1 do produto selecionado
          </p>
        </div> */}

        {/* Food Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-start">
          {/* Add New Item Card - Só mostrar se não for OPERADOR */}
          {!isOperatorUser && (
            <div 
              className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-all duration-200 hover:shadow-lg bg-white/60 backdrop-blur-sm h-fit rounded-lg cursor-pointer"
              onClick={() => {
                setEditingMenuItem(null);
                setShowMenuItemForm(true);
              }}
            >
              <div className="p-4 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-gray-500" />
                </div>
                <p className="text-sm font-medium text-gray-600">Adicionar Item</p>
              </div>
            </div>
          )}


          {/* Food Items */}
          {isLoading ? (
            <>
              {[...Array(8)].map((_, index) => (
                <div 
                  key={index} 
                  className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-gray-100 rounded-lg border cursor-pointer group"
                >
                  {/* Imagem skeleton - mesma altura dos cards reais */}
                  <div className="relative">
                    <Skeleton className="w-full h-32 rounded-t-lg" />
                    
                    {/* Botões de ação skeleton */}
                    <div className="absolute top-2 right-2 flex gap-1 z-50">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <Skeleton className="w-8 h-8 rounded-full" />
                    </div>
                  </div>
                  
                  {/* Conteúdo skeleton - mesmo padding dos cards reais */}
                  <div className="p-4">
                    <Skeleton className="h-5 w-3/4 mb-1" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-2/3 mb-3" />
                    
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-20" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {debouncedSearchTerm ? "Nenhum item encontrado" : "Nenhum item disponível"}
              </h3>
              <p className="text-gray-500 mb-4">
                {debouncedSearchTerm ? (
                  <>
                    Nenhum resultado para <span className="font-medium">"{debouncedSearchTerm}"</span>
                    <br />
                    <span className="text-sm text-gray-400">
                      Tente usar termos diferentes ou verificar a ortografia
                    </span>
                  </>
                ) : (
                  "Nenhum item disponível no momento"
                )}
              </p>
              {debouncedSearchTerm && (
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setSearchTerm("")}
                    className="text-orange-600 border-orange-300 hover:bg-orange-50"
                  >
                    Limpar busca
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCategory("all")}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    Ver todos os itens
                  </Button>
                </div>
              )}
            </div>
          ) : (
            paginatedItems.map((item, index) => (
              <div
              key={item.id}
                ref={index === paginatedItems.length - 1 ? lastItemRef : null}
              >
                <MenuItemCard
              item={item}
              quantity={cart.find(cartItem => cartItem.id === item.id)?.quantity || 0}
              isFavorite={favorites.has(item.id)}
              isAdded={addedItems.has(item.id)}
              onToggleFavorite={toggleFavorite}
              onAddToCart={addToCart}
                  onEditItem={!isOperatorUser ? (item) => {
                    // Encontrar o item original do banco
                    const dbItem = menuItems.find(dbItem => dbItem.id === item.id);
                    if (dbItem) {
                      // Encontrar a categoria correspondente
                      const category = dbCategories.find(cat => 
                        cat.name.toLowerCase().replace(/\s+/g, "-") === dbItem.category
                      );
                      if (category) {
                        setEditingMenuItem({
                          ...dbItem,
                          categoryId: category.id,
                        });
                      } else {
                        setEditingMenuItem(dbItem);
                      }
                      setShowMenuItemForm(true);
                    }
                  } : undefined}
                  onDeleteItem={!isOperatorUser ? (item) => {
                    // Encontrar o item original do banco para obter o ID correto
                    const dbItem = menuItems.find(dbItem => dbItem.id === item.id);
                    if (dbItem && dbItem.dbId) {
                      setItemToDelete({ ...item, id: dbItem.dbId });
                      setShowDeleteMenuItemDialog(true);
                    }
                  } : undefined}
                  showAdminControls={!isOperatorUser}
                />
              </div>
            ))
          )}
        </div>

        {/* Scroll infinito - carregar mais itens quando chegar ao final */}
        {!isLoading && filteredItems.length > 0 && (
          <div className="flex justify-center mt-8">
          <Button
            variant="outline"
              size="lg"
              className="border-orange-200 text-orange-600 hover:bg-orange-50"
              onClick={loadMoreItems}
              disabled={isLoadingMore || !hasMore}
            >
              {isLoadingMore ? "Carregando..." : "Carregar Mais Itens"}
          </Button>
        </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <Sheet open={isCartOpen} onOpenChange={(open) => {
          setIsCartOpen(open);
          if (!open) {
            // Resetar estados quando fechar o carrinho
            setOrderMode('new');
            setSelectedExistingOrder("");
          }
        }}>
          <SheetTrigger asChild>
            <Button className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110">
              <div className="relative">
                <ShoppingCart className="w-6 h-6" />
                <Badge className="absolute -top-6 -right-6 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                  {totalItems}
                </Badge>
              </div>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md bg-white overflow-y-auto p-6">
            {/* Header */}
            <SheetHeader className="pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <SheetTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-orange-500" />
                Carrinho
              </SheetTitle>
              <p className="text-sm text-gray-500">
                {totalItems} {totalItems === 1 ? "item" : "itens"}
              </p>
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  💡 <strong>Dica:</strong> Escolha entre criar um novo pedido ou adicionar itens a um pedido existente
                </p>
              </div>
            </SheetHeader>

            <div className="py-4 space-y-6">
              {/* Order Mode Selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Modo do Pedido
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 rounded-xl p-4 ${
                      orderMode === 'new'
                        ? "ring-2 ring-orange-500 bg-orange-50 border-orange-200 shadow-lg scale-105"
                        : "hover:scale-105 bg-gray-50 border-gray-200 hover:shadow-lg"
                    }`}
                    onClick={() => setOrderMode('new')}
                  >
                    <div className="text-center space-y-2">
                      <div className="text-3xl mb-2">🆕</div>
                      <p className="text-sm font-semibold">Novo Pedido</p>
                      {orderMode === 'new' && (
                        <div className="w-3 h-3 bg-orange-500 rounded-full mx-auto animate-pulse"></div>
                      )}
                    </div>
                  </div>
                  
                  <div
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 rounded-xl p-4 ${
                      orderMode === 'existing'
                        ? "ring-2 ring-orange-500 bg-orange-50 border-orange-200 shadow-lg scale-105"
                        : "hover:scale-105 bg-gray-50 border-gray-200 hover:shadow-lg"
                    }`}
                    onClick={() => setOrderMode('existing')}
                  >
                    <div className="text-center space-y-2">
                      <div className="text-3xl mb-2">➕</div>
                      <p className="text-sm font-semibold">Adicionar a Pedido</p>
                      {orderMode === 'existing' && (
                        <div className="w-3 h-3 bg-orange-500 rounded-full mx-auto animate-pulse"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Existing Order Selection */}
              {orderMode === 'existing' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Selecionar Pedido Existente
                  </h3>
                  
                  {/* Mini Search para Pedidos */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      🔍 Buscar Pedido
                    </Label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar por número, cliente, mesa ou área..."
                        value={orderSearchTerm}
                        onChange={(e) => setOrderSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 pl-10 pr-20 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      />
                      <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      {isSearchingOrders && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      {orderSearchTerm && !isSearchingOrders && (
                        <button
                          onClick={() => setOrderSearchTerm("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    {orderSearchTerm && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          Buscando pedidos que contenham "{orderSearchTerm}"...
                        </p>
                        <span className="text-xs text-gray-400">
                          {existingOrders.length} resultado(s)
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <Select value={selectedExistingOrder} onValueChange={setSelectedExistingOrder}>
                      <SelectTrigger className="w-full h-11 bg-white border-gray-200 hover:border-orange-300 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200">
                        <SelectValue placeholder={
                          existingOrders.length === 0 
                            ? "Nenhum pedido encontrado" 
                            : "Escolha um pedido ativo..."
                        } />
                      </SelectTrigger>
                      <SelectContent className="w-full max-h-60">
                        {existingOrders.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            {orderSearchTerm ? (
                              <>
                                <div className="text-2xl mb-2">🔍</div>
                                <p className="font-medium">Nenhum pedido encontrado</p>
                                <p className="text-sm">para "{orderSearchTerm}"</p>
                                <button
                                  onClick={() => setOrderSearchTerm("")}
                                  className="mt-2 text-xs text-orange-600 hover:text-orange-700 underline"
                                >
                                  Limpar busca
                                </button>
                              </>
                            ) : (
                              <>
                                <div className="text-2xl mb-2">📋</div>
                                <p className="font-medium">Nenhum pedido ativo</p>
                                <p className="text-sm">Crie um novo pedido para começar</p>
                              </>
                            )}
                          </div>
                        ) : (
                          existingOrders.map((order) => (
                            <SelectItem key={order.id} value={order.id} className="py-3">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">
                                  {order.orderNumber}
                                </span>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    order.status === 'NEW' ? 'bg-blue-100 text-blue-700' :
                                    order.status === 'PREPARING' ? 'bg-yellow-100 text-yellow-700' :
                                    order.status === 'READY' ? 'bg-green-100 text-green-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {order.status === 'NEW' ? 'Novo' :
                                     order.status === 'PREPARING' ? 'Preparando' :
                                     order.status === 'READY' ? 'Pronto' : order.status}
                                  </span>
                                  {order.customerName && (
                                    <>
                                      <span>•</span>
                                      <span>{order.customerName}</span>
                                    </>
                                  )}
                                  {order.table && (
                                    <>
                                      <span>•</span>
                                      <span>Mesa {order.table.name}</span>
                                    </>
                                  )}
                                </div>
                                <span className="text-xs text-gray-400 mt-1">
                                  {order.orderItems.length} item(s) • {order.totalAmount.toFixed(2)} MT
                                  {order.isPaid && (
                                    <span className="ml-2 text-green-600 font-medium">✓ Pago</span>
                                  )}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    
                    {selectedExistingOrder && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                          <span className="text-lg">✅</span>
                          <span>
                            Itens serão adicionados ao pedido <strong>
                              {existingOrders.find(o => o.id === selectedExistingOrder)?.orderNumber}
                            </strong>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cart Items */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Itens Selecionados
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-all duration-200"
                    >
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-md shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 text-sm truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.price.toFixed(2)} MT cada
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1 bg-white rounded-md border border-gray-200 px-2 py-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-6 h-6 p-0 hover:bg-gray-100 h-auto"
                            onClick={() =>
                              updateCartItemQuantity(item.id, item.quantity - 1)
                            }
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-6 text-center text-xs font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-6 h-6 p-0 hover:bg-gray-100 h-auto"
                            onClick={() =>
                              updateCartItemQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-orange-600">
                            {(item.price * item.quantity).toFixed(2)} MT
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs px-2 py-1 h-auto"
                            onClick={() => removeFromCart(item.id)}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Type */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Tipo de Pedido
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="takeaway"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Para levar
                    </Label>
                    <Switch
                      id="takeaway"
                      checked={isTakeaway}
                      onCheckedChange={setIsTakeaway}
                    />
                  </div>

                  {!isTakeaway && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            🏠 Área do Restaurante
                          </Label>
                          <Select value={selectedAreaId} onValueChange={setSelectedAreaId}>
                            <SelectTrigger className="w-full h-11 bg-white border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200">
                              <SelectValue placeholder="Selecionar área" />
                            </SelectTrigger>
                            <SelectContent className="w-full">
                              {areas.map((area) => (
                                <SelectItem key={area.id} value={area.id} className="flex items-center gap-2">
                                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                  {area.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            🪑 Número da Mesa
                          </Label>
                          <Select value={selectedTableId} onValueChange={setSelectedTableId}>
                            <SelectTrigger className="w-full h-11 bg-white border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200">
                              <SelectValue placeholder="Selecionar mesa" />
                            </SelectTrigger>
                            <SelectContent className="w-full">
                              {tables
                                .filter(table => !selectedAreaId || table.areaId === selectedAreaId)
                                .map((table) => {
                                  return (
                                    <SelectItem key={table.id} value={table.id} className="py-2">
                                      <span className="font-medium text-gray-900">{table.name}</span>
                                    </SelectItem>
                                  );
                                })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {/* Visual Preview */}
                      {selectedAreaId && selectedTableId && (
                        <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <MapPin className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-blue-700">
                                Pedido será servido em:
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                  {areas.find(a => a.id === selectedAreaId)?.name}
                                </span>
                                <span className="text-blue-500">•</span>
                                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                                  {tables.find(t => t.id === selectedTableId)?.name}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Pagamento
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 rounded-xl p-4 ${
                        selectedPaymentMethod === method.id
                          ? "ring-2 ring-orange-500 bg-orange-50 border-orange-200 shadow-lg scale-105"
                          : "hover:scale-105 bg-gray-50 border-gray-200 hover:shadow-lg"
                      }`}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                    >
                      <div className="text-center space-y-2">
                        <div className="text-3xl mb-2">{method.icon}</div>
                        <p className="text-sm font-semibold">
                          {method.name}
                        </p>
                        {selectedPaymentMethod === method.id && (
                          <div className="w-3 h-3 bg-orange-500 rounded-full mx-auto animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Payment Method Info */}
                {selectedPaymentMethod && (
                  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-orange-700">
                      <span className="text-lg">
                        {paymentMethods.find(m => m.id === selectedPaymentMethod)?.icon || '💳'}
                      </span>
                      <span className="font-medium">
                        Método selecionado: <strong>
                          {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name || 'N/A'}
                        </strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Notes */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Observações do Pedido
                </h3>
                <textarea
                  placeholder="Adicionar observações especiais, alergias, preferências..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  rows={3}
                />
              </div>

              {/* Order Summary */}
              <div className="space-y-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{totalPrice.toFixed(2)} MT</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Taxa</span>
                    <span className="font-medium">0,00 MT</span>
                  </div>
                  <div className="border-t border-orange-200 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-800">Total</span>
                      <span className="text-xl font-bold text-orange-600">
                        {totalPrice.toFixed(2)} MT
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="w-full border-orange-200 text-orange-600 hover:bg-orange-50 py-3 font-semibold transition-all duration-200"
                    disabled={orderMode === 'existing' ? !selectedExistingOrder : false}
                    onClick={orderMode === 'existing' ? handleAddToExistingOrder : handleSendToKitchen}
                  >
                    {orderMode === 'existing' ? 'Adicionar ao Pedido' : 'Enviar para Preparo'}
                  </Button>
                  
                  <Button
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                    disabled={orderMode === 'existing' ? !selectedExistingOrder : !selectedPaymentMethod}
                    onClick={orderMode === 'existing' ? handleAddToExistingOrder : handlePayNow}
                  >
                    {orderMode === 'existing' ? 'Adicionar ao Pedido' : 'Pagar Agora'}
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Payment Confirmation Dialog */}
      <AlertDialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Pagamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja finalizar a operação e pagar pelos itens selecionados?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Customer Name - Optional */}
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-sm font-medium">
                Nome do Cliente (opcional)
              </Label>
              <input
                id="customerName"
                type="text"
                placeholder="Digite o nome do cliente..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Cash Payment - Amount Received */}
            {selectedPaymentMethod && (
              <div className="space-y-2">
                <Label htmlFor="amountReceived" className="text-sm font-medium">
                  Valor Recebido (MT)
                </Label>
                <input
                  id="amountReceived"
                  type="number"
                  step="0.01"
                  min={totalPrice}
                                      placeholder={`Mínimo: ${totalPrice.toFixed(2)} MT`}
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                
                {/* Change Calculation */}
                {amountReceived && parseFloat(amountReceived) >= totalPrice && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-700">
                      💚 <strong>Troco:</strong> {(parseFloat(amountReceived) - totalPrice).toFixed(2)} MT
                    </p>
                  </div>
                )}
                
                {/* Insufficient Amount Warning */}
                {amountReceived && parseFloat(amountReceived) < totalPrice && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700">
                      ❌ <strong>Faltam:</strong> {(totalPrice - parseFloat(amountReceived)).toFixed(2)} MT
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Receipt Generation - Optional */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  id="generateReceipt"
                  type="checkbox"
                  checked={generateReceipt}
                  onChange={(e) => setGenerateReceipt(e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <Label htmlFor="generateReceipt" className="text-sm font-medium">
                  🧾 Gerar recibo para o cliente
                </Label>
              </div>
              <p className="text-xs text-gray-500 ml-6">
                Opcional - O recibo pode ser impresso ou baixado
              </p>
            </div>
            
            {/* Payment Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total a pagar:</span>
                <span className="font-semibold text-gray-900">{totalPrice.toFixed(2)} MT</span>
              </div>
              {selectedPaymentMethod && amountReceived && (
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-gray-600">Valor recebido:</span>
                  <span className="font-semibold text-gray-900">{amountReceived} MT</span>
                </div>
              )}
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPayment}
              disabled={!!selectedPaymentMethod && (!amountReceived || parseFloat(amountReceived) < totalPrice)}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!!selectedPaymentMethod && !!amountReceived && parseFloat(amountReceived) < totalPrice 
                                    ? `Faltam ${(totalPrice - parseFloat(amountReceived)).toFixed(2)} MT`
                : 'Confirmar Pagamento'
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Kitchen Confirmation Dialog */}
      <AlertDialog open={showKitchenDialog} onOpenChange={setShowKitchenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enviar para Preparo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja enviar este pedido para preparo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Order Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total de itens:</span>
                <span className="font-semibold text-gray-900">{totalItems}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-gray-600">Valor total:</span>
                                  <span className="font-medium text-gray-900">R${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmKitchen}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            >
              Enviar para Preparo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Receipt Component */}
      <Receipt
        orderNumber={`#${Date.now().toString().slice(-6)}`}
        items={cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))}
        total={totalPrice}
        table={selectedTable}
        area={selectedArea}
        isDelivery={isTakeaway}
        date={new Date()}
        paymentMethod={selectedPayment}
        customerName={customerName}
        amountReceived={selectedPayment === 'cash' ? parseFloat(amountReceived) : undefined}
        isOpen={showReceiptDialog}
        onClose={handleCloseReceipt}
      />

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
          image: editingMenuItem.image,
          categoryId: editingMenuItem.categoryId,
          hasStock: editingMenuItem.hasStock,
          stockQuantity: editingMenuItem.stockQuantity,
          minStockAlert: editingMenuItem.minStockAlert,
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
              {itemToDelete && itemToDelete._count?.menuItems > 0 && (
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
