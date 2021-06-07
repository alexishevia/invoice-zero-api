
export default function AccountsStore() {
  const name = 'accounts';
  const state = {};

  function dispatch(state, action) {
    const { type, payload } = action;
    switch(type) {
      case 'accounts/create':
      case 'accounts/update':
      case 'accounts/delete':
        state.accounts[payload.id] = payload;
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
