# Scripts de Build, Deploy e Distribuição

Este diretório contém scripts personalizados para automatizar o processo de build, deploy e distribuição da aplicação Dinex.

## Scripts Disponíveis

### Build Scripts

#### `npm run build`
Script principal de build que executa:
1. `prisma generate` - Gera o cliente Prisma
2. `next build` - Build da aplicação Next.js
3. `prisma db seed` - Executa o seed do banco de dados

#### `npm run build:no-seed`
Build sem executar o seed do banco de dados.

#### `npm run build:force-seed`
Build com seed forçado (ignora se já foi executado).

#### `npm run build:no-prisma`
Build sem executar comandos do Prisma.

### Deploy Scripts

#### `npm run deploy`
Script completo de deploy para produção:
1. `prisma generate` - Gera o cliente Prisma
2. `prisma migrate deploy` - Aplica migrações do banco
3. `next build` - Build da aplicação
4. `prisma db seed` - Executa o seed

#### `npm run deploy:no-migrations`
Deploy sem aplicar migrações do banco.

#### `npm run deploy:no-seed`
Deploy sem executar o seed.

### Prisma Scripts

#### `npm run prisma:generate`
Gera o cliente Prisma baseado no schema.

#### `npm run prisma:seed`
Executa o seed do banco de dados.

#### `npm run prisma:seed:force`
Executa o seed forçado (ignora se já foi executado).

#### `npm run prisma:migrate`
Aplica migrações pendentes do banco.

#### `npm run prisma:reset`
Reseta o banco e executa o seed (⚠️ **CUIDADO: Apaga todos os dados**).

#### `npm run prisma:studio`
Abre o Prisma Studio para visualizar/editar dados.

#### `npm run db:setup`
Setup completo do banco:
1. `prisma generate`
2. `prisma migrate deploy`
3. `prisma db seed`

### Scripts de Distribuição e Standalone

#### `setup-database.bat`
Script para configurar o banco de dados:
- Verifica dependências
- Gera cliente Prisma
- Executa migrações
- Executa seed (opcional)

#### `run-standalone.bat`
Script para rodar o sistema em modo standalone/fullscreen:
- Verifica se o servidor está rodando
- Abre em navegador sem bordas
- Suporte para Edge, Chrome e Firefox

#### `dev-standalone.bat`
Script para desenvolvimento em modo standalone:
- Inicia servidor de desenvolvimento
- Abre automaticamente em modo standalone
- Ideal para testes de interface

#### `build-and-distribute.bat`
Script para preparar distribuição:
- Faz build do projeto
- Cria pasta de distribuição
- Inclui scripts de instalação
- Prepara para envio a restaurantes

## Uso

### Desenvolvimento
```bash
# Build completo para desenvolvimento
npm run build

# Build sem seed (útil para testes)
npm run build:no-seed
```

### Produção
```bash
# Deploy completo
npm run deploy

# Deploy sem migrações (se já aplicadas)
npm run deploy:no-migrations

# Deploy sem seed (se dados já existem)
npm run deploy:no-seed
```

### Banco de Dados
```bash
# Setup inicial do banco
npm run db:setup

# Apenas gerar cliente Prisma
npm run prisma:generate

# Apenas executar seed
npm run prisma:seed

# Reset completo do banco (⚠️ CUIDADO)
npm run prisma:reset
```

## Variáveis de Ambiente

Para o deploy funcionar corretamente, certifique-se de ter as seguintes variáveis de ambiente configuradas:

- `DATABASE_URL` - URL de conexão com o banco de dados

## Estrutura dos Scripts

### build.js
- Verifica arquivos do Prisma
- Executa build com opções configuráveis
- Output colorido e informativo
- Tratamento de erros

### deploy.js
- Verifica variáveis de ambiente
- Executa deploy completo para produção
- Inclui migrações do banco
- Output colorido e informativo

## Troubleshooting

### Erro: "Arquivo prisma/schema.prisma não encontrado"
- Verifique se o arquivo `prisma/schema.prisma` existe
- Execute `npm run prisma:generate` manualmente

### Erro: "Variáveis de ambiente obrigatórias não encontradas"
- Configure a variável `DATABASE_URL` no seu ambiente
- Para desenvolvimento, use um arquivo `.env.local`

### Erro: "Falha ao executar seed"
- Verifique se o arquivo `prisma/seed.ts` existe
- Execute `npm run prisma:seed` manualmente para ver erros detalhados

### Build falha no Prisma
- Execute `npm run prisma:generate` manualmente
- Verifique se o schema está correto
- Execute `npm run prisma:migrate` se necessário

## 📦 Distribuição para Restaurantes

### Preparar Distribuição
```bash
# Executar script de distribuição
scripts\build-and-distribute.bat
```

### Arquivos para Distribuir
O script cria uma pasta `dist` com:
- Build completo do Next.js
- Scripts de instalação
- Configurações do banco
- Documentação

### Instalação no Restaurante
1. Usuário executa `instalar.bat`
2. Configura arquivo `.env` com credenciais do banco
3. Executa `scripts\setup-database.bat`
4. Inicia com `npm start`
5. Usa `scripts\run-standalone.bat` para modo fullscreen

### Documentação Completa
Veja `README-DISTRIBUICAO.md` para instruções detalhadas de instalação.
