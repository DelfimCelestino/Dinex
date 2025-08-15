"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, MapPin, Phone, Hash, Save } from "lucide-react";
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

export default function SettingsPage() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    phone: "",
    localNumber: "",
    nuit: "",
  });

  useEffect(() => {
    fetchCompanySettings();
  }, []);

  const fetchCompanySettings = async () => {
    try {
      const response = await fetch("/api/company-settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setFormData({
          name: data.name || "",
          location: data.location || "",
          phone: data.phone || "",
          localNumber: data.localNumber || "",
          nuit: data.nuit || "",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast.error("Erro ao carregar configurações da empresa");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.location || !formData.phone || !formData.localNumber || !formData.nuit) {
      toast.error("Todos os campos são obrigatórios");
      return;
    }

    setIsSaving(true);
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
        toast.success("Configurações da empresa atualizadas com sucesso!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao atualizar configurações");
      }
    } catch (error) {
      console.error("Erro ao atualizar configurações:", error);
      toast.error("Erro ao atualizar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="wrapper">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="wrapper">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">
            Gerencie as configurações da sua empresa
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-orange-600" />
            Informações da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="focus:border-orange-500"
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
                  className="focus:border-orange-500"
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
                  className="focus:border-orange-500"
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
                  className="focus:border-orange-500"
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
                  className="focus:border-orange-500"
                />
              </div>
            </div>

            {/* Botão de Salvar */}
            <div className="flex justify-end pt-4 border-t">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
