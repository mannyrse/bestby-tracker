import { useState, useEffect } from 'react'
import './App.css'
import Scanner from './Scanner'
import { fetchProduct } from './openFoodFacts'

const starterItems = [
  { id: 1, name: 'Buldak Ramen', bestBy: '2026-11-08', status: 'active' },
  { id: 2, name: 'Vitamilk', bestBy: '2026-11-05', status: 'active' },
  { id: 3, name: 'Yakisoba Noodles', bestBy: '2026-11-12', status: 'active' },
  { id: 4, name: 'Kewpie Mayo', bestBy: '2026-10-30', status: 'handled' },
]

const STORAGE_KEY = 'best-by-items'

function loadItems() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : starterItems
  } catch {
    return starterItems
  }
}

function App() {
  const [items, setItems] = useState(loadItems)

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const activeItems = items
    .filter((item) => item.status === 'active')
    .sort((a, b) => a.bestBy.localeCompare(b.bestBy))

  const handledItems = items.filter((item) => item.status === 'handled')

  async function lookupBarcode(code) {
    const cleaned = code.trim()
    if (!cleaned) return

    setLookupStatus('loading')
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

  function addItem(event) {
    event.preventDefault()
    const newItem = {
      id: Date.now(),
      name: name.trim(),
      bestBy: bestBy,
      barcode: barcode.trim(),
      imageUrl: imageUrl.trim(),
      status: 'active',
    }
    setItems([...items, newItem])
    setName('')
    setBestBy('')
    setBarcode('')
    setImageUrl('')
    setLookupStatus('')
  }

  function markHandled(id) {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, status: 'handled' } : item
      )
    )
  }

  function startEdit(item) {
    setEditingId(item.id)
    setEditName(item.name)
    setEditBestBy(item.bestBy)
  }

  function saveEdit(event) {
    event.preventDefault()
    setItems(
      items.map((item) =>
        item.id === editingId
          ? { ...item, name: editName.trim(), bestBy: editBestBy }
          : item
      )
    )
    setEditingId(null)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  function deleteItem(id) {
    if (window.confirm('Delete this entry? This cannot be undone.')) {
      setItems(items.filter((item) => item.id !== id))
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