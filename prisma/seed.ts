// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Criar métodos de pagamento
  const paymentMethods = [
    { name: 'Dinheiro', icon: '💵' },
    { name: 'E-Mola', icon: '📱' },
    { name: 'Cartão', icon: '💳' },
    { name: 'M-Pesa', icon: '📱' },
  ]

  for (const method of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { name: method.name },
      update: {},
      create: {
        name: method.name,
        icon: method.icon,
        isActive: true,
      },
    })
  }

  console.log('✅ Payment methods created')

  // Criar áreas
  const areas = [
    { name: 'Área Principal', description: 'Sala principal do restaurante' },
    { name: 'Terraço', description: 'Área externa com vista' },
    { name: 'Área VIP', description: 'Área exclusiva para clientes VIP' },
  ]

  for (const area of areas) {
    await prisma.area.upsert({
      where: { name: area.name },
      update: {},
      create: {
        name: area.name,
        description: area.description,
        isActive: true,
      },
    })
  }

  console.log('✅ Areas created')

  // Criar mesas
  const areasData = await prisma.area.findMany()
  
  for (const area of areasData) {
    // Criar 6 mesas para cada área
    for (let i = 1; i <= 2; i++) {
      await prisma.table.upsert({
        where: { number: `${area.name}-${i}` },
        update: {},
        create: {
          number: `${area.name}-${i}`,
          name: `Mesa ${i}`,
          capacity: 4,
          areaId: area.id,
          isActive: true,
        },
      })
    }
  }

  console.log('✅ Tables created')

  // Criar categorias
  const categories = [
    { name: 'Fast Food', icon: '🍔' },
    { name: 'Bebidas', icon: '🥤' },
    { name: 'Sobremesas', icon: '🍰' },
    { name: 'Pratos Principais', icon: '🍽️' },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: {
        name: category.name,
        icon: category.icon,
        isActive: true,
      },
    })
  }

  console.log('✅ Categories created')

  // Criar configurações padrão da empresa
  const existingSettings = await prisma.companySettings.findFirst();

  if (!existingSettings) {
    await prisma.companySettings.create({
      data: {
        name: 'Restaurante Dinex',
        location: 'Nampula, Moçambique',
        phone: '+258 878405131',
        localNumber: '123',
        nuit: '123456789',
        isConfigured: false, // Será configurado pelo usuário
      },
    })
  }

  console.log('✅ Company settings created')

  // Criar usuário root
  const hashedPassword = await bcrypt.hash('dinex@pastola', 10)
  await prisma.user.upsert({
    where: { authCode: '000000' },
    update: {},
    create: {
      name: 'ADMINISTRADOR ROOT',
      phone: '(258) 878405131',
      email: 'admin@restaurante.com',
      authCode: '000000',
      password: hashedPassword,
      role: 'ROOT',
      isActive: true,
    },
  })
  console.log('✅ Root user created')

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
