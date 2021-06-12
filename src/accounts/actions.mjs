import { byID } from './selectors.mjs';
import { newCreateAction, newUpdateAction } from '../actions.mjs';
import validate from '../validate.mjs';

const validators = {
  name: (val) => validate(val).string().notEmpty(),
  initialBalance: (val) => validate(val).number().biggerOrEqualThan(0),
};

/* --- ACTIONS --- */

export const create = newCreateAction({
  type: 'accounts/create',
  requiredFields: {
    name: validators.name,
    initialBalance: validators.initialBalance,
  },
})

export const update = newUpdateAction({
  type: 'accounts/update',
  selector: byID,
  optionalFields: {
    name: validators.name,
    initialBalance: validators.initialBalance,
  },
});

export function destroy(store, id) {
  const account = byID(store.state, id)
  if (account.deleted) {
    return account;
  }
  const updated = {
    ...account,
    deleted: true,
    modifiedAt: new Date().toISOString(),
  };
  store.dispatch({ type: 'accounts/delete', payload: updated });
  return updated;
}
