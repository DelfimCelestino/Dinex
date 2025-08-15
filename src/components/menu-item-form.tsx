"use client";

import { useState, useEffect } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface MenuItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    price: number;
    image?: string | null;
    categoryId: string;
    hasStock?: boolean;
    stockQuantity?: number | null;
    minStockAlert?: number | null;
  }) => void;
  initialData?: {
    name: string;
    description?: string;
    price: number;
    image?: string | null;
    categoryId: string;
    hasStock?: boolean;
    stockQuantity?: number | null;
    minStockAlert?: number | null;
  };
  isEditing?: boolean;
}

export function MenuItemForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}: MenuItemFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [image, setImage] = useState<string | null>(initialData?.image || null);
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [hasStock, setHasStock] = useState(initialData?.hasStock || false);
  const [stockQuantity, setStockQuantity] = useState(initialData?.stockQuantity?.toString() || "");
  const [minStockAlert, setMinStockAlert] = useState(initialData?.minStockAlert?.toString() || "");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [wasSaved, setWasSaved] = useState(false);

  // Função para renderizar o ícone Lucide
  const renderIcon = (iconName: string) => {
    if (!iconName) return <span className="text-lg">🎯</span>;
    
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className="w-4 h-4" />;
    }
    return <span className="text-lg">{iconName}</span>; // Fallback para emoji ou texto
  };

  // Carregar categorias
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        toast.error("Erro ao carregar categorias");
      }
    };

    fetchCategories();
  }, []);

  // Resetar formulário quando abrir/fechar
  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || "");
      setDescription(initialData?.description || "");
      setPrice(initialData?.price?.toString() || "");
      setImage(initialData?.image || null);
      setCategoryId(initialData?.categoryId || "");
      setHasStock(initialData?.hasStock || false);
      setStockQuantity(initialData?.stockQuantity?.toString() || "");
      setMinStockAlert(initialData?.minStockAlert?.toString() || "");
      setWasSaved(false);
    }
  }, [isOpen, initialData]);

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipo de arquivo não suportado. Use JPEG, PNG ou WebP");
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Tamanho máximo: 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // Se já havia uma imagem nova enviada nesta sessão, apaga-a antes de substituir
        if (isNewUploadedImage()) {
          try {
            const prevFile = image!.split('/').pop();
            await fetch(`/api/upload?file=${encodeURIComponent(prevFile || '')}`, { method: 'DELETE' });
          } catch (err) {
            console.warn('Falha ao deletar imagem anterior temporária:', err);
          }
        }
        setImage(data.url);
        toast.success("Imagem enviada com sucesso!");
      } else {
        toast.error(data.error || "Erro ao enviar imagem");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Erro ao enviar imagem");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nome do item é obrigatório");
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      toast.error("Preço deve ser um valor positivo");
      return;
    }

    if (!categoryId) {
      toast.error("Selecione uma categoria");
      return;
    }

    // Validar campos de estoque
    if (hasStock) {
      if (!stockQuantity || parseInt(stockQuantity) < 0) {
        toast.error("Quantidade em estoque deve ser um número positivo");
        return;
      }
      
      if (minStockAlert && parseInt(minStockAlert) < 0) {
        toast.error("Alerta de estoque mínimo deve ser um número positivo");
        return;
      }
      
      if (minStockAlert && parseInt(minStockAlert) > parseInt(stockQuantity)) {
        toast.error("Alerta de estoque mínimo não pode ser maior que a quantidade em estoque");
        return;
      }
    }

    setIsLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        price: parseFloat(price),
        image: image || null, // Enviar null quando não há imagem
        categoryId,
        hasStock,
        stockQuantity: hasStock ? (stockQuantity ? parseInt(stockQuantity) : null) : null,
        minStockAlert: hasStock && minStockAlert ? parseInt(minStockAlert) : null,
      });
      setWasSaved(true);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Remover imagem enviada se o usuário cancelar o formulário
  const isNewUploadedImage = () => image && image !== (initialData?.image || null);

  const handleCancel = async () => {
    if (isNewUploadedImage()) {
      try {
        const fileName = image!.split('/').pop();
        await fetch(`/api/upload?file=${encodeURIComponent(fileName || '')}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('Falha ao deletar imagem temporária:', err);
      }
    }
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={async (open) => {
        if (!open) {
          if (!wasSaved && isNewUploadedImage()) {
            try {
              const fileName = image!.split('/').pop();
              await fetch(`/api/upload?file=${encodeURIComponent(fileName || '')}`, { method: 'DELETE' });
            } catch (err) {
              console.warn('Falha ao deletar imagem temporária no fechar do diálogo:', err);
            }
          }
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b border-gray-100">
          <DialogTitle>
            {isEditing ? "Editar Item" : "Novo Item do Menu"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome do Item */}
          <div className="space-y-2">
            <Label htmlFor="itemName">Nome do Item</Label>
            <Input
              id="itemName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Hambúrguer Clássico, Pizza Margherita..."
              maxLength={100}
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="itemDescription">Descrição (opcional)</Label>
            <Textarea
              id="itemDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva os ingredientes, preparo, etc..."
              maxLength={500}
              rows={3}
            />
          </div>

          {/* Preço */}
          <div className="space-y-2">
            <Label htmlFor="itemPrice">Preço (R$)</Label>
            <Input
              id="itemPrice"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="itemCategory">Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      {renderIcon(category.icon)}
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Upload de Imagem */}
          <div className="space-y-2">
            <Label>Imagem (opcional)</Label>
            
            {image ? (
              <div className="space-y-2">
                <div className="relative">
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={async () => {
                      // Apenas deletar arquivo se for uma nova imagem enviada nesta sessão
                      if (isNewUploadedImage()) {
                        try {
                          const fileName = image!.split('/').pop();
                          await fetch(`/api/upload?file=${encodeURIComponent(fileName || '')}`, { method: 'DELETE' });
                        } catch (err) {
                          console.warn('Falha ao deletar imagem temporária (X):', err);
                        }
                      }
                      setImage(null);
                      toast.success("Imagem removida");
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Clique no X para remover a imagem
                </p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-300 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="hidden"
                  id="imageUpload"
                  disabled={isUploading}
                />
                <label
                  htmlFor="imageUpload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  ) : (
                    <Upload className="w-8 h-8 text-gray-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {isUploading ? "Enviando..." : "Clique para enviar imagem"}
                    </p>
                    <p className="text-xs text-gray-500">
                      JPEG, PNG ou WebP (máx. 5MB)
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Controle de Estoque */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasStock"
                checked={hasStock}
                onChange={(e) => setHasStock(e.target.checked)}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <Label htmlFor="hasStock" className="text-sm font-medium">
                🏪 Controle de Estoque
              </Label>
            </div>
            
            {hasStock && (
              <div className="space-y-3 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="stockQuantity" className="text-sm font-medium">
                    Quantidade em Estoque
                  </Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="Ex: 50"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Deixe vazio para estoque ilimitado
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minStockAlert" className="text-sm font-medium">
                    Alerta de Estoque Mínimo
                  </Label>
                  <Input
                    id="minStockAlert"
                    type="number"
                    min="0"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(e.target.value)}
                    placeholder="Ex: 10"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Quantidade mínima antes de alertar baixo estoque
                  </p>
                </div>
                
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <span className="text-lg">💡</span>
                    <div>
                      <p className="font-medium">Como funciona:</p>
                      <p className="text-blue-600 text-xs">
                        • Verde: Estoque normal<br/>
                        • Amarelo: Baixo estoque (≤ alerta mínimo)<br/>
                        • Vermelho: Sem estoque (≤ 0)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-4 sticky bottom-0 bg-white border-t border-gray-100 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              disabled={isLoading || !name.trim() || !price || !categoryId}
            >
              {isLoading ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
