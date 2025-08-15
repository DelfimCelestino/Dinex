"use client";

import { useState, useEffect } from "react";
import { X, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; icon: string }) => void;
  initialData?: { name: string; icon: string };
  isEditing?: boolean;
}

interface IconData {
  [key: string]: string[];
}

export function CategoryForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [selectedIcon, setSelectedIcon] = useState(initialData?.icon || "");
  const [icons, setIcons] = useState<IconData>({} as IconData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showIconSelector, setShowIconSelector] = useState(false);

  // Carregar ícones disponíveis
  useEffect(() => {
    const fetchIcons = async () => {
      try {
        const response = await fetch("/api/icons");
        const data = await response.json();
        if (data.success) {
          setIcons(data.icons);
        }
      } catch (error) {
        console.error("Erro ao carregar ícones:", error);
      }
    };

    fetchIcons();
  }, []);

  // Resetar formulário quando abrir/fechar
  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || "");
      setSelectedIcon(initialData?.icon || "");
      setSearchTerm("");
      setShowIconSelector(false);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Nome da categoria é obrigatório");
      return;
    }

    if (!selectedIcon) {
      toast.error("Selecione um ícone para a categoria");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({ name: name.trim(), icon: selectedIcon });
      onClose();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar ícones baseado na busca
  const filteredIcons = Object.entries(icons).reduce((acc, [category, iconList]) => {
    const filtered = iconList.filter((icon: string) =>
      icon.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as IconData);

  const categoryLabels: { [key: string]: string } = {
    food: "🍽️ Comida",
    general: "⭐ Geral",
    objects: "🏠 Objetos",
    symbols: "🔶 Símbolos",
    nature: "🌿 Natureza",
    animals: "🐾 Animais",
  };

  // Função para renderizar o ícone Lucide
  const renderIcon = (iconName: string) => {
    if (!iconName) return <span className="text-lg">🎯</span>;
    
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className="w-5 h-5" />;
    }
    return <span className="text-lg">{iconName}</span>; // Fallback para emoji ou texto
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome da Categoria */}
          <div className="space-y-2">
            <Label htmlFor="categoryName">Nome da Categoria</Label>
            <Input
              id="categoryName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Fast Food, Bebidas, Sobremesas..."
              maxLength={50}
            />
          </div>



          {/* Seleção de Ícone */}
          <div className="space-y-2">
            <Label>Ícone da Categoria</Label>
            
            {selectedIcon ? (
              <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                <div className="w-8 h-8 flex items-center justify-center bg-orange-100 rounded-lg">
                  {renderIcon(selectedIcon)}
                </div>
                <span className="flex-1 font-medium">{selectedIcon}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIcon("")}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full h-12"
                onClick={() => setShowIconSelector(true)}
              >
                Selecionar Ícone
              </Button>
            )}
          </div>

          {/* Seletor de Ícones */}
          {showIconSelector && (
            <div className="border rounded-lg p-4 space-y-4 max-h-64 overflow-y-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar ícones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-4">
                {Object.entries(filteredIcons).map(([category, iconList]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      {categoryLabels[category] || category}
                    </h4>
                    <div className="grid grid-cols-6 gap-2">
                      {iconList.map((icon: string) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => {
                            setSelectedIcon(icon);
                            setShowIconSelector(false);
                          }}
                          className="p-2 border rounded-lg hover:bg-gray-50 hover:border-orange-300 transition-colors"
                          title={icon}
                        >
                          <div className="w-6 h-6 flex items-center justify-center">
                            {renderIcon(icon)}
                          </div>
                          <div className="text-xs mt-1 truncate">{icon}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              disabled={isLoading || !name.trim() || !selectedIcon}
            >
              {isLoading ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
