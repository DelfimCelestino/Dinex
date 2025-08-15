"use client";
import type React from "react"
import { useState, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  LayoutDashboard,
  ShoppingBag,
  Menu,
  CreditCard,
  Users,
  Settings,
  LogOut,
  Search,
  Bell,
  User,
  X,
  Building2,
  SatelliteIcon,
  Shield,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { toast } from "sonner"
import { useRouter } from "next/navigation"

const menuItems = [
  { icon: LayoutDashboard, label: "Painel de Controle", href: "/dashboard", roles: ["ROOT", "ADMIN", "SUBADMIN"] },
  { icon: ShoppingBag, label: "Pedidos", href: "/orders", roles: ["ROOT", "ADMIN", "SUBADMIN", "OPERATOR"] },
  { icon: Menu, label: "Cardápio", href: "/menu", roles: ["ROOT", "ADMIN", "SUBADMIN", "OPERATOR"] },
  { icon: CreditCard, label: "Pagamentos", href: "/payments", roles: ["ROOT", "ADMIN"] },
  { icon: Users, label: "Funcionários", href: "/employees", roles: ["ROOT", "ADMIN"] },
  { icon: Building2, label: "Áreas", href: "/areas", roles: ["ROOT", "ADMIN", "SUBADMIN", "OPERATOR"] },
  { icon: SatelliteIcon, label: "Relatórios", href: "/reports", roles: ["ROOT", "ADMIN", "SUBADMIN"] },
  { icon: Settings, label: "Configurações", href: "/settings", roles: ["ROOT", "ADMIN"] },
]

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  userRole?: string;
  compact?: boolean;
  onLogout?: () => void;
}

function Sidebar({ isOpen = false, onClose, userRole, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const router = useRouter();

  // Filtrar itens do menu baseado no role
  let filteredMenuItems = [];
  
  if (userRole) {
 
    
    filteredMenuItems = menuItems.filter(item => {
    
      
      if (!item.roles || item.roles.length === 0) {
        return true;
      }
      
      // Verificar cada role individualmente
      const hasPermission = item.roles.some(role => {
        const roleUpper = role.toUpperCase();
        const userRoleUpper = userRole.toUpperCase();
        const matches = roleUpper === userRoleUpper;
     
        return matches;
      });
      
      return hasPermission;
    });
    

    
    // Fallback: se não encontrou nenhum item, mostrar pelo menos Orders e Menu
    if (filteredMenuItems.length === 0) {
    
      filteredMenuItems = menuItems.filter(item => 
        item.href === '/orders' || item.href === '/menu' || item.href === '/areas'
      );
    }
  } else {
 
    filteredMenuItems = menuItems;
  }


  const SidebarContent = ({ compact = false }: { compact?: boolean }) => (
    <>
      {/* Logo */}
      <div className={`${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            {!compact && (
              <span className="font-semibold text-xl text-gray-900">Dinex</span>
            )}
          </div>
          {isMobile && onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="md:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${compact ? 'p-2' : 'p-4'}`}>
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => {
                    if (isMobile && onClose) {
                      onClose();
                    }
                  }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    compact ? "justify-center" : "",
                    isActive
                      ? "bg-orange-50 text-orange-600 border border-orange-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  title={compact ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5" />
                  {!compact && item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className={`${compact ? 'p-2' : 'p-4'} border-t border-gray-200`}>
        <div className="space-y-2">
          <button
            onClick={() => {
              if (isMobile && onClose) {
                onClose();
              }
              onLogout?.();
            }}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors w-full text-left",
              compact ? "justify-center" : ""
            )}
            title={compact ? "Sair" : undefined}
          >
            <LogOut className="w-5 h-5" />
            {!compact && "Sair"}
          </button>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent>
          <div className="w-80 mx-auto">
            <DrawerHeader>
              <DrawerTitle className="sr-only">Navigation Menu</DrawerTitle>
            </DrawerHeader>
            <div className="flex flex-col h-[80vh]">
              <SidebarContent />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Versão tablet: apenas ícones (lg: 1024px)
  const isTablet = !isMobile && typeof window !== 'undefined' && window.innerWidth < 1024;
  
  if (isTablet) {
    return (
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col">
        <SidebarContent compact={true} />
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <SidebarContent />
    </div>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userRole, setUserRole] = useState<string>("")
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isMobile = useIsMobile()
  const pathname = usePathname()
  
  // Obter role do usuário do cookie
  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const token = getCookie('auth-token');
    console.log('=== DEBUG DASHBOARD ===');
    console.log('Token encontrado:', token ? 'sim' : 'não');
    if (token) {
      try {
        // Tentar decodificar como base64 simples primeiro
        let decodedToken = null;
        try {
          decodedToken = atob(token);
        } catch (error) {
          console.log('Falhou decodificação simples, tentando com escape...');
          decodedToken = decodeURIComponent(escape(atob(token)));
        }
        
        console.log('Token decodificado:', decodedToken);
        if (decodedToken) {
          const userData = JSON.parse(decodedToken);
          console.log('User data completo:', userData);
          console.log('User role original:', userData.role);
          
          // Normalizar o role para garantir que funcione corretamente
          const normalizedRole = userData.role ? userData.role.toUpperCase() : '';
          console.log('Normalized role:', normalizedRole);
          setUserRole(normalizedRole);
          setUserData(userData);
        }
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
        console.error('Token problemático:', token);
      }
    } else {
      console.log('Nenhum token encontrado no cookie');
    }
    console.log('=====================');
    setIsLoading(false);
  }, []);
  
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Logout realizado com sucesso!");
        window.location.href = "/";
      } else {
        toast.error("Erro ao fazer logout");
      }
    } catch (error) {
      console.error("Erro no logout:", error);
      toast.error("Erro ao fazer logout");
    }
  };

  // Get current page title
  const getPageTitle = () => {
    // Filtrar itens do menu baseado no role
    let filteredMenuItems = [];
    
    if (userRole) {
      filteredMenuItems = menuItems.filter(item => {
        // Se o item não tem roles definidos, permitir acesso
        if (!item.roles || item.roles.length === 0) {
          return true;
        }
        
        // Se tem roles, verificar se o usuário tem permissão
        return item.roles.map(role => role.toUpperCase()).includes(userRole);
      });
      
      // Fallback: se não encontrou nenhum item, mostrar pelo menos Orders e Menu
      if (filteredMenuItems.length === 0) {
        filteredMenuItems = menuItems.filter(item => 
          item.href === '/orders' || item.href === '/menu' || item.href === '/areas'
        );
      }
    } else {
      // Se não tem role, mostrar todos
      filteredMenuItems = menuItems;
    }
    
    const currentItem = filteredMenuItems.find(item => 
      pathname === item.href || pathname.startsWith(`${item.href}/`)
    )
    if (currentItem) return currentItem.label
    
    return "Dashboard"
  }

  // Mostrar loading enquanto carrega os dados do usuário
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-200 rounded-full mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - hidden on mobile when closed */}
      {!isMobile && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={userRole} onLogout={handleLogout} />}
      
      {/* Mobile sidebar as drawer */}
      {isMobile && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={userRole} onLogout={handleLogout} />}
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 py-2 sm:py-2 lg:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="md:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">{getPageTitle()}</h1>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
          

 
              {/* Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center w-8 h-8 bg-orange-500 rounded-full hover:bg-orange-600 transition-colors">
                    <User className="w-4 h-4 text-white" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{userData?.name || 'Usuário'}</p>
                    <p className="text-xs text-gray-500">{userData?.phone || 'Sem telefone'}</p>
                  </div>
                  <DropdownMenuSeparator />
                 
                  <DropdownMenuItem onClick={() => window.location.href = '/change-password'}>
                    <Shield className="w-4 h-4 mr-2" />
                    Alterar Senha
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
      
    </div>
  )
}
