# 🚀 Scripts de Instalação e Gerenciamento - Sistema DineX

## 📋 **Scripts Disponíveis**

### **1. 🛠️ `install-system.bat` - Instalador Principal**
**Propósito**: Instalação completa e automatizada do sistema DineX

**O que faz**:
- ✅ Verifica se Node.js está instalado
- ✅ Verifica se PostgreSQL está instalado
- ✅ Verifica se PM2 está instalado
- ✅ Instruções para configurar banco de dados
- ✅ Inicia o sistema automaticamente

**Como usar**:
```bash
# Execute como administrador para instalar PM2
install-system.bat
```

**Fluxo de instalação**:
1. **Verificação Node.js** → Mostra instruções se não instalado
2. **Verificação PostgreSQL** → Mostra instruções se não instalado
3. **Verificação Node.js** → Confirma disponibilidade antes de continuar
4. **Verificação PM2** → Mostra instruções se não instalado
5. **Configuração banco** → Instruções para executar `setup-database.bat`
6. **Inicialização** → Inicia diretamente com PM2 + npm start

---

### **2. 🚀 `run-standalone.bat` - Iniciar Sistema**
**Propósito**: Inicia o sistema DineX usando PM2

**O que faz**:
- ✅ Verifica dependências
- ✅ Verifica se já está rodando
- ✅ Cria configuração PM2 se necessário
- ✅ Inicia sistema com PM2
- ✅ Abre navegador automaticamente

**Como usar**:
```bash
run-standalone.bat
```

**Comportamento inteligente**:
- Se sistema já está rodando → Só abre navegador
- Se não está rodando → Inicia com PM2 + abre navegador
- Cria `ecosystem.config.js` automaticamente

---

### **3. 🛑 `stop-system.bat` - Parar Sistema**
**Propósito**: Para completamente o sistema DineX

**O que faz**:
- ✅ Para processo PM2
- ✅ Verifica se porta 3000 foi liberada
- ✅ Força parada se necessário
- ✅ Limpa processos órfãos

**Como usar**:
```bash
stop-system.bat
```

**Comandos internos**:
- `pm2 stop dinex` → Para processo
- `pm2 delete dinex` → Remove processo
- `pm2 kill` → Para todos processos PM2

---

### **4. 📊 `status-system.bat` - Verificar Status**
**Propósito**: Mostra status completo do sistema

**O que faz**:
- ✅ Status PM2
- ✅ Verificação porta 3000
- ✅ Versões instaladas
- ✅ Comandos úteis
- ✅ Status do sistema

**Como usar**:
```bash
status-system.bat
```

---

## 🔧 **Configuração PM2**

### **Arquivo `ecosystem.config.js`**
```javascript
module.exports = {
  apps: [{
    name: 'dinex',           // Nome do processo
    script: 'npm',           // Comando
    args: 'start',           // Argumentos
    cwd: '.',                // Diretório de trabalho
    instances: 1,            // Número de instâncias
    autorestart: true,       // Reinicia automaticamente
    watch: false,            // Não observa mudanças
    max_memory_restart: '1G', // Reinicia se usar >1GB
    env: {                   // Variáveis de ambiente
      NODE_ENV: 'development',
      PORT: 3000
    }
  }]
};
```

---

## 📚 **Comandos PM2 Úteis**

### **Gerenciamento de Processos**
```bash
# Ver status
pm2 status

# Ver logs
pm2 logs dinex

# Reiniciar
pm2 restart dinex

# Parar
pm2 stop dinex

# Iniciar
pm2 start dinex

# Parar tudo
pm2 kill

# Salvar configuração
pm2 save

# Restaurar configuração
pm2 resurrect
```

### **Monitoramento**
```bash
# Monitor em tempo real
pm2 monit

# Dashboard web
pm2 plus

# Logs em tempo real
pm2 logs dinex --lines 100
```

---

## 🚨 **Solução de Problemas**

### **Problema: PM2 não instalado**
```bash
# Instalar globalmente
npm install -g pm2

# Se der erro de permissão, execute como administrador
```

### **Problema: Porta 3000 em uso**
```bash
# Verificar o que está usando a porta
netstat -ano | findstr :3000

# Parar processo específico
taskkill /PID [PID_NUMBER] /F
```

### **Problema: Sistema não inicia**
```bash
# Ver logs de erro
pm2 logs dinex

# Verificar dependências
npm install

# Verificar banco de dados
setup-database.bat
```

---

## 📁 **Estrutura de Arquivos**

```
scripts/
├── install-system.bat      # Instalador principal
├── run-standalone.bat      # Iniciar sistema
├── stop-system.bat         # Parar sistema
├── status-system.bat       # Verificar status
├── setup-database.bat      # Configurar banco
├── reset-database.bat      # Resetar banco
├── generate-license.js     # Gerar licenças
├── build.js               # Build do projeto
├── deploy.js              # Deploy
└── README-SCRIPTS.md      # Este arquivo

ecosystem.config.js         # Configuração PM2
```

---

## 🎯 **Fluxo de Uso Recomendado**

### **Primeira Instalação**
1. Execute `install-system.bat` como administrador
2. Siga as instruções para Node.js e PostgreSQL
3. Sistema será configurado e iniciado automaticamente

### **Uso Diário**
1. **Iniciar**: `run-standalone.bat`
2. **Verificar**: `status-system.bat`
3. **Parar**: `stop-system.bat`

### **Manutenção**
1. **Ver logs**: `pm2 logs dinex`
2. **Reiniciar**: `pm2 restart dinex`
3. **Status**: `pm2 status`

---

## ⚠️ **Observações Importantes**

- **Execute como administrador** para instalar PM2
- **PostgreSQL deve estar rodando** antes de configurar banco
- **Node.js 18+** é recomendado
- **PM2** é instalado globalmente para gerenciar o processo
- **Porta 3000** deve estar livre
- **Logs** são salvos na pasta `logs/` (criada automaticamente)
- **Dependências** devem estar já instaladas (pasta `.next` presente)

---

**Status**: ✅ **IMPLEMENTADO**  
**Versão**: 2.0.0  
**Data**: $(date)
