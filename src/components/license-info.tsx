'use client';

import { useState } from 'react';
import { useLicense } from '@/hooks/use-license';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Key, Clock, AlertTriangle, CheckCircle, XCircle, RefreshCw, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export function LicenseInfo() {
  const { 
    isLicenseValid, 
    licenseData, 
    daysRemaining, 
    checkLicenseStatus, 
    clearLicense 
  } = useLicense();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await checkLicenseStatus(true); // Com toast
      toast.success('Status da licença atualizado');
    } catch (error) {
      toast.error('Erro ao atualizar status da licença');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearLicense = () => {
    if (confirm('Tem certeza que deseja remover a licença atual?')) {
      clearLicense();
      toast.info('Licença removida');
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copiado para a área de transferência!`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error('Erro ao copiar para a área de transferência');
    }
  };

  if (!isLicenseValid || !licenseData) {
    return null;
  }

  const getStatusColor = () => {
    if (daysRemaining <= 0) return 'destructive';
    if (daysRemaining <= 7) return 'secondary';
    return 'default';
  };

  const getStatusIcon = () => {
    if (daysRemaining <= 0) return <XCircle className="w-4 h-4" />;
    if (daysRemaining <= 7) return <AlertTriangle className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (daysRemaining <= 0) return 'Expirada';
    if (daysRemaining <= 7) return 'Expirando';
    return 'Válida';
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Licença do Sistema</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusColor()}>
                {getStatusIcon()}
                {getStatusText()}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          <CardDescription>
            Informações sobre a licença atual do sistema
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Status da Licença */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <Badge variant={getStatusColor()}>
              {getStatusIcon()}
              {getStatusText()}
            </Badge>
          </div>

          {/* Cliente */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Cliente:</span>
            <span className="text-sm text-muted-foreground">{licenseData.clientName}</span>
          </div>

          {/* Dias Restantes */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Dias Restantes:</span>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className={`text-sm font-medium ${
                daysRemaining <= 7 ? 'text-orange-600' : 'text-green-600'
              }`}>
                {daysRemaining} dia{daysRemaining !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Data de Expiração */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Expira em:</span>
            <span className="text-sm text-muted-foreground">
              {new Date(licenseData.expiresAt).toLocaleDateString('pt-BR')}
            </span>
          </div>

          {/* Versão */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Versão:</span>
            <span className="text-sm text-muted-foreground">{licenseData.version}</span>
          </div>

          {/* Avisos */}
          {daysRemaining <= 7 && daysRemaining > 0 && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Sua licença expira em {daysRemaining} dia{daysRemaining > 1 ? 's' : ''}. 
                Entre em contato com o suporte para renovar.
              </AlertDescription>
            </Alert>
          )}

          {daysRemaining <= 0 && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Sua licença expirou. O sistema será bloqueado quando houver conexão com a internet.
              </AlertDescription>
            </Alert>
          )}

          {/* Botões */}
          <div className="flex gap-2 pt-2">
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  Ver Detalhes
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Detalhes da Licença</DialogTitle>
                  <DialogDescription>
                    Informações completas sobre a licença atual
                  </DialogDescription>
                </DialogHeader>
                                 <div className="space-y-3">
                   <div>
                     <div className="flex items-center justify-between">
                       <span className="text-sm font-medium">Chave da Licença:</span>
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => copyToClipboard(licenseData.licenseKey, 'Chave da Licença')}
                         className="h-6 w-6 p-0"
                       >
                         {copiedField === 'Chave da Licença' ? (
                           <Check className="h-3 w-3 text-green-600" />
                         ) : (
                           <Copy className="h-3 w-3" />
                         )}
                       </Button>
                     </div>
                                           <p className="text-sm text-muted-foreground font-mono break-all">
                        {licenseData.licenseKey.length > 32 
                          ? `${licenseData.licenseKey.slice(0, 32)}...` 
                          : licenseData.licenseKey}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">Email do Cliente:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(licenseData.clientEmail || 'Não informado', 'Email do Cliente')}
                          className="h-6 w-6 p-0 flex-shrink-0"
                        >
                          {copiedField === 'Email do Cliente' ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {licenseData.clientEmail || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">Máquina:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(licenseData.machineName, 'Nome da Máquina')}
                          className="h-6 w-6 p-0 flex-shrink-0"
                        >
                          {copiedField === 'Nome da Máquina' ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {licenseData.machineName}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">Hardware ID:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(licenseData.hardwareId, 'Hardware ID')}
                          className="h-6 w-6 p-0 flex-shrink-0"
                        >
                          {copiedField === 'Hardware ID' ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground font-mono break-all">
                        {licenseData.hardwareId.length > 40 
                          ? `${licenseData.hardwareId.slice(0, 40)}...` 
                          : licenseData.hardwareId}
                      </p>
                    </div>
                  <div>
                    <span className="text-sm font-medium">Emitida em:</span>
                    <p className="text-sm text-muted-foreground">
                      {new Date(licenseData.issuedAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Features Habilitadas:</span>
                    <div className="mt-1">
                      {Object.entries(JSON.parse(licenseData.features)).map(([feature, enabled]) => (
                        <Badge 
                          key={feature} 
                          variant={enabled ? 'default' : 'secondary'}
                          className="mr-1 mb-1"
                        >
                          {feature}: {enabled ? 'Sim' : 'Não'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleClearLicense}
              className="flex-1"
            >
              Remover Licença
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
