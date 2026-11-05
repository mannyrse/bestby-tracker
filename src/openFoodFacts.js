export async function fetchProduct(barcode) {
    const fields = 'product_name,image_front_small_url,image_front_url'
    const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}?fields=${fields}`

    const response = await fetch(url)
    if (!response.ok) return null

    const data = await response.json()
    if (data.status !== 1 || !data.product) return null

    const product = data.product
    return {
        name: product.product_name || '',
        imageUrl: product.image_front_small_url || product.image_front_url || '',
    }
}