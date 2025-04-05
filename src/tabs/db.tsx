import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { spec } from '../factory'

function DatebaseTab() {
  const items = [...spec.items.values()]

  const [search, setSearch] = useState('')

  const filteredItems = items.filter(
    (item) => item.key.includes(search) || item.name.includes(search)
  )
  return (
    <div>
      <h3>Database</h3>
      <div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for item"
        />
        <ul>
          {filteredItems.map((item) => (
            <li key={item.key}>
              {item.key} {item.name}
              <img
                src={`images/${item.key}.png`}
                height="16px"
                width="16px"
                loading="lazy"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function initDB() {
  const root = createRoot(document.querySelector('.db-component'))
  root.render(<DatebaseTab />)
}
