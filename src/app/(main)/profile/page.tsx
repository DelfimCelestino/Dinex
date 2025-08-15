"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, Shield, Calendar, Clock } from "lucide-react";

export default function ProfilePage() {
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
          console.log('Profile - User data loaded:', userData);
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

  const getRoleBadge = (role: string) => {
    const variants = {
      ROOT: "bg-red-100 text-red-800 border-red-200",
      ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
      SUBADMIN: "bg-orange-100 text-orange-800 border-orange-200",
      OPERATOR: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return variants[role as keyof typeof variants] || variants.OPERATOR;
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      ROOT: "Super Administrador",
      ADMIN: "Administrador",
      SUBADMIN: "Sub-Administrador",
      OPERATOR: "Operador",
    };
    return labels[role as keyof typeof labels] || role;
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-500">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          </div>
          <p className="text-gray-600">
            Visualize e gerencie suas informações pessoais
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card Principal - Informações Básicas */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-600" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Nome e Código */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {userData.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {userData.name || 'Usuário'}
                    </h2>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                        Código: {userData.authCode || 'N/A'}
                      </Badge>
                      <Badge className={getRoleBadge(userData.role)}>
                        {getRoleLabel(userData.role)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Detalhes de Contato */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Phone className="w-5 h-5 text-blue-600" />
                      Contato
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">Telefone</p>
                        <p className="font-medium text-gray-900">{userData.phone || 'Não informado'}</p>
                      </div>
                      {userData.email && (
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-gray-900">{userData.email}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      Acesso
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">Nível de Acesso</p>
                        <Badge className={getRoleBadge(userData.role)}>
                          {getRoleLabel(userData.role)}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <Badge className={userData.isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}>
                          {userData.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Histórico */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    Histórico
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Data de Criação</p>
                      <p className="font-medium text-gray-900">
                        {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Última Atualização</p>
                      <p className="font-medium text-gray-900">
                        {userData.updatedAt ? new Date(userData.updatedAt).toLocaleDateString('pt-BR') : 'N/A'}
                      </p>
                    </div>
                    {userData.lastLogin && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600">Último Login</p>
                        <p className="font-medium text-gray-900">
                          {new Date(userData.lastLogin).toLocaleDateString('pt-BR')} às {new Date(userData.lastLogin).toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Ações Rápidas */}
          <div className="space-y-6">
            {/* Card de Ações */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  onClick={() => window.location.href = '/change-password'}
                  className="w-full p-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Alterar Senha
                </button>
                
                <button
                  onClick={() => window.history.back()}
                  className="w-full p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Voltar
                </button>
              </CardContent>
            </Card>

            {/* Card de Estatísticas */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900">
                    {userData.role === 'ROOT' ? '∞' : '100%'}
                  </div>
                  <p className="text-sm text-purple-600 font-medium">
                    Permissões
                  </p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-900">
                    {userData.isActive ? '✅' : '❌'}
                  </div>
                  <p className="text-sm text-green-600 font-medium">
                    Status da Conta
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
                 </div>
       </div>
   );
 }
