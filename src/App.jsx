import { useState, useEffect } from 'react'
import './App.css'
import Scanner from './Scanner'
import { fetchProduct } from './openFoodFacts'
import {
  fetchItems,
  insertItem,
  updateItem,
  removeItem,
  findProduct,
  saveProduct,
} from '@db'

function App() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')

  const [name, setName] = useState('')
  const [bestBy, setBestBy] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editBestBy, setEditBestBy] = useState('')

  const [barcode, setBarcode] = useState('')
  const [scanning, setScanning] = useState(false)

  const [imageUrl, setImageUrl] = useState('')
  const [lookupStatus, setLookupStatus] = useState('')

  useEffect(() => {
    async function load() {
      try {
        setItems(await fetchItems())
      } catch (error) {
        console.error(error)
        setLoadError('Could not load the inventory. Check your connection.')
      }
      setLoading(false)
    }
    load()
  }, [])

  const activeItems = items
    .filter((item) => item.status === 'active')
    .sort((a, b) => a.bestBy.localeCompare(b.bestBy))

  const handledItems = items.filter((item) => item.status === 'handled')

  function fail(message, error) {
    console.error(error)
    setActionError(message)
  }

  async function lookupBarcode(code) {
    const cleaned = code.trim()
    if (!cleaned) return

    setLookupStatus('loading')

    try {
      const saved = await findProduct(cleaned)
      if (saved) {
        setName(saved.name)
        setImageUrl(saved.imageUrl)
        setLookupStatus('saved')
        return
      }
    } catch (error) {
      console.error(error)
    }

    try {
      const product = await fetchProduct(cleaned)
      if (product && product.name) {
        setName(product.name)
        setImageUrl(product.imageUrl)
        setLookupStatus('found')
      } else {
        setLookupStatus('notfound')
      }
    } catch {
      setLookupStatus('error')
    }
  }

  function handleDetected(code) {
    setBarcode(code)
    setScanning(false)
    lookupBarcode(code)
  }

  async function addItem(event) {
    event.preventDefault()
    setActionError('')
    const cleanedBarcode = barcode.trim()
    const cleanedName = name.trim()
    const cleanedImage = imageUrl.trim()

    try {
      const saved = await insertItem({
        name: cleanedName,
        bestBy: bestBy,
        barcode: cleanedBarcode,
        imageUrl: cleanedImage,
      })
      setItems((current) => [...current, saved])
    } catch (error) {
      fail('Could not add the item. Please try again.', error)
      return
    }

    if (cleanedBarcode) {
      try {
        await saveProduct(cleanedBarcode, {
          name: cleanedName,
          imageUrl: cleanedImage,
        })
      } catch (error) {
        console.error(error)
      }
    }

    setName('')
    setBestBy('')
    setBarcode('')
    setImageUrl('')
    setLookupStatus('')
  }

  async function markHandled(id) {
    setActionError('')
    try {
      const updated = await updateItem(id, { status: 'handled' })
      setItems((current) =>
        current.map((item) => (item.id === id ? updated : item))
      )
    } catch (error) {
      fail('Could not mark the item as handled.', error)
    }
  }

  function startEdit(item) {
    setEditingId(item.id)
    setEditName(item.name)
    setEditBestBy(item.bestBy)
  }

  async function saveEdit(event) {
    event.preventDefault()
    setActionError('')
    try {
      const updated = await updateItem(editingId, {
        name: editName.trim(),
        bestBy: editBestBy,
      })
      setItems((current) =>
        current.map((item) => (item.id === editingId ? updated : item))
      )
      setEditingId(null)
    } catch (error) {
      fail('Could not save your changes.', error)
    }
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function deleteItem(id) {
    if (!window.confirm('Delete this entry? This cannot be undone.')) return
    setActionError('')
    try {
      await removeItem(id)
      setItems((current) => current.filter((item) => item.id !== id))
    } catch (error) {
      fail('Could not delete the item.', error)
    }
  }

  return (
    <div className="app">
      <div className="screen-only">
        <h1>Best-By Tracker</h1>

        <button type="button" onClick={() => window.print()}>
          Print list
        </button>

        {scanning && (
          <Scanner
            onDetected={handleDetected}
            onClose={() => setScanning(false)}
          />
        )}

        <form onSubmit={addItem}>
          <input
            type="text"
            placeholder="Product name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <input
            type="date"
            value={bestBy}
            onChange={(event) => setBestBy(event.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Barcode (optional)"
            value={barcode}
            onChange={(event) => setBarcode(event.target.value)}
          />
          <button type="button" onClick={() => lookupBarcode(barcode)}>
            Look up
          </button>
          <input
            type="text"
            placeholder="Image URL (optional)"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
          />
          <button type="button" onClick={() => setScanning(true)}>
            Scan barcode
          </button>
          <button type="submit">Add</button>
        </form>

        {lookupStatus === 'loading' && <p>Looking up product...</p>}
        {lookupStatus === 'saved' && (
          <p>Found in your saved products. Enter the best-by date.</p>
        )}
        {lookupStatus === 'found' && (
          <p>Product found. Check the name, then enter a best-by date.</p>
        )}
        {lookupStatus === 'notfound' && (
          <p>Product not found. Enter the name manually.</p>
        )}
        {lookupStatus === 'error' && (
          <p>Could not reach Open Food Facts. Enter the name manually.</p>
        )}
        {imageUrl && (
          <img src={imageUrl} alt="Product preview" className="item-image" />
        )}

        {actionError && <p>{actionError}</p>}
        {loading && <p>Loading inventory...</p>}
        {loadError && <p>{loadError}</p>}

        <h2>Active</h2>
        <ul className="item-list">
          {activeItems.map((item) => (
            <li key={item.id} className="item">
              {item.id === editingId ? (
                <form onSubmit={saveEdit}>
                  <input
                    type="text"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    required
                  />
                  <input
                    type="date"
                    value={editBestBy}
                    onChange={(event) => setEditBestBy(event.target.value)}
                    required
                  />
                  <button type="submit">Save</button>
                  <button type="button" onClick={cancelEdit}>
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt="" className="item-image" />
                  )}
                  <div>{item.name}</div>
                  <div>{item.bestBy}</div>
                  <button onClick={() => markHandled(item.id)}>
                    Mark handled
                  </button>
                  <button onClick={() => startEdit(item)}>Edit</button>
                  <button onClick={() => deleteItem(item.id)}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>

        <h2>Handled</h2>
        <ul className="item-list">
          {handledItems.map((item) => (
            <li key={item.id} className="item">
              {item.imageUrl && (
                <img src={item.imageUrl} alt="" className="item-image" />
              )}
              <div>{item.name}</div>
              <div>{item.bestBy}</div>
              <button onClick={() => deleteItem(item.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="print-only">
        <h1>Best-By List</h1>
        <p>Printed {new Date().toLocaleDateString()}</p>

        {activeItems.length === 0 ? (
          <p>No active items.</p>
        ) : (
          <table className="print-table">
            <thead>
              <tr>
                <th></th>
                <th>Product</th>
                <th>Best by</th>
              </tr>
            </thead>
            <tbody>
              {activeItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className="print-box"></span>
                  </td>
                  <td>{item.name}</td>
                  <td>{item.bestBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default App