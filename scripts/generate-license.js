#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Chave secreta para assinatura (deve ser a mesma do sistema)
const SECRET_KEY = process.env.LICENSE_SECRET_KEY || 'dinex-license-secret-key-2024';

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
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

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Gerar chave de licença
function generateLicenseKey() {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(16).toString('hex');
  const key = `${timestamp}-${random}`;
  return crypto.createHash('sha256').update(key).digest('hex').substring(0, 32);
}

// Assinar licença
function signLicense(licenseData) {
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

// Criar licença
async function createLicense(licenseData) {
  try {
    const licenseKey = generateLicenseKey();
    const signature = signLicense({ ...licenseData, licenseKey });
    
    const license = await prisma.license.create({
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

    return license;
  } catch (error) {
    throw new Error(`Erro ao criar licença: ${error.message}`);
  }
}

// Listar licenças
async function listLicenses() {
  try {
    const licenses = await prisma.license.findMany({
      orderBy: { createdAt: 'desc' }
    });

    log('\n📋 Licenças Cadastradas:', 'bright');
    log('='.repeat(80), 'cyan');

    if (licenses.length === 0) {
      logWarning('Nenhuma licença encontrada.');
      return;
    }

    licenses.forEach((license, index) => {
      const daysRemaining = Math.ceil((new Date(license.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
      const status = license.isActive ? '✅ Ativa' : '❌ Inativa';
      const daysStatus = daysRemaining > 0 ? `${daysRemaining} dias` : 'Expirada';

      log(`\n${index + 1}. Licença: ${license.licenseKey}`, 'bright');
      log(`   Cliente: ${license.clientName}`, 'cyan');
      log(`   Email: ${license.clientEmail || 'N/A'}`, 'cyan');
      log(`   Máquina: ${license.machineName}`, 'cyan');
      log(`   Hardware ID: ${license.hardwareId}`, 'cyan');
      log(`   Status: ${status}`, daysRemaining > 0 ? 'green' : 'red');
      log(`   Expira em: ${license.expiresAt.toLocaleDateString('pt-BR')} (${daysStatus})`, 'yellow');
      log(`   Validações: ${license.validationCount}/${license.maxValidations}`, 'cyan');
      log(`   Criada em: ${license.createdAt.toLocaleDateString('pt-BR')}`, 'cyan');
    });

  } catch (error) {
    logError(`Erro ao listar licenças: ${error.message}`);
  }
}

// Revogar licença
async function revokeLicense(licenseKey) {
  try {
    await prisma.license.delete({
      where: { licenseKey }
    });

    logSuccess(`Licença ${licenseKey} revogada com sucesso!`);
  } catch (error) {
    logError(`Erro ao revogar licença: ${error.message}`);
  }
}

// Mostrar ajuda
function showHelp() {
  log('\n🔑 Gerador de Licenças Dinex', 'bright');
  log('='.repeat(50), 'cyan');
  
  log('\nUso:', 'yellow');
  log('  node scripts/generate-license.js [comando] [opções]', 'cyan');
  
  log('\nComandos:', 'yellow');
  log('  create    Criar nova licença', 'cyan');
  log('  list      Listar todas as licenças', 'cyan');
  log('  revoke    Revogar uma licença', 'cyan');
  log('  help      Mostrar esta ajuda', 'cyan');
  
  log('\nExemplos:', 'yellow');
  log('  node scripts/generate-license.js create --client "João Silva" --days 30', 'cyan');
  log('  node scripts/generate-license.js list', 'cyan');
  log('  node scripts/generate-license.js revoke --key ABC123...', 'cyan');
  
  log('\nOpções para create:', 'yellow');
  log('  --client     Nome do cliente (obrigatório)', 'cyan');
  log('  --email      Email do cliente', 'cyan');
  log('  --hardware   ID do hardware (obrigatório)', 'cyan');
  log('  --machine    Nome da máquina (obrigatório)', 'cyan');
  log('  --days       Dias de validade (obrigatório)', 'cyan');
  log('  --version    Versão do sistema (padrão: 1.0.0)', 'cyan');
  log('  --features   Features habilitadas (JSON)', 'cyan');
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help') {
    showHelp();
    return;
  }

  try {
    switch (command) {
      case 'create':
        await handleCreate(args.slice(1));
        break;
      case 'list':
        await listLicenses();
        break;
      case 'revoke':
        await handleRevoke(args.slice(1));
        break;
      default:
        logError(`Comando desconhecido: ${command}`);
        showHelp();
    }
  } catch (error) {
    logError(`Erro: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

// Manipular comando create
async function handleCreate(args) {
  const options = parseArgs(args);
  
  if (!options.client || !options.hardware || !options.machine || !options.days) {
    logError('Parâmetros obrigatórios: --client, --hardware, --machine, --days');
    return;
  }

  const licenseData = {
    clientName: options.client,
    clientEmail: options.email,
    hardwareId: options.hardware,
    machineName: options.machine,
    issuedAt: new Date(),
    expiresAt: new Date(Date.now() + options.days * 24 * 60 * 60 * 1000),
    version: options.version || '1.0.0',
    features: options.features || JSON.stringify({
      orders: true,
      menu: true,
      reports: true,
      admin: true
    })
  };

  log('\n🔑 Criando nova licença...', 'bright');
  logInfo(`Cliente: ${licenseData.clientName}`);
  logInfo(`Máquina: ${licenseData.machineName}`);
  logInfo(`Hardware ID: ${licenseData.hardwareId}`);
  logInfo(`Validade: ${options.days} dias`);
  logInfo(`Expira em: ${licenseData.expiresAt.toLocaleDateString('pt-BR')}`);

  const license = await createLicense(licenseData);

  logSuccess('\nLicença criada com sucesso!');
  log('\n📋 Detalhes da Licença:', 'bright');
  log('='.repeat(50), 'cyan');
  log(`Chave: ${license.licenseKey}`, 'green');
  log(`Cliente: ${license.clientName}`, 'cyan');
  log(`Máquina: ${license.machineName}`, 'cyan');
  log(`Expira em: ${license.expiresAt.toLocaleDateString('pt-BR')}`, 'yellow');
  log(`Versão: ${license.version}`, 'cyan');
}

// Manipular comando revoke
async function handleRevoke(args) {
  const options = parseArgs(args);
  
  if (!options.key) {
    logError('Parâmetro obrigatório: --key');
    return;
  }

  logWarning(`\n⚠️  Revogando licença: ${options.key}`);
  logWarning('Esta ação não pode ser desfeita!');
  
  const license = await prisma.license.findUnique({
    where: { licenseKey: options.key }
  });

  if (!license) {
    logError('Licença não encontrada!');
    return;
  }

  logInfo(`Cliente: ${license.clientName}`);
  logInfo(`Máquina: ${license.machineName}`);
  logInfo(`Expira em: ${license.expiresAt.toLocaleDateString('pt-BR')}`);

  await revokeLicense(options.key);
}

// Parse argumentos da linha de comando
function parseArgs(args) {
  const options = {};
  
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    
    if (key.startsWith('--')) {
      const optionName = key.slice(2);
      options[optionName] = value;
    }
  }
  
  return options;
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { createLicense, listLicenses, revokeLicense };
