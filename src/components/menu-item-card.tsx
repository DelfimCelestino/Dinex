"use client"

import { Heart, Plus, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  image: string | null
  category: string
  categoryId?: string // ID da categoria no banco
  isFavorite?: boolean
  dbId?: string
  // Campos de estoque
  hasStock?: boolean
  stockQuantity?: number | null
  minStockAlert?: number | null
}

interface MenuItemCardProps {
  item: MenuItem
  quantity: number
  isFavorite: boolean
  isAdded: boolean
  onToggleFavorite: (itemId: number) => void
  onAddToCart: (item: MenuItem) => void
  onEditItem?: (item: any) => void
  onDeleteItem?: (item: any) => void
  showAdminControls?: boolean
}

export function MenuItemCard({
  item,
  quantity,
  isFavorite,
  isAdded,
  onToggleFavorite,
  onAddToCart,
  onEditItem,
  onDeleteItem,
  showAdminControls = false,
}: MenuItemCardProps) {
  // Função para obter a URL da imagem
  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return "/placeholder.jpg";
    
    // Se já é uma URL completa, usar como está
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Se é uma rota API, usar como está
    if (imagePath.startsWith('/api/images/')) {
      return imagePath;
    }
    
    // Se é um caminho relativo, converter para rota API
    if (imagePath.startsWith('/images/')) {
      return imagePath.replace('/images/', '/api/images/');
    }
    
    // Se é apenas o nome do arquivo, construir a rota completa
    return `/api/images/uploads/${imagePath}`;
  };

  // Função para verificar se há estoque disponível
  const hasAvailableStock = () => {
    if (!item.hasStock || item.stockQuantity === null || item.stockQuantity === undefined) return true;
    return item.stockQuantity > 0;
  };

  // Função para verificar se está com baixo estoque
  const isLowStock = () => {
    if (!item.hasStock || item.stockQuantity === null || item.stockQuantity === undefined || item.minStockAlert === null || item.minStockAlert === undefined) return false;
    return item.stockQuantity <= item.minStockAlert;
  };

  // Função para verificar se está sem estoque
  const isOutOfStock = () => {
    if (!item.hasStock || item.stockQuantity === null || item.stockQuantity === undefined) return false;
    return item.stockQuantity <= 0;
  };

  return (
    <div 
      className={`relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm border-gray-100 rounded-lg border cursor-pointer group ${
        isAdded ? 'ring-2 ring-orange-500 shadow-lg scale-105' : ''
      } ${
        isOutOfStock() ? 'opacity-60 cursor-not-allowed' : ''
      }`}
      onClick={() => {
        if (!isOutOfStock()) {
          onAddToCart(item);
        }
      }}
    >
      <div className="relative">
        <img
          src={getImageUrl(item.image)}
          alt={item.name}
          className={`w-full h-32 object-cover transition-all duration-300 ${
            isAdded ? 'brightness-125 scale-110' : 'group-hover:brightness-110'
          } ${
            isOutOfStock() ? 'grayscale' : ''
          }`}
          onError={(e) => {
            // Fallback para placeholder se a imagem falhar
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.jpg";
          }}
        />
        
        {/* Botões de ação - Aumentado z-index e melhorado posicionamento */}
        <div className="absolute top-2 right-2 flex gap-1 z-50">
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 bg-white/90 hover:bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(item.id);
            }}
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
              }`}
            />
          </Button>
          
          {/* Menu de 3 pontos para administração */}
          {showAdminControls && onEditItem && onDeleteItem && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 bg-white/90 hover:bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32 z-50">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditItem(item);
                  }}
                  className="cursor-pointer"
                >
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteItem(item);
                  }}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        {/* Quantity Badge */}
        {quantity > 0 && (
          <div className={`absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg transition-all duration-300 z-40 ${
            isAdded ? 'bg-green-500 scale-125 animate-bounce' : 'bg-orange-500 animate-pulse'
          }`}>
            {quantity}
          </div>
        )}

        {/* Stock Status Badge */}
        {item.hasStock && item.stockQuantity !== null && (
          <div className="absolute bottom-2 left-2 z-40">
            {isOutOfStock() ? (
              <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  SEM ESTOQUE
                </div>
              </div>
            ) : isLowStock() ? (
              <div className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  {item.stockQuantity} UN
                </div>
              </div>
            ) : (
              <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  {item.stockQuantity} UN
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Success Checkmark when added */}
        {isAdded && (
          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-30">
            <div className="bg-green-500 text-white rounded-full p-2 animate-pulse">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock() && (
          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center z-30">
            <div className="bg-red-500 text-white rounded-lg p-2 text-center">
              <div className="text-lg font-bold">SEM ESTOQUE</div>
              <div className="text-xs">Indisponível</div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className={`font-semibold text-gray-800 mb-1 truncate transition-colors ${
          isAdded ? 'text-green-600' : 'group-hover:text-orange-600'
        } ${
          isOutOfStock() ? 'text-gray-500' : ''
        }`}>
          {item.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {item.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-orange-600">
            {item.price.toFixed(2)} MT
          </span>
          
          {/* Add to Cart Indicator */}
          <div className={`flex items-center gap-2 transition-colors ${
            isAdded ? 'text-green-500' : 'text-orange-500 group-hover:text-orange-600'
          } ${
            isOutOfStock() ? 'text-gray-400' : ''
          }`}>
            {isOutOfStock() ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-sm font-medium">
                  Indisponível
                </span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {isAdded ? 'Adicionado!' : 'Adicionar'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
