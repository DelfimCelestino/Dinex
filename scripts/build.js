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
  log(`\n${colors.bright}${step}${colors.reset}`, 'cyan');
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

function checkPrismaFiles() {
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  const seedPath = path.join(process.cwd(), 'prisma', 'seed.ts');
  
  if (!fs.existsSync(schemaPath)) {
    logError('Arquivo prisma/schema.prisma não encontrado');
    return false;
  }
  
  if (!fs.existsSync(seedPath)) {
    logWarning('Arquivo prisma/seed.ts não encontrado - seed será pulado');
    return false;
  }
  
  return true;
}

function main() {
  const args = process.argv.slice(2);
  const skipSeed = args.includes('--no-seed');
  const forceSeed = args.includes('--force-seed');
  const skipPrisma = args.includes('--no-prisma');
  const showHelp = args.includes('--help') || args.includes('-h');
  
  if (showHelp) {
    log('📖 Script de Build do Dinex', 'bright');
    log('\nUso:', 'cyan');
    log('  node scripts/build.js [opções]', 'yellow');
    log('\nOpções:', 'cyan');
    log('  --no-seed       Pula a execução do seed', 'yellow');
    log('  --force-seed    Força a execução do seed', 'yellow');
    log('  --no-prisma     Pula comandos do Prisma', 'yellow');
    log('  --help, -h      Mostra esta ajuda', 'yellow');
    log('\nExemplos:', 'cyan');
    log('  node scripts/build.js', 'yellow');
    log('  node scripts/build.js --no-seed', 'yellow');
    log('  node scripts/build.js --no-prisma', 'yellow');
    return;
  }
  
  log('🚀 Iniciando processo de build do Dinex', 'bright');
  
  // Verificar arquivos do Prisma
  if (!skipPrisma && !checkPrismaFiles()) {
    process.exit(1);
  }
  
  const steps = [];
  
  // Adicionar passos baseados nos argumentos
  if (!skipPrisma) {
    steps.push({
      command: 'npx prisma generate',
      description: 'Gerando cliente Prisma'
    });
  }
  
  steps.push({
    command: 'npx next build',
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
    log('\n🎉 Build concluído com sucesso!', 'bright');
    log('A aplicação está pronta para produção.', 'green');
  } else {
    log('\n💥 Build falhou!', 'bright');
    log('Verifique os erros acima e tente novamente.', 'red');
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main, runCommand, log, logStep, logSuccess, logError, logWarning };
