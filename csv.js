/**
 * fetch a csv file and parse it to an array of rows. Headers row required.
 * @param {string} filename
 */
export async function csv(filename) {
  if (!filename.endsWith('.csv')) {
    console.debug(`DEBUG: "${filename}" does not have the .csv filename`)
  }

  const res = await fetch(filename)
  if (!res.ok) {
    throw new Error(res.status)
  }

  const text = await res.text()
  const [headers, ...rows] = text.split('\n').map((line) => line.split(';'))
  const no_columns = headers.length
  /** @type {Array<Record<string, unknown>} */
  const out = []
  for (const [index, row] of rows.entries()) {
    if (row.length !== no_columns) {
      throw new Error(`CSV: ${filename}: Wrong row length at index ${index}`)
    }
    const obj = {}
    for (const [headerInex, headerKey] of headers.entries()) {
      const key = headerKey.toLowerCase()
      obj[key] = row[headerInex]
    }

    out.push(obj)
  }
  return out
}

/**
 * @param {string} str
 * @returns {string}
 */
export function slug(str) {
  return str.trim().toLowerCase().replaceAll(/\s+/g, '-')
}

/**
 * Parse the name field to a key field
 * @param {T} obj
 * @template T
 */
export function withKey(obj) {
  const name = obj['name']
  if (typeof name !== 'string') {
    throw new Error('Missing "name" field')
  }
  obj['name'] = slug(name)
  return obj
}
