export interface Table {
  id: string
  name: string
  capacity: number
  isAvailable: boolean
  isReserved: boolean
  reservationTime?: string
  currentOrder?: string
  status: "available" | "occupied" | "reserved" | "cleaning"
  areaId: string
  position: {
    x: number
    y: number
  }
}

export interface Area {
  id: string
  name: string
  description: string
  capacity: number
  tables: Table[]
  isActive: boolean
  type: "indoor" | "outdoor" | "vip" | "bar"
  features: string[]
  image?: string
  openingHours: {
    start: string
    end: string
  }
}

export const areas: Area[] = [
  {
    id: "main-hall",
    name: "Sala Principal",
    description: "Área principal do restaurante com ambiente elegante e confortável",
    capacity: 80,
    isActive: true,
    type: "indoor",
    features: ["Ar condicionado", "Vista para o jardim", "Música ambiente"],
    image: "/main-hall.jpg",
    openingHours: {
      start: "11:00",
      end: "23:00"
    },
    tables: [
      {
        id: "table-1",
        name: "Mesa 1",
        capacity: 4,
        isAvailable: true,
        isReserved: false,
        status: "available",
        areaId: "main-hall",
        position: { x: 1, y: 1 }
      },
      {
        id: "table-2",
        name: "Mesa 2",
        capacity: 6,
        isAvailable: true,
        isReserved: false,
        status: "available",
        areaId: "main-hall",
        position: { x: 2, y: 1 }
      },
      {
        id: "table-3",
        name: "Mesa 3",
        capacity: 4,
        isAvailable: false,
        isReserved: false,
        status: "occupied",
        areaId: "main-hall",
        position: { x: 3, y: 1 }
      },
      {
        id: "table-4",
        name: "Mesa 4",
        capacity: 2,
        isAvailable: true,
        isReserved: false,
        status: "available",
        areaId: "main-hall",
        position: { x: 1, y: 2 }
      },
      {
        id: "table-5",
        name: "Mesa 5",
        capacity: 8,
        isAvailable: true,
        isReserved: false,
        status: "available",
        areaId: "main-hall",
        position: { x: 2, y: 2 }
      },
      {
        id: "table-6",
        name: "Mesa 6",
        capacity: 4,
        isAvailable: false,
        isReserved: true,
        status: "reserved",
        areaId: "main-hall",
        position: { x: 3, y: 2 }
      }
    ]
  },
  {
    id: "terrace",
    name: "Terraço",
    description: "Área externa com vista panorâmica e ambiente romântico",
    capacity: 40,
    isActive: true,
    type: "outdoor",
    features: ["Vista panorâmica", "Aquecimento", "Iluminação especial"],
    image: "/terrace.jpg",
    openingHours: {
      start: "12:00",
      end: "22:00"
    },
    tables: [
      {
        id: "table-7",
        name: "Mesa 7",
        capacity: 4,
        isAvailable: true,
        isReserved: false,
        status: "available",
        areaId: "terrace",
        position: { x: 1, y: 1 }
      },
      {
        id: "table-8",
        name: "Mesa 8",
        capacity: 6,
        isAvailable: true,
        isReserved: false,
        status: "available",
        areaId: "terrace",
        position: { x: 2, y: 1 }
      },
      {
        id: "table-9",
        name: "Mesa 9",
        capacity: 2,
        isAvailable: false,
        isReserved: false,
        status: "occupied",
        areaId: "terrace",
        position: { x: 3, y: 1 }
      },
      {
        id: "table-10",
        name: "Mesa 10",
        capacity: 4,
        isAvailable: true,
        isReserved: false,
        status: "available",
        areaId: "terrace",
        position: { x: 1, y: 2 }
      }
    ]
  },
  {
    id: "vip-area",
    name: "Área VIP",
    description: "Área exclusiva para clientes especiais com serviço premium",
    capacity: 20,
    isActive: true,
    type: "vip",
    features: ["Serviço exclusivo", "Som ambiente", "Decoração premium"],
    image: "/vip-area.jpg",
    openingHours: {
      start: "18:00",
      end: "00:00"
    },
    tables: [
      {
        id: "table-11",
        name: "Mesa VIP 1",
        capacity: 6,
        isAvailable: true,
        isReserved: false,
        status: "available",
        areaId: "vip-area",
        position: { x: 1, y: 1 }
      },
      {
        id: "table-12",
        name: "Mesa VIP 2",
        capacity: 8,
        isAvailable: false,
        isReserved: true,
        status: "reserved",
        areaId: "vip-area",
        position: { x: 2, y: 1 }
      },
      {
        id: "table-13",
        name: "Mesa VIP 3",
        capacity: 4,
        isAvailable: true,
        isReserved: false,
        status: "available",
        areaId: "vip-area",
        position: { x: 1, y: 2 }
      }
    ]
  },
  {
    id: "bar-area",
    name: "Área do Bar",
    description: "Bar elegante com assentos confortáveis e ambiente descontraído",
    capacity: 30,
    isActive: true,
    type: "bar",
    features: ["Bar completo", "Assentos altos", "TV com esportes"],
    image: "/bar-area.jpg",
    openingHours: {
      start: "16:00",
      end: "02:00"
    },
    tables: [
      {
        id: "table-14",
        name: "Bar 1",
        capacity: 2,
        isAvailable: true,
        isReserved: false,
        status: "available",
        areaId: "bar-area",
        position: { x: 1, y: 1 }
      },
      {
        id: "table-15",
        name: "Bar 2",
        capacity: 2,
        isAvailable: false,
        isReserved: false,
        status: "occupied",
        areaId: "bar-area",
        position: { x: 2, y: 1 }
      },
      {
        id: "table-16",
        name: "Bar 3",
        capacity: 2,
        isAvailable: true,
        isReserved: false,
        status: "available",
        areaId: "bar-area",
        position: { x: 3, y: 1 }
      }
    ]
  }
]

export const getAreaById = (areaId: string) => {
  return areas.find(area => area.id === areaId)
}

export const getTablesByArea = (areaId: string) => {
  const area = getAreaById(areaId)
  return area?.tables || []
}

export const getAvailableTables = (areaId?: string) => {
  if (areaId) {
    return getTablesByArea(areaId).filter(table => table.isAvailable)
  }
  return areas.flatMap(area => area.tables).filter(table => table.isAvailable)
}

export const getTableById = (tableId: string) => {
  return areas.flatMap(area => area.tables).find(table => table.id === tableId)
}

export const updateTableStatus = (tableId: string, status: Table["status"]) => {
  const table = getTableById(tableId)
  if (table) {
    table.status = status
    table.isAvailable = status === "available"
  }
}

export const reserveTable = (tableId: string, reservationTime: string) => {
  const table = getTableById(tableId)
  if (table && table.isAvailable) {
    table.isReserved = true
    table.reservationTime = reservationTime
    table.status = "reserved"
    table.isAvailable = false
  }
}
