"use client";

import type React from "react";

import { useState } from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authCode || !password) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ authCode, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Bem-vindo, ${data.user.name}!`);
        
        // Redirecionar baseado no role do usuário
        if (data.user.role === 'OPERATOR') {
          router.push("/menu");
        } else {
          router.push("/dashboard");
        }
      } else {
        toast.error(data.error || "Erro no login");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      toast.error("Erro de conexão");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <Card className="w-full max-w-md bg-white shadow-2xl border-0">
          <CardContent className="p-8">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white rounded-full relative">
                  <div className="absolute inset-0 border-2 border-white rotate-45"></div>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Sistema DineX
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed">
                Faça login para acessar o sistema de gestão de restaurante. 
                Gerencie pedidos, cardápio e operações do seu negócio.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Código de Autenticação */}
              <div className="space-y-2">
                <Label
                  htmlFor="authCode"
                  className="text-sm font-medium text-gray-700"
                >
                  Código de Autenticação
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="authCode"
                    type="text"
                    placeholder="000000"
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                    className="pl-10 h-12 text-left text-lg font-mono tracking-widest border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                >
                  Esqueceu a senha?
                </button>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-base transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-sm text-gray-500">
                © 2025 DineX. Sistema de Gestão para Restaurantes
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right side - Background Image */}
      <div className="flex-1 relative hidden lg:block">
        <Image 
          src="/beef-burger-cheese-fries.png"
          alt="Delicious food background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/10"></div>
      </div>
    </div>
  );
}
