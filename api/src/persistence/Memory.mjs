/*
 * MemoryPersistence
 * pass-through implementation (does nothing)
 */

export default function MemoryPersitence() {
  return {
    append: () => null,
    forEach: () => Promise.resolve(),
  };
}
