'use client';

import { ReactNode } from 'react';
import { useLicense } from '@/hooks/use-license';
import { LicenseActivation } from './license-activation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Key, Clock, AlertTriangle } from 'lucide-react';

interface LicenseGuardProps {
  children: ReactNode;
  requiredFeatures?: string[];
  showActivationModal?: boolean;
  onLicenseValidated?: (licenseKey: string) => void;
}

export function LicenseGuard({ 
  children, 
  requiredFeatures = [], 
  showActivationModal = true,
  onLicenseValidated 
}: LicenseGuardProps) {
  const { 
    isLicenseValid, 
    isLoading, 
    licenseData, 
    validateLicense, 
    daysRemaining, 
    isFeatureEnabled 
  } = useLicense();

  // Verificar se todas as features necessárias estão habilitadas
  const hasRequiredFeatures = requiredFeatures.every(feature => isFeatureEnabled(feature));

  // Se ainda está carregando, mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Verificando licença...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se a licença não é válida, mostrar tela de ativação
  if (!isLicenseValid) {
    if (showActivationModal) {
      return (
        <LicenseActivation 
          onLicenseValidated={onLicenseValidated || validateLicense}
        />
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Key className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Licença Necessária</CardTitle>
            <CardDescription>
              Este sistema requer uma licença válida para funcionar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Entre em contato com o suporte para obter uma licença válida.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se não tem as features necessárias
  if (!hasRequiredFeatures) {
    const missingFeatures = requiredFeatures.filter(feature => !isFeatureEnabled(feature));
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <CardTitle className="text-yellow-600">Funcionalidade Não Disponível</CardTitle>
            <CardDescription>
              Sua licença não inclui as funcionalidades necessárias
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Funcionalidades necessárias: {missingFeatures.join(', ')}
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => window.history.back()} 
              variant="outline"
              className="w-full"
            >
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se a licença está próxima de expirar, mostrar aviso
  if (daysRemaining <= 7 && daysRemaining > 0) {
    return (
      <>
        <div className="fixed top-4 right-4 z-50">
          <Alert className="w-80 border-yellow-200 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Atenção:</strong> Sua licença expira em {daysRemaining} dia{daysRemaining > 1 ? 's' : ''}.
              <br />
              Entre em contato com o suporte para renovar.
            </AlertDescription>
          </Alert>
        </div>
        {children}
      </>
    );
  }

  // Se a licença expirou mas ainda está válida localmente (offline)
  if (daysRemaining <= 0) {
    return (
      <>
        <div className="fixed top-4 right-4 z-50">
          <Alert className="w-80 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Licença Expirada:</strong> Sua licença expirou.
              <br />
              O sistema será bloqueado quando houver conexão com a internet.
            </AlertDescription>
          </Alert>
        </div>
        {children}
      </>
    );
  }

  // Licença válida, mostrar conteúdo
  return <>{children}</>;
}

// HOC para proteger componentes
export function withLicenseGuard<P extends object>(
  Component: React.ComponentType<P>,
  requiredFeatures: string[] = []
) {
  return function ProtectedComponent(props: P) {
    return (
      <LicenseGuard requiredFeatures={requiredFeatures}>
        <Component {...props} />
      </LicenseGuard>
    );
  };
}
