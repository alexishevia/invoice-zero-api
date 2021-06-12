import { byID } from './selectors.mjs';
import { newCreateAction, newUpdateAction } from '../actions.mjs';
import validate from '../validate.mjs';

const validators = {
  name: (val) => validate(val).string().notEmpty(),
};

/* --- ACTIONS --- */

export const create = newCreateAction({
  type: 'categories/create',
  requiredFields: { name: validators.name },
});

export const update = newUpdateAction({
  type: 'categories/update',
  selector: byID,
  optionalFields: { name: validators.name },
});

export function destroy(store, id) {
  const category = byID(store.state, id)
  if (category.deleted) {
    return category;
  }
  const updated = {
    ...category,
    deleted: true,
    modifiedAt: new Date().toISOString(),
  };
  store.dispatch({ type: 'categories/delete', payload: updated });
  return updated;
}
