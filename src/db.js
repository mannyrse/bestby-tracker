import { supabase } from './lib/supabaseClient'

function rowToItem(row) {
    return {
        id: row.id,
        name: row.name,
        bestBy: row.best_by,
        barcode: row.barcode || '',
        imageUrl: row.image_url || '',
        status: row.status,
    }
}

export async function fetchItems() {
    const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('best_by', { ascending: true })
    if (error) throw error
    return data.map(rowToItem)
}

export async function insertItem(item) {
    const { data, error } = await supabase
        .from('items')
        .insert({
            name: item.name,
            best_by: item.bestBy,
            barcode: item.barcode || null,
            image_url: item.imageUrl,
        })
        .select()
        .single()
    if (error) throw error
    return rowToItem(data)
}

export async function updateItem(id, changes) {
    const row = {}
    if ('name' in changes) row.name = changes.name
    if ('bestBy' in changes) row.best_by = changes.bestBy
    if ('status' in changes) {
        row.status = changes.status
        row.handled_at =
            changes.status === 'handled' ? new Date().toISOString() : null
    }

    const { data, error } = await supabase
        .from('items')
        .update(row)
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    return rowToItem(data)
}

export async function removeItem(id) {
    const { error } = await supabase.from('items').delete().eq('id', id)
    if (error) throw error
}

export async function findProduct(barcode) {
    const { data, error } = await supabase
        .from('products')
        .select('name, image_url')
        .eq('barcode', barcode)
        .maybeSingle()
    if (error) throw error
    if (!data) return null
    return { name: data.name, imageUrl: data.image_url || '' }
}

export async function saveProduct(barcode, product) {
    const { error } = await supabase.from('products').upsert({
        barcode,
        name: product.name,
        image_url: product.imageUrl,
    })
    if (error) throw error
}