const makeFn = (fn, cache, { m }) => {
  return async (...args) => {
    const id = cache.hash(args)
    const res = m ? m.get(id) : cache.get(id)
    if (res) {
      return res
    }
    const back = await fn(...args)
    cache.set(id, back)
    m && m.set(id, back)
    return back
  }
}
export default (fns, cache, { preload } = {}) => {
  let m
  if (preload) {
    m = new Map()
    cache.db.getRange({ start: 0 }).forEach(({ key, value }) => {
      m.set(key, value)
    })
  }

  if (!Array.isArray(fns)) {
    return makeFn(fns, cache, { m })
  }

  return fns.map(fn => makeFn(fn, cache, { m }))
}
