#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors[bright]}${step}${colors[reset]}`, 'cyan');
  log(message, 'yellow');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function runCommand(command, description) {
  try {
    logStep('EXECUTANDO', description);
    execSync(command, { stdio: 'inherit' });
    logSuccess(`${description} concluído com sucesso`);
    return true;
  } catch (error) {
    logError(`Falha ao executar: ${description}`);
    return false;
  }
}

function checkEnvironment() {
  const requiredEnvVars = ['DATABASE_URL'];
  const missing = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }
  
  if (missing.length > 0) {
    logError(`Variáveis de ambiente obrigatórias não encontradas: ${missing.join(', ')}`);
    return false;
  }
  
  return true;
}

function main() {
  const args = process.argv.slice(2);
  const skipMigrations = args.includes('--skip-migrations');
  const skipSeed = args.includes('--skip-seed');
  const forceSeed = args.includes('--force-seed');
  
  log('🚀 Iniciando deploy de produção do Dinex', 'bright');
  
  // Verificar variáveis de ambiente
  if (!checkEnvironment()) {
    process.exit(1);
  }
  
  const steps = [];
  
  // Passos do deploy
  steps.push({
    command: 'npx prisma generate',
    description: 'Gerando cliente Prisma'
  });
  
  if (!skipMigrations) {
    steps.push({
      command: 'npx prisma migrate deploy',
      description: 'Aplicando migrações do banco de dados'
    });
  }
  
  steps.push({
    command: 'npm run build',
    description: 'Build da aplicação Next.js'
  });
  
  if (!skipSeed && fs.existsSync(path.join(process.cwd(), 'prisma', 'seed.ts'))) {
    const seedCommand = forceSeed ? 'npm run prisma:seed:force' : 'npm run prisma:seed';
    steps.push({
      command: seedCommand,
      description: forceSeed ? 'Executando seed forçado' : 'Executando seed do banco'
    });
  }
  
  // Executar todos os passos
  let allSuccess = true;
  
  for (const step of steps) {
    if (!runCommand(step.command, step.description)) {
      allSuccess = false;
      break;
    }
  }
  
  if (allSuccess) {
    log('\n🎉 Deploy concluído com sucesso!', 'bright');
    log('A aplicação está pronta para produção.', 'green');
    log('Execute "npm start" para iniciar o servidor.', 'blue');
  } else {
    log('\n💥 Deploy falhou!', 'bright');
    log('Verifique os erros acima e tente novamente.', 'red');
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main, runCommand, log, logStep, logSuccess, logError, logWarning };
