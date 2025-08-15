"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, Phone, Hash, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface CompanySettings {
  id: string;
  name: string;
  location: string;
  phone: string;
  localNumber: string;
  nuit: string;
  isConfigured: boolean;
}

export function CompanySetupModal() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    phone: "",
    localNumber: "",
    nuit: "",
  });

  useEffect(() => {
    // Só verificar configurações se estiver na página de login
    if (pathname === "/") {
      checkCompanySettings();
    }
  }, [pathname]);

  const checkCompanySettings = async () => {
    try {
      const response = await fetch("/api/company-settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);

        console.log(data);
        
        // Se não estiver configurado e estiver na página de login, abrir modal
        if (!data.isConfigured && pathname === "/") {
          setIsOpen(true);
          setFormData({
            name: data.name || "",
            location: data.location || "",
            phone: data.phone || "",
            localNumber: data.localNumber || "",
            nuit: data.nuit || "",
          });
        } else {
          // Se já estiver configurado ou não estiver na página de login, fechar modal
          setIsOpen(false);
        }
      } else {
        // Se não conseguir carregar e estiver na página de login, abrir modal
        if (pathname === "/") {
          setIsOpen(true);
        }
      }
    } catch (error) {
      console.error("Erro ao verificar configurações:", error);
      // Em caso de erro e estiver na página de login, abrir modal
      if (pathname === "/") {
        setIsOpen(true);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.location || !formData.phone || !formData.localNumber || !formData.nuit) {
      toast.error("Todos os campos são obrigatórios");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/company-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        setSettings(updatedSettings);
        toast.success("Configurações da empresa salvas com sucesso!");
        
        // Configurações salvas com sucesso, fechar modal
        setIsOpen(false);
        
        // Aguardar um pouco antes de redirecionar para o dashboard
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao salvar configurações");
      }
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-2xl" 
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-orange-600">
            Configuração Inicial da Empresa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Aviso */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-orange-800 text-lg">
                  Configuração Obrigatória
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
                        <p className="text-orange-700">
            Para continuar usando o sistema, é necessário configurar as informações básicas da sua empresa. 
            Estas informações aparecerão nos recibos e relatórios.
            <br /><br />
            <strong>⚠️ Este modal não pode ser fechado até que as configurações sejam salvas.</strong>
          </p>
            </CardContent>
          </Card>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome da Empresa */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-orange-600" />
                  Nome da Empresa *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Ex: Restaurante Dinex"
                  className="border-orange-200 focus:border-orange-500"
                />
              </div>

              {/* Localização */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-600" />
                  Localização/Endereço *
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Ex: Maputo, Moçambique"
                  className="border-orange-200 focus:border-orange-500"
                />
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-orange-600" />
                  Telefone *
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Ex: +258 84 123 4567"
                  className="border-orange-200 focus:border-orange-500"
                />
              </div>

              {/* Número do Local */}
              <div className="space-y-2">
                <Label htmlFor="localNumber" className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-orange-600" />
                  Número do Local *
                </Label>
                <Input
                  id="localNumber"
                  value={formData.localNumber}
                  onChange={(e) => handleInputChange("localNumber", e.target.value)}
                  placeholder="Ex: 123"
                  className="border-orange-200 focus:border-orange-500"
                />
              </div>

              {/* NUIT */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="nuit" className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-orange-600" />
                  NUIT (Número Único de Identificação Tributária) *
                </Label>
                <Input
                  id="nuit"
                  value={formData.nuit}
                  onChange={(e) => handleInputChange("nuit", e.target.value)}
                  placeholder="Ex: 123456789"
                  className="border-orange-200 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Botão de Salvar */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg"
              >
                {isLoading ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
