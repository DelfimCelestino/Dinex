export interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  image: string | null
  category: string
  isAvailable: boolean
  preparationTime: number // em minutos
  allergens: string[]
  nutritionalInfo?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  isFavorite?: boolean
  dbId?: string
}

export const menuItems: MenuItem[] = [
  // Fast Food
  {
    id: 1,
    name: "Spicy Chicken Wings",
    description: "Crispy chicken wings with spicy buffalo sauce and ranch dip served hot",
    price: 11.99,
    image: "/breakfast-plate.png",
    category: "fast-food",
    isAvailable: true,
    preparationTime: 15,
    allergens: ["gluten", "dairy"],
    nutritionalInfo: {
      calories: 450,
      protein: 35,
      carbs: 8,
      fat: 32
    }
  },
  {
    id: 2,
    name: "Classic Cheeseburger",
    description: "Angus beef patty with cheese, lettuce, tomato and fries on side",
    price: 13.99,
    image: "/beef-burger-cheese-fries.png",
    category: "fast-food",
    isAvailable: true,
    preparationTime: 12,
    allergens: ["gluten", "dairy", "eggs"],
    nutritionalInfo: {
      calories: 680,
      protein: 28,
      carbs: 45,
      fat: 42
    }
  },
  {
    id: 3,
    name: "Fish Tacos",
    description: "Fresh fish tacos with coleslaw and chipotle mayo",
    price: 14.99,
    image: "/fish-tacos.png",
    category: "fast-food",
    isAvailable: true,
    preparationTime: 18,
    allergens: ["gluten", "fish"],
    nutritionalInfo: {
      calories: 420,
      protein: 22,
      carbs: 38,
      fat: 18
    }
  },

  // Lunch
  {
    id: 4,
    name: "Creamy Mushroom Pasta",
    description: "Fettuccine pasta in creamy mushroom sauce with parmesan cheese",
    price: 12.99,
    image: "/creamy-mushroom-pasta.png",
    category: "lunch",
    isAvailable: true,
    preparationTime: 20,
    allergens: ["gluten", "dairy"],
    nutritionalInfo: {
      calories: 520,
      protein: 18,
      carbs: 65,
      fat: 24
    }
  },
  {
    id: 5,
    name: "Dragon Roll Sushi",
    description: "Eel and cucumber topped with avocado and eel sauce drizzled on top",
    price: 16.99,
    image: "/salmon-avocado-sushi.png",
    category: "lunch",
    isAvailable: true,
    preparationTime: 25,
    allergens: ["fish", "soy"],
    nutritionalInfo: {
      calories: 380,
      protein: 24,
      carbs: 42,
      fat: 16
    }
  },
  {
    id: 6,
    name: "Caesar Salad",
    description: "Crisp romaine lettuce with grilled chicken and caesar dressing",
    price: 11.99,
    image: "/grilled-chicken-salad.png",
    category: "lunch",
    isAvailable: true,
    preparationTime: 10,
    allergens: ["gluten", "dairy", "eggs"],
    nutritionalInfo: {
      calories: 320,
      protein: 28,
      carbs: 12,
      fat: 18
    }
  },
  {
    id: 7,
    name: "Chicken Salad",
    description: "Fresh mixed greens with grilled chicken, cherry tomatoes and balsamic vinaigrette",
    price: 12.99,
    image: "/chicken-salad.png",
    category: "lunch",
    isAvailable: true,
    preparationTime: 12,
    allergens: ["gluten"],
    nutritionalInfo: {
      calories: 280,
      protein: 26,
      carbs: 8,
      fat: 16
    }
  },

  // Dinner
  {
    id: 8,
    name: "Grilled Salmon",
    description: "Fresh Atlantic salmon with roasted vegetables and lemon butter sauce",
    price: 15.99,
    image: "/grilled-salmon-vegetables.png",
    category: "dinner",
    isAvailable: true,
    preparationTime: 25,
    allergens: ["fish", "dairy"],
    nutritionalInfo: {
      calories: 420,
      protein: 38,
      carbs: 12,
      fat: 24
    }
  },
  {
    id: 9,
    name: "BBQ Beef Ribs",
    description: "Tender beef ribs with smoky BBQ sauce and coleslaw on the side",
    price: 18.99,
    image: "/placeholder-g8lfw.png",
    category: "dinner",
    isAvailable: true,
    preparationTime: 35,
    allergens: ["gluten"],
    nutritionalInfo: {
      calories: 680,
      protein: 42,
      carbs: 18,
      fat: 48
    }
  },
  {
    id: 10,
    name: "Premium Beef Steak",
    description: "8oz ribeye steak with garlic mashed potatoes and asparagus spears",
    price: 24.99,
    image: "/beef-steak-roasted-vegetables.png",
    category: "dinner",
    isAvailable: true,
    preparationTime: 30,
    allergens: ["dairy"],
    nutritionalInfo: {
      calories: 720,
      protein: 48,
      carbs: 22,
      fat: 52
    }
  },
  {
    id: 11,
    name: "Pasta Carbonara",
    description: "Classic Italian pasta with eggs, cheese, pancetta and black pepper",
    price: 14.99,
    image: "/pasta-carbonara.png",
    category: "dinner",
    isAvailable: true,
    preparationTime: 22,
    allergens: ["gluten", "dairy", "eggs"],
    nutritionalInfo: {
      calories: 580,
      protein: 24,
      carbs: 68,
      fat: 26
    }
  },
  {
    id: 12,
    name: "Vegetarian Pizza",
    description: "Fresh vegetables, mozzarella and tomato sauce on crispy crust",
    price: 16.99,
    image: "/vegetarian-pizza.png",
    category: "dinner",
    isAvailable: true,
    preparationTime: 28,
    allergens: ["gluten", "dairy"],
    nutritionalInfo: {
      calories: 480,
      protein: 18,
      carbs: 58,
      fat: 20
    }
  },

  // Drinks
  {
    id: 13,
    name: "Orange Juice",
    description: "Freshly squeezed orange juice",
    price: 3.99,
    image: "/breakfast-plate.png",
    category: "drinks",
    isAvailable: true,
    preparationTime: 2,
    allergens: [],
    nutritionalInfo: {
      calories: 120,
      protein: 2,
      carbs: 28,
      fat: 0
    }
  },
  {
    id: 14,
    name: "Iced Tea",
    description: "Refreshing iced tea with lemon",
    price: 2.99,
    image: "/iced-tea.png",
    category: "drinks",
    isAvailable: true,
    preparationTime: 1,
    allergens: [],
    nutritionalInfo: {
      calories: 45,
      protein: 0,
      carbs: 12,
      fat: 0
    }
  },
  {
    id: 15,
    name: "Mineral Water",
    description: "Natural mineral water",
    price: 1.99,
    image: "/mineral-water.png",
    category: "drinks",
    isAvailable: true,
    preparationTime: 1,
    allergens: [],
    nutritionalInfo: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    }
  },

  // Desserts
  {
    id: 16,
    name: "Chocolate Cake",
    description: "Rich chocolate cake with chocolate ganache",
    price: 6.99,
    image: "/chocolate-cake.png",
    category: "desserts",
    isAvailable: true,
    preparationTime: 5,
    allergens: ["gluten", "dairy", "eggs"],
    nutritionalInfo: {
      calories: 380,
      protein: 6,
      carbs: 48,
      fat: 18
    }
  },
  {
    id: 17,
    name: "Tiramisu",
    description: "Classic Italian dessert with coffee and mascarpone",
    price: 7.99,
    image: "/tiramisu.png",
    category: "desserts",
    isAvailable: true,
    preparationTime: 3,
    allergens: ["gluten", "dairy", "eggs"],
    nutritionalInfo: {
      calories: 320,
      protein: 8,
      carbs: 32,
      fat: 18
    }
  }
]

export const getMenuItemsByCategory = (category: string) => {
  if (category === "all") return menuItems
  return menuItems.filter(item => item.category === category)
}

export const getAvailableMenuItems = () => {
  return menuItems.filter(item => item.isAvailable)
}

export const searchMenuItems = (query: string) => {
  const lowercaseQuery = query.toLowerCase()
  return menuItems.filter(item => 
    item.name.toLowerCase().includes(lowercaseQuery) ||
    item.description.toLowerCase().includes(lowercaseQuery) ||
    item.category.toLowerCase().includes(lowercaseQuery)
  )
}
