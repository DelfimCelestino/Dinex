"use client"

import { Plus, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import * as LucideIcons from "lucide-react"

export interface Category {
  id: string
  name: string
  icon: string
  count: number
  active: boolean
  isFavorite?: boolean
}

interface CategoryFilterProps {
  categories: Category[]
  onCategoryChange: (categoryId: string) => void
  onAddCategory?: () => void
  onEditCategory?: (category: any) => void
  onDeleteCategory?: (category: any) => void
  dbCategories?: any[]
  showAdminControls?: boolean
}

export function CategoryFilter({ 
  categories, 
  onCategoryChange, 
  onAddCategory, 
  onEditCategory, 
  onDeleteCategory,
  dbCategories = [],
  showAdminControls = false
}: CategoryFilterProps) {
  // Função para renderizar o ícone Lucide
  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className="w-4 h-4" />;
    }
    return <span className="text-lg">{iconName}</span>; // Fallback para emoji
  };

  const handleCategoryChange = (categoryId: string) => {
    // Chamar diretamente a função onCategoryChange com o ID da categoria
    onCategoryChange(categoryId);
  };

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {onAddCategory && (
        <Button
          variant="outline"
          onClick={onAddCategory}
          className="border-2 border-dashed border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 transition-all duration-200 bg-transparent px-3 py-2 sm:px-4"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Categoria
        </Button>
      )}
      
      {categories.map((category) => (
        <div
          key={category.id}
          className={`relative group flex items-center gap-1 px-3 py-2 sm:px-4 text-sm transition-all duration-150 rounded-lg border cursor-pointer ${
            category.active
              ? "bg-orange-600 text-white border-orange-400"
              : "border-orange-200 text-orange-700 hover:bg-orange-50"
          }`}
          onClick={() => {
            // Todas as categorias são clicáveis
            handleCategoryChange(category.id);
          }}
        >
          <span className="mr-2">{renderIcon(category.icon)}</span>
          <span>{category.name}</span>
          <Badge
            variant="secondary"
            className={`ml-2 ${category.active ? "bg-white/10 text-white" : "bg-orange-100 text-orange-700"}`}
          >
            {category.count}
          </Badge>
          
          {/* Menu de 3 pontos para administração (apenas para categorias do banco) */}
          {showAdminControls && category.id !== "all" && category.id !== "favorites" && onEditCategory && onDeleteCategory && (
            <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-6 h-6 p-0 bg-white/90 hover:bg-white shadow-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-3 h-3 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      const dbCategory = dbCategories.find(cat => 
                        cat.name.toLowerCase().replace(/\s+/g, "-") === category.id
                      );
                      if (dbCategory) {
                        onEditCategory(dbCategory);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      const dbCategory = dbCategories.find(cat => 
                        cat.name.toLowerCase().replace(/\s+/g, "-") === category.id
                      );
                      if (dbCategory) {
                        onDeleteCategory(dbCategory);
                      }
                    }}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
