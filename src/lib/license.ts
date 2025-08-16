import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Chave secreta para assinatura (deve ser mantida em segredo)
const SECRET_KEY = process.env.LICENSE_SECRET_KEY || 'dinex-license-secret-key-2024';

export interface LicenseData {
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

export interface HardwareInfo {
  hardwareId: string;
  machineName: string;
  cpuInfo: string;
  diskInfo: string;
  networkInfo: string;
}

export class LicenseManager {
  private static instance: LicenseManager;
  private currentLicense: LicenseData | null = null;
  private validationInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): LicenseManager {
    if (!LicenseManager.instance) {
      LicenseManager.instance = new LicenseManager();
    }
    return LicenseManager.instance;
  }

  // Gerar ID único do hardware
  async generateHardwareId(): Promise<HardwareInfo> {
    try {
      // Em ambiente Node.js, podemos usar informações do sistema
      const os = require('os');
      const machineName = os.hostname();
      const cpuInfo = os.cpus()[0]?.model || 'unknown';
      const networkInterfaces = os.networkInterfaces();
      
      // Pegar o primeiro MAC address disponível
      let networkInfo = 'unknown';
      for (const interfaceName in networkInterfaces) {
        const interfaces = networkInterfaces[interfaceName];
        if (interfaces) {
          for (const iface of interfaces) {
            if (iface.mac && iface.mac !== '00:00:00:00:00:00') {
              networkInfo = iface.mac;
              break;
            }
          }
        }
        if (networkInfo !== 'unknown') break;
      }

      // Gerar hash único baseado nas informações do hardware
      const hardwareString = `${machineName}-${cpuInfo}-${networkInfo}`;
      const hardwareId = crypto.createHash('sha256').update(hardwareString).digest('hex');

      return {
        hardwareId,
        machineName,
        cpuInfo,
        diskInfo: 'local', // Para aplicação offline
        networkInfo
      };
    } catch (error) {
      // Fallback para ambiente browser
      const fallbackId = crypto.randomBytes(32).toString('hex');
      return {
        hardwareId: fallbackId,
        machineName: 'Unknown Machine',
        cpuInfo: 'unknown',
        diskInfo: 'local',
        networkInfo: 'unknown'
      };
    }
  }

  // Criar nova licença
  async createLicense(licenseData: Omit<LicenseData, 'licenseKey' | 'signature'>): Promise<string> {
    const licenseKey = this.generateLicenseKey();
    const signature = this.signLicense({ ...licenseData, licenseKey });
    
    const fullLicenseData = {
      ...licenseData,
      licenseKey,
      signature
    };

    // Salvar no banco de dados
    await prisma.license.create({
      data: {
        licenseKey,
        clientName: licenseData.clientName,
        clientEmail: licenseData.clientEmail,
        hardwareId: licenseData.hardwareId,
        machineName: licenseData.machineName,
        issuedAt: licenseData.issuedAt,
        expiresAt: licenseData.expiresAt,
        version: licenseData.version,
        features: licenseData.features,
        signature
      }
    });

    return licenseKey;
  }

  // Validar licença
  async validateLicense(licenseKey: string): Promise<{ valid: boolean; message: string; license?: LicenseData }> {
    try {
      // Buscar licença no banco
      const license = await prisma.license.findUnique({
        where: { licenseKey }
      });

      if (!license) {
        return { valid: false, message: 'Licença não encontrada' };
      }

      if (!license.isActive) {
        return { valid: false, message: 'Licença inativa' };
      }

      // Verificar assinatura
      const expectedSignature = this.signLicense({
        licenseKey: license.licenseKey,
        clientName: license.clientName,
        clientEmail: license.clientEmail || undefined,
        hardwareId: license.hardwareId,
        machineName: license.machineName,
        issuedAt: license.issuedAt,
        expiresAt: license.expiresAt,
        version: license.version,
        features: license.features
      });

      if (license.signature !== expectedSignature) {
        return { valid: false, message: 'Assinatura da licença inválida' };
      }

      // Verificar hardware
      const currentHardware = await this.generateHardwareId();
      if (license.hardwareId !== currentHardware.hardwareId) {
        return { valid: false, message: 'Licença não é válida para este hardware' };
      }

      // Verificar expiração
      if (new Date() > license.expiresAt) {
        return { valid: false, message: 'Licença expirada' };
      }

      // Verificar limite de validações
      if (license.validationCount >= license.maxValidations) {
        return { valid: false, message: 'Limite de validações excedido' };
      }

      // Atualizar contadores
      await prisma.license.update({
        where: { id: license.id },
        data: {
          lastValidation: new Date(),
          validationCount: license.validationCount + 1
        }
      });

      const licenseData: LicenseData = {
        licenseKey: license.licenseKey,
        clientName: license.clientName,
        clientEmail: license.clientEmail || undefined,
        hardwareId: license.hardwareId,
        machineName: license.machineName,
        issuedAt: license.issuedAt,
        expiresAt: license.expiresAt,
        version: license.version,
        features: license.features
      };

      this.currentLicense = licenseData;

      return { 
        valid: true, 
        message: 'Licença válida',
        license: licenseData
      };

    } catch (error) {
      console.error('Erro ao validar licença:', error);
      return { valid: false, message: 'Erro interno na validação' };
    }
  }

  // Gerar chave de licença
  private generateLicenseKey(): string {
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(16).toString('hex');
    const key = `${timestamp}-${random}`;
    return crypto.createHash('sha256').update(key).digest('hex').substring(0, 32);
  }

  // Assinar licença
  private signLicense(licenseData: LicenseData): string {
    const dataString = JSON.stringify({
      licenseKey: licenseData.licenseKey,
      clientName: licenseData.clientName,
      hardwareId: licenseData.hardwareId,
      issuedAt: licenseData.issuedAt.toISOString(),
      expiresAt: licenseData.expiresAt.toISOString(),
      version: licenseData.version
    });
    
    return crypto.createHmac('sha256', SECRET_KEY).update(dataString).digest('hex');
  }

  // Verificar se a licença atual é válida
  async isLicenseValid(): Promise<boolean> {
    if (!this.currentLicense) {
      return false;
    }

    const result = await this.validateLicense(this.currentLicense.licenseKey);
    return result.valid;
  }

  // Obter licença atual
  getCurrentLicense(): LicenseData | null {
    return this.currentLicense;
  }

  // Iniciar validação periódica
  startPeriodicValidation(intervalMinutes: number = 60): void {
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
    }

    this.validationInterval = setInterval(async () => {
      const isValid = await this.isLicenseValid();
      if (!isValid) {
        // Licença expirou ou se tornou inválida
        this.handleLicenseExpiration();
      }
    }, intervalMinutes * 60 * 1000);
  }

  // Parar validação periódica
  stopPeriodicValidation(): void {
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
      this.validationInterval = null;
    }
  }

  // Lidar com expiração da licença
  private handleLicenseExpiration(): void {
    // Em uma aplicação real, você pode:
    // 1. Mostrar uma tela de bloqueio
    // 2. Desabilitar funcionalidades
    // 3. Forçar logout
    // 4. Redirecionar para página de renovação
    
    console.warn('Licença expirou ou se tornou inválida');
    
    // Emitir evento para a aplicação reagir
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('licenseExpired'));
    }
  }

  // Verificar se uma feature está habilitada
  isFeatureEnabled(featureName: string): boolean {
    if (!this.currentLicense) {
      return false;
    }

    try {
      const features = JSON.parse(this.currentLicense.features);
      return features[featureName] === true;
    } catch {
      return false;
    }
  }

  // Obter dias restantes da licença
  getDaysRemaining(): number {
    if (!this.currentLicense) {
      return 0;
    }

    const now = new Date();
    const expiresAt = new Date(this.currentLicense.expiresAt);
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }
}

// Função utilitária para obter o gerenciador de licença
export const getLicenseManager = () => LicenseManager.getInstance();

// Função para criar licença de teste (apenas para desenvolvimento)
export async function createTestLicense(days: number = 30): Promise<string> {
  const manager = getLicenseManager();
  const hardware = await manager.generateHardwareId();
  
  const licenseData = {
    clientName: 'Cliente Teste',
    clientEmail: 'teste@exemplo.com',
    hardwareId: hardware.hardwareId,
    machineName: hardware.machineName,
    issuedAt: new Date(),
    expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    version: '1.0.0',
    features: JSON.stringify({
      orders: true,
      menu: true,
      reports: true,
      admin: true
    })
  };

  return await manager.createLicense(licenseData);
}
