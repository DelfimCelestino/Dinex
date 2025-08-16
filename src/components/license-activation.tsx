'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Key, CheckCircle, XCircle, AlertTriangle, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface LicenseActivationProps {
  onLicenseValidated?: (licenseKey: string) => void;
  onClose?: () => void;
}

export function LicenseActivation({ onLicenseValidated, onClose }: LicenseActivationProps) {
  const [licenseKey, setLicenseKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
    license?: any;
  } | null>(null);
  const [hardwareInfo, setHardwareInfo] = useState<{
    hardwareId: string;
    machineName: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    // Obter informações do hardware ao carregar o componente
    fetchHardwareInfo();
  }, []);

  const fetchHardwareInfo = async () => {
    try {
      const response = await fetch('/api/licenses?action=hardware');
      const data = await response.json();
      setHardwareInfo(data);
    } catch (error) {
      console.error('Erro ao obter informações do hardware:', error);
    }
  };

  const validateLicense = async () => {
    if (!licenseKey.trim()) {
      toast.error('Por favor, insira uma chave de licença');
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const response = await fetch(`/api/licenses?action=validate&key=${encodeURIComponent(licenseKey)}`);
      const result = await response.json();

      setValidationResult(result);

      if (result.valid) {
        toast.success('Licença válida! Sistema ativado com sucesso.');
        onLicenseValidated?.(licenseKey);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Erro ao validar licença:', error);
      toast.error('Erro ao conectar com o servidor');
      setValidationResult({
        valid: false,
        message: 'Erro de conexão'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const formatLicenseKey = (key: string) => {
    // Formatar a chave de licença para melhor visualização
    return key.replace(/(.{8})/g, '$1-').slice(0, -1).toUpperCase();
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Key className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Ativação de Licença</CardTitle>
          <CardDescription>
            Digite sua chave de licença para ativar o sistema
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Informações do Hardware */}
          {hardwareInfo && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                                 <div className="space-y-2">
                   <div className="flex items-center justify-between gap-2">
                     <span className="truncate">
                       <strong>Máquina:</strong> {hardwareInfo.machineName.length > 20 
                         ? `${hardwareInfo.machineName.slice(0, 20)}...` 
                         : hardwareInfo.machineName}
                     </span>
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => copyToClipboard(hardwareInfo.machineName, 'Nome da Máquina')}
                       className="h-6 w-6 p-0 flex-shrink-0"
                     >
                       {copiedField === 'Nome da Máquina' ? (
                         <Check className="h-3 w-3 text-green-600" />
                       ) : (
                         <Copy className="h-3 w-3" />
                       )}
                     </Button>
                   </div>
                   <div className="flex items-center justify-between gap-2">
                     <span className="truncate">
                       <strong>ID do Hardware:</strong> {hardwareInfo.hardwareId.length > 24 
                         ? `${hardwareInfo.hardwareId.slice(0, 24)}...` 
                         : hardwareInfo.hardwareId}
                     </span>
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => copyToClipboard(hardwareInfo.hardwareId, 'Hardware ID')}
                       className="h-6 w-6 p-0 flex-shrink-0"
                     >
                       {copiedField === 'Hardware ID' ? (
                         <Check className="h-3 w-3 text-green-600" />
                       ) : (
                         <Copy className="h-3 w-3" />
                       )}
                     </Button>
                   </div>
                 </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Campo de Licença */}
          <div className="space-y-2">
            <Label htmlFor="license-key">Chave de Licença</Label>
            <Input
              id="license-key"
              type="text"
              placeholder="Digite sua chave de licença"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && validateLicense()}
              className="font-mono text-sm"
            />
          </div>

          {/* Resultado da Validação */}
          {validationResult && (
            <Alert className={validationResult.valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {validationResult.valid ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={validationResult.valid ? 'text-green-800' : 'text-red-800'}>
                {validationResult.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Informações da Licença */}
          {validationResult?.valid && validationResult.license && (
            <div className="space-y-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800">Informações da Licença:</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Cliente:</strong> {validationResult.license.clientName}</p>
                <p><strong>Expira em:</strong> {new Date(validationResult.license.expiresAt).toLocaleDateString('pt-BR')}</p>
                <p><strong>Versão:</strong> {validationResult.license.version}</p>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={validateLicense}
              disabled={isValidating || !licenseKey.trim()}
              className="flex-1"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                'Ativar Licença'
              )}
            </Button>
            
            {onClose && (
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isValidating}
              >
                Cancelar
              </Button>
            )}
          </div>

                     {/* Ajuda */}
           <div className="text-xs text-muted-foreground text-center pt-2">
             <p>Não tem uma licença? Entre em contato com o suporte.</p>
             <p>Chave de licença deve ter 32 caracteres.</p>
             <p className="mt-1">💡 Clique nos ícones de cópia para copiar as informações do hardware.</p>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
