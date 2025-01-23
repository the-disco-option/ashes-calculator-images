import { createElement, useState } from 'https://esm.sh/react@18.2.0'
import { render } from 'https://esm.sh/react-dom@18.2.0/'
import htm from 'https://unpkg.com/htm?module'
import { spec } from './factory.js'

/**
 * @import {Item} from "./item.js"
 */

const html = htm.bind(createElement)

function DB() {
  /** @type {Item[]} */
  const items = [...spec.items.values()]

  const [search, setSearch] = useState('')
  return html`<div>
    <h3>Database</h3>
    <div>
      <input />
      <ul>
        ${items.map(
          (item) => html`<li key="${item.key}">${item.key} ${item.name}</li>`
        )}
      </ul>
    </div>
  </div>`
}

export function initDB() {
  render(html`<${DB} />`, document.querySelector('.db-component'))
}
