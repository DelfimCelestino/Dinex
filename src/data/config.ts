export interface PaymentMethod {
  id: string
  name: string
  icon: string
  isActive: boolean
  fee: number // taxa em porcentagem
  minAmount: number
  maxAmount: number
}

export interface RestaurantConfig {
  name: string
  address: string
  phone: string
  email: string
  website: string
  openingHours: {
    monday: { open: string; close: string; isOpen: boolean }
    tuesday: { open: string; close: string; isOpen: boolean }
    wednesday: { open: string; close: string; isOpen: boolean }
    thursday: { open: string; close: string; isOpen: boolean }
    friday: { open: string; close: string; isOpen: boolean }
    saturday: { open: string; close: string; isOpen: boolean }
    sunday: { open: string; close: string; isOpen: boolean }
  }
  currency: string
  taxRate: number // taxa em porcentagem
  serviceCharge: number // taxa de serviço em porcentagem
  deliveryRadius: number // raio de entrega em km
  maxPreparationTime: number // tempo máximo de preparo em minutos
}

export const paymentMethods: PaymentMethod[] = [
  {
    id: "cash",
    name: "Dinheiro",
    icon: "💵",
    isActive: true,
    fee: 0,
    minAmount: 0,
    maxAmount: 10000
  },
  {
    id: "card",
    name: "Cartão",
    icon: "💳",
    isActive: true,
    fee: 2.5,
    minAmount: 10,
    maxAmount: 5000
  },
  {
    id: "emola",
    name: "E-Mola",
    icon: "📱",
    isActive: true,
    fee: 1.5,
    minAmount: 5,
    maxAmount: 2000
  },
  {
    id: "mpesa",
    name: "M-Pesa",
    icon: "📱",
    isActive: true,
    fee: 1.5,
    minAmount: 5,
    maxAmount: 2000
  }
]

export const restaurantConfig: RestaurantConfig = {
  name: "Dinex Restaurant",
  address: "Av. 25 de Setembro, Maputo, Moçambique",
  phone: "+258 21 123 456",
  email: "info@dinex.co.mz",
  website: "https://dinex.co.mz",
  openingHours: {
    monday: { open: "11:00", close: "22:00", isOpen: true },
    tuesday: { open: "11:00", close: "22:00", isOpen: true },
    wednesday: { open: "11:00", close: "22:00", isOpen: true },
    thursday: { open: "11:00", close: "22:00", isOpen: true },
    friday: { open: "11:00", close: "23:00", isOpen: true },
    saturday: { open: "12:00", close: "23:00", isOpen: true },
    sunday: { open: "12:00", close: "21:00", isOpen: true }
  },
  currency: "MT",
  taxRate: 17, // IVA em Moçambique
  serviceCharge: 10,
  deliveryRadius: 5,
  maxPreparationTime: 45
}

export const getPaymentMethodById = (id: string) => {
  return paymentMethods.find(method => method.id === id)
}

export const getActivePaymentMethods = () => {
  return paymentMethods.filter(method => method.isActive)
}

export const calculateTotalWithTaxes = (subtotal: number, useServiceCharge: boolean = false) => {
  const taxAmount = (subtotal * restaurantConfig.taxRate) / 100
  const serviceAmount = useServiceCharge ? (subtotal * restaurantConfig.serviceCharge) / 100 : 0
  return subtotal + taxAmount + serviceAmount
}

export const isRestaurantOpen = (day: string, time: string) => {
  const dayConfig = restaurantConfig.openingHours[day as keyof typeof restaurantConfig.openingHours]
  if (!dayConfig?.isOpen) return false
  
  const currentTime = new Date(`2000-01-01T${time}`)
  const openTime = new Date(`2000-01-01T${dayConfig.open}`)
  const closeTime = new Date(`2000-01-01T${dayConfig.close}`)
  
  return currentTime >= openTime && currentTime <= closeTime
}

export const getCurrentDay = () => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return days[new Date().getDay()]
}

export const getCurrentTime = () => {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}
