"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Obter dados do usuário do cookie
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const token = getCookie('auth-token');
    if (token) {
      try {
        let decodedToken = null;
        try {
          decodedToken = atob(token);
        } catch (error) {
          decodedToken = decodeURIComponent(escape(atob(token)));
        }
        
        if (decodedToken) {
          const userData = JSON.parse(decodedToken);
          console.log('Change Password - User data loaded:', userData);
          setUserData(userData);
        }
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
        // Tentar buscar dados do localStorage se disponível
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          try {
            setUserData(JSON.parse(storedUserData));
          } catch (e) {
            console.error('Erro ao carregar dados do localStorage:', e);
          }
        }
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem!");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("A nova senha deve ter pelo menos 8 caracteres!");
      return;
    }

    if (newPassword === currentPassword) {
      toast.error("A nova senha deve ser diferente da senha atual!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/users/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Incluir cookies automaticamente
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Senha alterada com sucesso!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "Erro ao alterar senha");
      }
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      toast.error("Erro ao alterar senha");
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, color: "bg-gray-200", text: "" };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { strength: score, color: "bg-red-500", text: "Fraca" };
    if (score <= 3) return { strength: score, color: "bg-yellow-500", text: "Média" };
    if (score <= 4) return { strength: score, color: "bg-blue-500", text: "Boa" };
    return { strength: score, color: "bg-green-500", text: "Forte" };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Alterar Senha</h1>
          </div>
          <p className="text-gray-600">
            Mantenha sua conta segura alterando sua senha regularmente
          </p>
        </div>

        {/* Card Principal */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Segurança da Conta
            </CardTitle>
            <p className="text-sm text-gray-600">
              Digite sua senha atual e escolha uma nova senha segura
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Senha Atual */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
                  Senha Atual
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Digite sua senha atual"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Nova Senha */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                  Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Digite sua nova senha"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                
                {/* Indicador de Força da Senha */}
                {newPassword && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {passwordStrength.text}
                      </span>
                    </div>
                    
                    {/* Critérios de Senha */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className={`flex items-center gap-1 ${newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                        {newPassword.length >= 8 ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        Mínimo 8 caracteres
                      </div>
                      <div className={`flex items-center gap-1 ${/[a-z]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                        {/[a-z]/.test(newPassword) ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        Letra minúscula
                      </div>
                      <div className={`flex items-center gap-1 ${/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                        {/[A-Z]/.test(newPassword) ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        Letra maiúscula
                      </div>
                      <div className={`flex items-center gap-1 ${/[0-9]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                        {/[0-9]/.test(newPassword) ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        Número
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmar Nova Senha */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirmar Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                
                {/* Validação de Confirmação */}
                {confirmPassword && (
                  <div className={`flex items-center gap-2 text-sm ${
                    newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {newPassword === confirmPassword ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    {newPassword === confirmPassword ? 'Senhas coincidem' : 'Senhas não coincidem'}
                  </div>
                )}
              </div>

              {/* Dicas de Segurança */}
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Dicas para uma senha segura:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Use pelo menos 8 caracteres</li>
                    <li>• Combine letras maiúsculas, minúsculas e números</li>
                    <li>• Evite informações pessoais óbvias</li>
                    <li>• Não use a mesma senha em outros sites</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                >
                  {isLoading ? "Alterando..." : "Alterar Senha"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="px-8"
                >
                  Limpar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Informações do Usuário */}
        {userData && (
          <Card className="border-0 shadow-lg mt-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {userData.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{userData.name || 'Usuário'}</h3>
                  <p className="text-sm text-gray-600">{userData.phone || 'Sem telefone'}</p>
                  <p className="text-xs text-gray-500">Última alteração: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
                 )}
       </div>
   );
 }
