
export default function CategoriesStore() {
  const name = 'categories';
  const state = {};

  function dispatch(state, action) {
    const { type, payload } = action;
    switch(type) {
      case 'categories/create':
      case 'categories/update':
      case 'categories/delete':
        state.categories[payload.id] = payload;
        return true;
      default:
        return false;
    }
  }

  return {
    name,
    state,
    dispatch,
  };
}
