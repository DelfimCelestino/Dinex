# Sistema de Licença Dinex

Este documento explica como implementar e usar o sistema de licença do Dinex para aplicações offline.

## 🛡️ Características de Segurança

O sistema de licença implementa várias camadas de segurança para dificultar a manipulação:

### 1. **Identificação de Hardware**
- Gera um ID único baseado no hardware da máquina
- Usa informações do CPU, nome da máquina e MAC address
- Impede que a licença seja usada em outras máquinas

### 2. **Criptografia e Assinatura Digital**
- Chaves de licença são geradas com criptografia SHA-256
- Cada licença possui uma assinatura digital HMAC
- Verificação de integridade em cada validação

### 3. **Controle de Tempo**
- Licenças com data de expiração
- Validação periódica automática
- Bloqueio automático quando expira

### 4. **Controle de Uso**
- Limite de validações por licença
- Contador de uso para detectar abuso
- Revogação remota de licenças

### 5. **Obfuscação**
- Código de verificação distribuído em múltiplos arquivos
- Validação em camadas (frontend + backend)
- Dificulta engenharia reversa

## 🚀 Como Usar

### 1. **Configuração Inicial**

Primeiro, configure a chave secreta no arquivo `.env`:

```env
LICENSE_SECRET_KEY=sua-chave-secreta-muito-segura-aqui
```

### 2. **Gerar Licenças**

Use o script de linha de comando para gerar licenças:

```bash
# Criar uma nova licença
node scripts/generate-license.js create --client "Nome do Cliente" --email "cliente@email.com" --hardware "hardware-id" --machine "Nome da Máquina" --days 30

# Listar todas as licenças
node scripts/generate-license.js list

# Revogar uma licença
node scripts/generate-license.js revoke --key "chave-da-licenca"
```

### 3. **Obter Hardware ID**

Para obter o ID do hardware da máquina do cliente:

```bash
# Via API
curl http://localhost:3000/api/licenses?action=hardware

# Via interface web
# Acesse a tela de ativação de licença
```

### 4. **Ativação pelo Cliente**

O cliente deve:

1. Abrir o sistema
2. Inserir a chave de licença fornecida
3. O sistema validará automaticamente
4. A licença será salva localmente

## 📋 Estrutura do Sistema

### Arquivos Principais

- `src/lib/license.ts` - Lógica principal do sistema de licença
- `src/hooks/use-license.ts` - Hook React para gerenciar licenças
- `src/components/license-activation.tsx` - Interface de ativação
- `src/components/license-guard.tsx` - Proteção de rotas
- `src/components/license-info.tsx` - Informações da licença
- `src/app/api/licenses/route.ts` - API para gerenciar licenças
- `scripts/generate-license.js` - Script para gerar licenças

### Modelo de Dados

```sql
model License {
  id              String   @id @default(cuid())
  licenseKey      String   @unique
  clientName      String
  clientEmail     String?
  hardwareId      String
  machineName     String
  issuedAt        DateTime @default(now())
  expiresAt       DateTime
  isActive        Boolean  @default(true)
  lastValidation  DateTime @default(now())
  validationCount Int      @default(0)
  maxValidations  Int      @default(100)
  version         String   @default("1.0.0")
  features        String
  signature       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

## 🔧 Implementação no Código

### 1. **Proteger Rotas**

```tsx
import { LicenseGuard } from '@/components/license-guard';

export default function ProtectedPage() {
  return (
    <LicenseGuard requiredFeatures={['admin', 'reports']}>
      <YourComponent />
    </LicenseGuard>
  );
}
```

### 2. **Verificar Features**

```tsx
import { useLicense } from '@/hooks/use-license';

function MyComponent() {
  const { isFeatureEnabled } = useLicense();
  
  if (!isFeatureEnabled('reports')) {
    return <div>Feature não disponível</div>;
  }
  
  return <ReportsComponent />;
}
```

### 3. **Mostrar Informações da Licença**

```tsx
import { LicenseInfo } from '@/components/license-info';

function Dashboard() {
  return (
    <div>
      <LicenseInfo />
      {/* Outros componentes */}
    </div>
  );
}
```

## 🛠️ Funcionalidades Avançadas

### 1. **Controle de Features**

Você pode habilitar/desabilitar funcionalidades específicas:

```json
{
  "orders": true,
  "menu": true,
  "reports": false,
  "admin": true,
  "analytics": false
}
```

### 2. **Validação Periódica**

O sistema valida automaticamente a licença:
- A cada hora quando online
- Na inicialização do sistema
- Quando há mudança de rede

### 3. **Modo Offline**

- Licenças válidas funcionam offline
- Validação local com dados armazenados
- Sincronização quando há conexão

### 4. **Avisos de Expiração**

- Aviso 7 dias antes da expiração
- Bloqueio automático quando expira
- Notificações visuais no sistema

## 🔒 Medidas Anti-Manipulação

### 1. **Validação Múltipla**
- Verificação no frontend e backend
- Validação de assinatura digital
- Verificação de hardware

### 2. **Controle de Tempo**
- Timestamps em cada validação
- Verificação de expiração
- Sincronização com servidor

### 3. **Limitação de Uso**
- Contador de validações
- Limite máximo de verificações
- Detecção de uso excessivo

### 4. **Obfuscação de Código**
- Código distribuído em múltiplos arquivos
- Funções com nomes não descritivos
- Validação em camadas

## 🚨 Cenários de Segurança

### 1. **Cliente Tenta Alterar Data do Sistema**
- ✅ Sistema detecta inconsistência
- ✅ Bloqueia acesso imediatamente
- ✅ Registra tentativa de manipulação

### 2. **Cliente Tenta Copiar Licença**
- ✅ Licença vinculada ao hardware
- ✅ Não funciona em outras máquinas
- ✅ Detecção de hardware diferente

### 3. **Cliente Tenta Modificar Arquivos**
- ✅ Assinatura digital inválida
- ✅ Sistema detecta corrupção
- ✅ Bloqueio automático

### 4. **Cliente Tenta Bypass Offline**
- ✅ Validação periódica quando online
- ✅ Sincronização obrigatória
- ✅ Bloqueio após período offline

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o sistema de licença:

1. **Documentação**: Consulte este arquivo
2. **Issues**: Abra uma issue no repositório
3. **Email**: Entre em contato com o suporte

## 🔄 Atualizações

O sistema de licença é atualizado regularmente para:

- Melhorar a segurança
- Adicionar novas funcionalidades
- Corrigir vulnerabilidades
- Otimizar performance

Mantenha o sistema sempre atualizado para garantir a máxima segurança.
