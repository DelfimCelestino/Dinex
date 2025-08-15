# DineX - Sistema de Restaurante

## 📦 Distribuição para Restaurantes

Este documento explica como distribuir e instalar o sistema DineX em restaurantes.

## 🚀 Instalação Rápida

### 1. Pré-requisitos
- Windows 10/11
- Node.js 18+ (será instalado automaticamente se necessário)
- PostgreSQL instalado e configurado
- Navegador web (Edge, Chrome ou Firefox)

### 2. Instalação Automática
1. Execute o arquivo `instalar.bat` como administrador
2. Aguarde a instalação das dependências
3. Configure o banco de dados (veja seção abaixo)

### 3. Configuração do Banco
1. Execute `scripts\setup-database.bat`
2. Configure o arquivo `.env` com suas credenciais do PostgreSQL
3. Execute as migrações e seed

## ⚙️ Configuração Manual

### Arquivo .env
Crie um arquivo `.env` na raiz do projeto:

```env
# Configurações do Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/dinex"

# Configurações do Next.js
NODE_ENV=production
```

### Comandos Manuais
```bash
# Instalar dependências
npm install --production

# Configurar banco
npx prisma generate
npx prisma migrate deploy
npx prisma db seed

# Iniciar sistema
npm start
```

## 🖥️ Modo Standalone (Fullscreen)

Para usar o sistema em modo kiosk/fullscreen:

1. Inicie o sistema com `npm start`
2. Execute `scripts\run-standalone.bat`
3. O sistema abrirá em uma janela sem bordas em tela cheia
4. Use `Alt+F4` para sair do modo fullscreen

## 📁 Estrutura de Arquivos

```
dinex/
├── .next/                 # Build do Next.js
├── public/                # Arquivos estáticos
├── prisma/                # Schema e migrações do banco
├── scripts/               # Scripts de instalação
├── package.json           # Dependências
├── next.config.ts         # Configuração do Next.js
├── .env.example           # Exemplo de configuração
└── instalar.bat           # Instalador automático
```

## 🔧 Solução de Problemas

### Erro de Conexão com Banco
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no arquivo `.env`
- Teste a conexão: `npx prisma db pull`

### Erro de Porta
- O sistema usa a porta 3000 por padrão
- Se a porta estiver ocupada, altere em `next.config.ts`

### Problemas de Build
- Execute `npm run build` para regenerar
- Verifique se todas as dependências estão instaladas

## 📞 Suporte

Para suporte técnico:
- Verifique os logs em `npm start`
- Execute `npx prisma studio` para ver o banco
- Consulte a documentação do Prisma

## 🔄 Atualizações

Para atualizar o sistema:
1. Pare o servidor (`Ctrl+C`)
2. Execute `npm install` para novas dependências
3. Execute `npx prisma migrate deploy` para novas migrações
4. Reinicie com `npm start`

---

**DineX** - Sistema de Gestão para Restaurantes
Versão: 1.0.0
