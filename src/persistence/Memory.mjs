
export default function MemoryPersitence() {
  return {
    appendAction: () => null,
    forEachAction: () => Promise.resolve(),
  }
}
