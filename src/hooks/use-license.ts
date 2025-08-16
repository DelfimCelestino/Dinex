'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface LicenseData {
  licenseKey: string;
  clientName: string;
  clientEmail?: string;
  hardwareId: string;
  machineName: string;
  issuedAt: Date;
  expiresAt: Date;
  version: string;
  features: string;
}

interface UseLicenseReturn {
  isLicenseValid: boolean;
  isLoading: boolean;
  licenseData: LicenseData | null;
  validateLicense: (licenseKey: string) => Promise<boolean>;
  checkLicenseStatus: (showToast?: boolean) => Promise<void>;
  clearLicense: () => void;
  daysRemaining: number;
  isFeatureEnabled: (featureName: string) => boolean;
}

const LICENSE_STORAGE_KEY = 'dinex_license_key';
const LICENSE_DATA_KEY = 'dinex_license_data';

export function useLicense(): UseLicenseReturn {
  const [isLicenseValid, setIsLicenseValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [licenseData, setLicenseData] = useState<LicenseData | null>(null);

  // Carregar licença do localStorage
  const loadLicenseFromStorage = useCallback(() => {
    try {
      const storedKey = localStorage.getItem(LICENSE_STORAGE_KEY);
      const storedData = localStorage.getItem(LICENSE_DATA_KEY);
      
      if (storedKey && storedData) {
        const data = JSON.parse(storedData);
        setLicenseData(data);
        return storedKey;
      }
    } catch (error) {
      console.error('Erro ao carregar licença do storage:', error);
    }
    return null;
  }, []);

  // Salvar licença no localStorage
  const saveLicenseToStorage = useCallback((licenseKey: string, data: LicenseData) => {
    try {
      localStorage.setItem(LICENSE_STORAGE_KEY, licenseKey);
      localStorage.setItem(LICENSE_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar licença no storage:', error);
    }
  }, []);

  // Limpar licença do localStorage
  const clearLicenseFromStorage = useCallback(() => {
    try {
      localStorage.removeItem(LICENSE_STORAGE_KEY);
      localStorage.removeItem(LICENSE_DATA_KEY);
    } catch (error) {
      console.error('Erro ao limpar licença do storage:', error);
    }
  }, []);

  // Validar licença
  const validateLicense = useCallback(async (licenseKey: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/licenses?action=validate&key=${encodeURIComponent(licenseKey)}`);
      const result = await response.json();

      if (result.valid && result.license) {
        setLicenseData(result.license);
        setIsLicenseValid(true);
        saveLicenseToStorage(licenseKey, result.license);
        toast.success('Licença válida! Sistema ativado.');
        return true;
      } else {
        setIsLicenseValid(false);
        setLicenseData(null);
        toast.error(result.message || 'Licença inválida');
        return false;
      }
    } catch (error) {
      console.error('Erro ao validar licença:', error);
      toast.error('Erro ao conectar com o servidor');
      return false;
    }
  }, [saveLicenseToStorage]);

  // Verificar status da licença
  const checkLicenseStatus = useCallback(async (showToast = false) => {
    const storedKey = loadLicenseFromStorage();
    
    if (!storedKey) {
      setIsLicenseValid(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/licenses?action=validate&key=${encodeURIComponent(storedKey)}`);
      const result = await response.json();

      if (result.valid && result.license) {
        setLicenseData(result.license);
        setIsLicenseValid(true);
        saveLicenseToStorage(storedKey, result.license);
        
        // Verificar se a licença expirou
        const now = new Date();
        const expiresAt = new Date(result.license.expiresAt);
        if (expiresAt <= now) {
          setIsLicenseValid(false);
          setLicenseData(null);
          clearLicenseFromStorage();
          if (showToast) {
            toast.error('Licença expirou! Sistema será bloqueado.');
          }
        }
      } else {
        setIsLicenseValid(false);
        setLicenseData(null);
        clearLicenseFromStorage();
        if (showToast) {
          toast.error('Licença expirada ou inválida');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status da licença:', error);
      // Em caso de erro de conexão, manter a licença local se existir
      if (licenseData) {
        setIsLicenseValid(true);
      } else {
        setIsLicenseValid(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [loadLicenseFromStorage, saveLicenseToStorage, clearLicenseFromStorage]);

  // Limpar licença
  const clearLicense = useCallback(() => {
    setIsLicenseValid(false);
    setLicenseData(null);
    clearLicenseFromStorage();
    toast.info('Licença removida');
  }, [clearLicenseFromStorage]);

  // Calcular dias restantes
  const daysRemaining = useCallback(() => {
    if (!licenseData) return 0;
    
    const now = new Date();
    const expiresAt = new Date(licenseData.expiresAt);
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }, [licenseData]);

  // Verificar se feature está habilitada
  const isFeatureEnabled = useCallback((featureName: string): boolean => {
    if (!licenseData || !isLicenseValid) return false;

    try {
      const features = JSON.parse(licenseData.features);
      return features[featureName] === true;
    } catch {
      return false;
    }
  }, [licenseData, isLicenseValid]);

  // Verificar licença na inicialização
  useEffect(() => {
    checkLicenseStatus(false); // Sem toast na inicialização
  }, []); // Removida dependência de checkLicenseStatus

  // Configurar validação periódica (apenas uma vez)
  useEffect(() => {
    if (!isLicenseValid) return;

    // Verificar a cada 6 horas em vez de 1 hora
    const interval = setInterval(() => {
      checkLicenseStatus(false); // Sem toast na validação periódica
    }, 6 * 60 * 60 * 1000); // 6 horas

    return () => clearInterval(interval);
  }, [isLicenseValid]); // Removida dependência de checkLicenseStatus

  // Listener para eventos de expiração de licença
  useEffect(() => {
    const handleLicenseExpired = () => {
      setIsLicenseValid(false);
      setLicenseData(null);
      clearLicenseFromStorage();
      toast.error('Licença expirou! Sistema será bloqueado.');
    };

    window.addEventListener('licenseExpired', handleLicenseExpired);
    return () => window.removeEventListener('licenseExpired', handleLicenseExpired);
  }, [clearLicenseFromStorage]);

  // Verificar expiração da licença local periodicamente (a cada 5 minutos)
  useEffect(() => {
    if (!licenseData || !isLicenseValid) return;

    const checkExpiration = () => {
      const now = new Date();
      const expiresAt = new Date(licenseData.expiresAt);
      
      if (expiresAt <= now) {
        setIsLicenseValid(false);
        setLicenseData(null);
        clearLicenseFromStorage();
        toast.error('Licença expirou! Sistema será bloqueado.');
      }
    };

    // Verificar a cada 5 minutos
    const interval = setInterval(checkExpiration, 5 * 60 * 1000);
    
    // Verificar imediatamente
    checkExpiration();

    return () => clearInterval(interval);
  }, [licenseData, isLicenseValid, clearLicenseFromStorage]);

  return {
    isLicenseValid,
    isLoading,
    licenseData,
    validateLicense,
    checkLicenseStatus,
    clearLicense,
    daysRemaining: daysRemaining(),
    isFeatureEnabled
  };
}
