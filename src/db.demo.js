const ITEMS_KEY = 'best-by-demo-items'
const PRODUCTS_KEY = 'best-by-demo-products'

function daysFromToday(offset) {
    const date = new Date()
    date.setDate(date.getDate() + offset)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function sampleItems() {
    return [
        {
            id: 1,
            name: 'Buldak Ramen',
            bestBy: daysFromToday(1),
            barcode: '8801073110502',
            imageUrl: 'https://pi.nice-cdn.com/upload/image/product/large/default/samyang-buldak-hot-chicken-flavor-ramen-8-piece-bulk-pack-1552652-en.jpg',
            status: 'active',
        },
        {
            id: 2,
            name: 'Melona Banana Ice cream',
            bestBy: daysFromToday(2),
            barcode: '0769828120849',
            imageUrl: 'https://www.kroger.com/product/images/large/front/0076982812035',
            status: 'active',
        },
        {
            id: 3,
            name: 'C.C. Lemon',
            bestBy: daysFromToday(-2),
            barcode: '4901777064461',
            imageUrl: 'https://i.ebayimg.com/images/g/C-UAAOSwR0BgrZ7i/s-l1200.jpg',
            status: 'active',
        },
        {
            id: 4,
            name: 'Kewpie Mayo',
            bestBy: daysFromToday(-4),
            barcode: '4901577048234',
            imageUrl: 'https://wafuu.com/cdn/shop/products/kewpie-mayo-japanese-mayonnaise-450g-311680.png?v=1695255510',
            status: 'handled',
        },
    ]
}

function read(key, fallback) {
    try {
        const saved = localStorage.getItem(key)
        return saved ? JSON.parse(saved) : fallback
    } catch {
        return fallback
    }
}

function write(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value))
    } catch {
        // Storage blocked or full: the demo still works for this visit.
    }
}

function loadItems() {
    const saved = read(ITEMS_KEY, null)
    if (saved) return saved
    const starter = sampleItems()
    write(ITEMS_KEY, starter)
    return starter
}

export async function fetchItems() {
    return loadItems()
}

export async function insertItem(item) {
    const newItem = {
        id: Date.now(),
        name: item.name,
        bestBy: item.bestBy,
        barcode: item.barcode || '',
        imageUrl: item.imageUrl || '',
        status: 'active',
    }
    write(ITEMS_KEY, [...loadItems(), newItem])
    return newItem
}

export async function updateItem(id, changes) {
    const updatedItems = loadItems().map((item) =>
        item.id === id ? { ...item, ...changes } : item
    )
    const updated = updatedItems.find((item) => item.id === id)
    if (!updated) throw new Error('Item not found')
    write(ITEMS_KEY, updatedItems)
    return updated
}

export async function removeItem(id) {
    write(ITEMS_KEY, loadItems().filter((item) => item.id !== id))
}

export async function findProduct(barcode) {
    return read(PRODUCTS_KEY, {})[barcode] || null
}

export async function saveProduct(barcode, product) {
    write(PRODUCTS_KEY, {
        ...read(PRODUCTS_KEY, {}),
        [barcode]: { name: product.name, imageUrl: product.imageUrl },
    })
}

export function resetDemo() {
    try {
        localStorage.removeItem(ITEMS_KEY)
        localStorage.removeItem(PRODUCTS_KEY)
    } catch {
        // Nothing to reset if storage is unavailable.
    }
}