/*
 * MemoryPersistence
 * pass-through implementation (does nothing)
 */

export default function MemoryPersitence() {
  return {
    appendAction: () => null,
    forEachAction: () => Promise.resolve(),
  }
}
