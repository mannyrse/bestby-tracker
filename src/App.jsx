import { useState, useEffect } from 'react'
import './App.css'
import Scanner from './Scanner'
import { describeDue, formatDate } from './dates'
import { fetchProduct } from './openFoodFacts'
import {
  fetchItems,
  insertItem,
  updateItem,
  removeItem,
  findProduct,
  saveProduct,
} from '@db'

function Thumb({ item }) {
  if (item.imageUrl) {
    return <img src={item.imageUrl} alt="" className="item-thumb" />
  }
  return (
    <div className="item-thumb item-thumb-empty" aria-hidden="true">
      {item.name.charAt(0).toUpperCase()}
    </div>
  )
}

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

  const [addOpen, setAddOpen] = useState(false)

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

  function toggleAdd() {
    if (addOpen) setScanning(false)
    setAddOpen(!addOpen)
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
    setAddOpen(false)
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
        <header className="page-header">
          <h1>Best-By Tracker</h1>
          <button type="button" onClick={() => window.print()}>
            Print list
          </button>
        </header>

        <div className="layout">
          <aside className="sidebar">
            <section className="card add-section">
              <button
                type="button"
                className="panel-toggle"
                aria-expanded={addOpen}
                aria-controls="add-body"
                onClick={toggleAdd}
              >
                Add item
              </button>

              <div
                id="add-body"
                className={`add-body ${addOpen ? 'is-open' : ''}`}
              >
                <h2 className="add-title">Add item</h2>

                {scanning && (
                  <Scanner
                    onDetected={handleDetected}
                    onClose={() => setScanning(false)}
                  />
                )}

                <form className="add-form" onSubmit={addItem}>
                  <button
                    type="button"
                    className="btn-primary btn-large"
                    onClick={() => setScanning(true)}
                  >
                    Scan barcode
                  </button>

                  <div className="field">
                    <label htmlFor="barcode">Barcode (optional)</label>
                    <div className="barcode-row">
                      <input
                        id="barcode"
                        type="text"
                        inputMode="numeric"
                        value={barcode}
                        onChange={(event) => setBarcode(event.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => lookupBarcode(barcode)}
                      >
                        Look up
                      </button>
                    </div>
                  </div>

                  {lookupStatus === 'loading' && (
                    <p className="notice">Looking up product...</p>
                  )}
                  {lookupStatus === 'saved' && (
                    <p className="notice">
                      Found in your saved products. Enter the best-by date.
                    </p>
                  )}
                  {lookupStatus === 'found' && (
                    <p className="notice">
                      Product found. Check the name, then enter a best-by date.
                    </p>
                  )}
                  {lookupStatus === 'notfound' && (
                    <p className="notice warn">
                      Product not found. Enter the name manually.
                    </p>
                  )}
                  {lookupStatus === 'error' && (
                    <p className="notice warn">
                      Could not reach Open Food Facts. Enter the name manually.
                    </p>
                  )}

                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="Product preview"
                      className="preview"
                    />
                  )}

                  <div className="field">
                    <label htmlFor="name">Product name</label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="best-by">Best-by date</label>
                    <input
                      id="best-by"
                      type="date"
                      value={bestBy}
                      onChange={(event) => setBestBy(event.target.value)}
                      required
                    />
                  </div>

                  <details className="more">
                    <summary>Image (optional)</summary>
                    <div className="field">
                      <label htmlFor="image-url">Image URL</label>
                      <input
                        id="image-url"
                        type="text"
                        value={imageUrl}
                        onChange={(event) => setImageUrl(event.target.value)}
                      />
                    </div>
                  </details>

                  <button type="submit" className="btn-primary btn-large">
                    Add to list
                  </button>
                </form>
              </div>
            </section>
          </aside>

          <main className="main-col">
            {actionError && <p className="notice error">{actionError}</p>}
            {loading && <p className="notice">Loading inventory...</p>}
            {loadError && <p className="notice error">{loadError}</p>}

            <h2>Active ({activeItems.length})</h2>
            {!loading && !loadError && activeItems.length === 0 && (
              <p className="empty">
                Nothing to track yet. Add an item to get started.
              </p>
            )}
            <ul className="item-list">
              {activeItems.map((item) => {
                const due = describeDue(item.bestBy)
                return (
                  <li key={item.id} className={`item tone-${due.tone}`}>
                    {item.id === editingId ? (
                      <form className="edit-form" onSubmit={saveEdit}>
                        <input
                          type="text"
                          aria-label="Product name"
                          value={editName}
                          onChange={(event) => setEditName(event.target.value)}
                          required
                        />
                        <input
                          type="date"
                          aria-label="Best-by date"
                          value={editBestBy}
                          onChange={(event) =>
                            setEditBestBy(event.target.value)
                          }
                          required
                        />
                        <div className="edit-actions">
                          <button type="submit" className="btn-primary">
                            Save
                          </button>
                          <button type="button" onClick={cancelEdit}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="item-main">
                          <Thumb item={item} />
                          <div className="item-text">
                            <div className="item-name">{item.name}</div>
                            <div className="item-meta">
                              <span className={`chip chip-${due.tone}`}>
                                {due.label}
                              </span>
                              <span className="item-date">
                                {formatDate(item.bestBy)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="item-actions">
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={() => markHandled(item.id)}
                          >
                            Mark handled
                          </button>
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-danger"
                            onClick={() => deleteItem(item.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                )
              })}
            </ul>

            <details className="handled">
              <summary>Handled ({handledItems.length})</summary>
              <ul className="item-list">
                {handledItems.map((item) => (
                  <li key={item.id} className="item is-handled">
                    <div className="item-main">
                      <Thumb item={item} />
                      <div className="item-text">
                        <div className="item-name">{item.name}</div>
                        <div className="item-meta">
                          <span className="item-date">
                            {formatDate(item.bestBy)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="item-actions">
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => deleteItem(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </details>
          </main>
        </div>
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