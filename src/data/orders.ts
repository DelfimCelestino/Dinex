export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  image: string
  notes?: string
  isReady: boolean
}

export interface Order {
  id: string
  orderNumber: string
  date: string
  time: string
  customer: {
    name: string
    phone?: string
    email?: string
    isVIP: boolean
  }
  items: OrderItem[]
  totalPrice: number
  status: "new" | "preparing" | "ready" | "delivered" | "cancelled"
  statusColor: string
  orderType: "dine-in" | "takeaway" | "delivery"
  area?: string
  table?: string
  deliveryAddress?: string
  paymentMethod: "cash" | "card" | "emola" | "mpesa"
  paymentStatus: "pending" | "paid" | "failed"
  notes?: string
  estimatedTime: number // em minutos
  createdAt: Date
  updatedAt: Date
}

export const orders: Order[] = [
  {
    id: "order-1",
    orderNumber: "#453",
    date: "1 Sep, 2024",
    time: "03:30",
    customer: {
      name: "Leslie Alexander",
      phone: "+258 84 123 4567",
      email: "leslie@example.com",
      isVIP: false
    },
    items: [
      {
        id: "item-1",
        name: "Margarita Pizza",
        quantity: 1,
        price: 120,
        image: "/grilled-salmon-vegetables.png",
        notes: "Sem cebola",
        isReady: false
      },
      {
        id: "item-2",
        name: "Orange Juice",
        quantity: 2,
        price: 30,
        image: "/breakfast-plate.png",
        notes: "Natural",
        isReady: true
      }
    ],
    totalPrice: 180,
    status: "new",
    statusColor: "bg-blue-100 text-blue-800",
    orderType: "dine-in",
    area: "main-hall",
    table: "table-1",
    paymentMethod: "card",
    paymentStatus: "paid",
    estimatedTime: 25,
    createdAt: new Date("2024-09-01T03:30:00"),
    updatedAt: new Date("2024-09-01T03:30:00")
  },
  {
    id: "order-2",
    orderNumber: "#454",
    date: "1 Sep, 2024",
    time: "03:32",
    customer: {
      name: "Wade Warren",
      phone: "+258 85 987 6543",
      email: "wade@example.com",
      isVIP: true
    },
    items: [
      {
        id: "item-3",
        name: "Grilled Salmon",
        quantity: 1,
        price: 180,
        image: "/grilled-salmon-plate.png",
        notes: "Bem passado",
        isReady: false
      },
      {
        id: "item-4",
        name: "Caesar Salad",
        quantity: 1,
        price: 85,
        image: "/creamy-chicken-salad.png",
        notes: "Sem croutons",
        isReady: true
      },
      {
        id: "item-5",
        name: "Water",
        quantity: 2,
        price: 22,
        image: "/breakfast-plate.png",
        notes: "Com limão",
        isReady: true
      }
    ],
    totalPrice: 287,
    status: "preparing",
    statusColor: "bg-yellow-100 text-yellow-800",
    orderType: "takeaway",
    paymentMethod: "emola",
    paymentStatus: "paid",
    estimatedTime: 20,
    createdAt: new Date("2024-09-01T03:32:00"),
    updatedAt: new Date("2024-09-01T03:35:00")
  },
  {
    id: "order-3",
    orderNumber: "#455",
    date: "1 Sep, 2024",
    time: "03:35",
    customer: {
      name: "Esther Howard",
      phone: "+258 86 555 1234",
      email: "esther@example.com",
      isVIP: false
    },
    items: [
      {
        id: "item-6",
        name: "Beef Steak",
        quantity: 1,
        price: 250,
        image: "/beef-steak.png",
        notes: "Mal passado",
        isReady: false
      },
      {
        id: "item-7",
        name: "Mashed Potatoes",
        quantity: 1,
        price: 70,
        image: "/mashed-potatoes.png",
        notes: "Sem manteiga",
        isReady: true
      }
    ],
    totalPrice: 320,
    status: "ready",
    statusColor: "bg-green-100 text-green-800",
    orderType: "dine-in",
    area: "vip-area",
    table: "table-11",
    paymentMethod: "mpesa",
    paymentStatus: "paid",
    estimatedTime: 30,
    createdAt: new Date("2024-09-01T03:35:00"),
    updatedAt: new Date("2024-09-01T04:05:00")
  },
  {
    id: "order-4",
    orderNumber: "#456",
    date: "1 Sep, 2024",
    time: "03:40",
    customer: {
      name: "Cameron Williamson",
      phone: "+258 87 777 8888",
      email: "cameron@example.com",
      isVIP: false
    },
    items: [
      {
        id: "item-8",
        name: "Pasta Carbonara",
        quantity: 1,
        price: 150,
        image: "/pasta-carbonara.png",
        notes: "Sem bacon",
        isReady: true
      },
      {
        id: "item-9",
        name: "Garlic Bread",
        quantity: 2,
        price: 30,
        image: "/garlic-bread.png",
        notes: "Extra alho",
        isReady: true
      }
    ],
    totalPrice: 210,
    status: "delivered",
    statusColor: "bg-gray-100 text-gray-800",
    orderType: "dine-in",
    area: "main-hall",
    table: "table-2",
    paymentMethod: "cash",
    paymentStatus: "paid",
    estimatedTime: 22,
    createdAt: new Date("2024-09-01T03:40:00"),
    updatedAt: new Date("2024-09-01T04:02:00")
  },
  {
    id: "order-5",
    orderNumber: "#457",
    date: "1 Sep, 2024",
    time: "03:45",
    customer: {
      name: "Brooklyn Simmons",
      phone: "+258 88 999 0000",
      email: "brooklyn@example.com",
      isVIP: false
    },
    items: [
      {
        id: "item-10",
        name: "Chicken Salad",
        quantity: 1,
        price: 100,
        image: "/chicken-salad.png",
        notes: "Sem queijo",
        isReady: true
      },
      {
        id: "item-11",
        name: "Iced Tea",
        quantity: 2,
        price: 45,
        image: "/iced-tea.png",
        notes: "Sem açúcar",
        isReady: true
      }
    ],
    totalPrice: 190,
    status: "delivered",
    statusColor: "bg-gray-100 text-gray-800",
    orderType: "dine-in",
    area: "terrace",
    table: "table-7",
    paymentMethod: "card",
    paymentStatus: "paid",
    estimatedTime: 12,
    createdAt: new Date("2024-09-01T03:45:00"),
    updatedAt: new Date("2024-09-01T03:57:00")
  }
]

export const getOrdersByStatus = (status: Order["status"]) => {
  if (status === "all") return orders
  return orders.filter(order => order.status === status)
}

export const getOrdersByCustomer = (customerName: string) => {
  return orders.filter(order => 
    order.customer.name.toLowerCase().includes(customerName.toLowerCase())
  )
}

export const getOrdersByDate = (date: string) => {
  return orders.filter(order => order.date === date)
}

export const getOrderById = (orderId: string) => {
  return orders.find(order => order.id === orderId)
}

export const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
  const order = getOrderById(orderId)
  if (order) {
    order.status = newStatus
    order.updatedAt = new Date()
    
    // Update status color
    switch (newStatus) {
      case "new":
        order.statusColor = "bg-blue-100 text-blue-800"
        break
      case "preparing":
        order.statusColor = "bg-yellow-100 text-yellow-800"
        break
      case "ready":
        order.statusColor = "bg-green-100 text-green-800"
        break
      case "delivered":
        order.statusColor = "bg-gray-100 text-gray-800"
        break
      case "cancelled":
        order.statusColor = "bg-red-100 text-red-800"
        break
    }
  }
}

export const getOrdersStats = () => {
  const total = orders.length
  const newOrders = orders.filter(o => o.status === "new").length
  const preparing = orders.filter(o => o.status === "preparing").length
  const ready = orders.filter(o => o.status === "ready").length
  const delivered = orders.filter(o => o.status === "delivered").length
  const cancelled = orders.filter(o => o.status === "cancelled").length

  return {
    total,
    new: newOrders,
    preparing,
    ready,
    delivered,
    cancelled
  }
}

export const searchOrders = (query: string) => {
  const lowercaseQuery = query.toLowerCase()
  return orders.filter(order => 
    order.orderNumber.toLowerCase().includes(lowercaseQuery) ||
    order.customer.name.toLowerCase().includes(lowercaseQuery) ||
    order.items.some(item => item.name.toLowerCase().includes(lowercaseQuery))
  )
}
