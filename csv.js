/**
 * fetch a csv file and parse it to an array of rows. Headers row required.
 * @param {string} filename
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
export async function csv(filename) {
  if (!filename.endsWith(".csv")) {
    console.debug(`DEBUG: "${filename}" does not have the .csv filename`)
  }
  const res = await fetch(filename)
  if (!res.ok) {
    throw new Error(res.status)
  }

  const text = await res.text()
  const [headers, ...rows] = text.split("\n").map((line) => line.split(";"))
  const no_columns = headers.length
  const out = []
  for (const [index, row] of rows.entries()) {
    if (row.length !== no_columns) {
      throw new Error(`CSV: ${filename}: Wrong row length at index ${index}`)
    }
    const obj = {}
    for (const [headerInex, headerKey] of headers.entries()) {
      const key = headerKey.toLowerCase()
      obj[key] = row[headerInex]
      if (key === "name") {
        obj["key"] = row[headerInex].toLowerCase().trim().replace(/\s+/, "-")
      }
    }

    out.push(obj)
  }
  return out
}
