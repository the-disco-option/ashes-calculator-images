import { createElement, useState } from 'https://esm.sh/react@18.2.0'
import { render } from 'https://esm.sh/react-dom@18.2.0/'
import htm from 'https://unpkg.com/htm?module'
import { spec } from './factory.js'
import { Item } from './item.js'

/**
 * @import {Item} from "./item.js"
 */

const html = htm.bind(createElement)

function DB() {
  const items = [...spec.items.values()]

  const [search, setSearch] = useState('')
  return html`<div>
    <h3>Database</h3>
    <div>
      <input
        value="${search}"
        onChange="${(e) => setSearch(e.target.value)}"
        placeholder="Search for item"
      />
      <ul>
        ${items
          .filter(
            (item) => item.key.includes(search) || item.name.includes(search)
          )
          .map(
            (item) => html`<li key="${item.key}">${item.key} ${item.name}</li>`
          )}
      </ul>
    </div>
  </div>`
}

export function initDB() {
  render(html`<${DB} />`, document.querySelector('.db-component'))
}
