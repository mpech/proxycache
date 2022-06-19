export default (fn, cache) => async (...args) => {
  const id = cache.hash(args)
  const res = cache.get(id)
  if (res) return res
  const back = await fn(...args)
  cache.set(id, back)
  return back
}
