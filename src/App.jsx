import { useState } from 'react'
import './App.css'

const starterItems = [
  { id: 1, name: 'Buldak Ramen', bestBy: '2026-11-08', status: 'active' },
  { id: 2, name: 'Vitamilk', bestBy: '2026-11-05', status: 'active' },
  { id: 3, name: 'Yakisoba Noodles', bestBy: '2026-11-12', status: 'active' },
  { id: 4, name: 'Kewpie Mayo', bestBy: '2026-10-30', status: 'handled' },
]

function App() {
  const [items, setItems] = useState(starterItems)
  const [name, setName] = useState('')
  const [bestBy, setBestBy] = useState('')

  const activeItems = items
    .filter((item) => item.status === 'active')
    .sort((a, b) => a.bestBy.localeCompare(b.bestBy))

  const handledItems = items.filter((item) => item.status === 'handled')

  function addItem(event) {
    event.preventDefault()
    const newItem = {
      id: Date.now(),
      name: name.trim(),
      bestBy: bestBy,
      status: 'active',
    }
    setItems([...items, newItem])
    setName('')
    setBestBy('')
  }

  function markHandled(id) {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, status: 'handled' } : item
      )
    )
  }

  return (
    <div className="app">
      <h1>Best-By Tracker</h1>

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
        <button type="submit">Add</button>
      </form>

      <h2>Active</h2>
      <ul className="item-list">
        {activeItems.map((item) => (
          <li key={item.id} className="item">
            <div>{item.name}</div>
            <div>{item.bestBy}</div>
            <button onClick={() => markHandled(item.id)}>Mark handled</button>
          </li>
        ))}
      </ul>

      <h2>Handled</h2>
      <ul className="item-list">
        {handledItems.map((item) => (
          <li key={item.id} className="item">
            <div>{item.name}</div>
            <div>{item.bestBy}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App