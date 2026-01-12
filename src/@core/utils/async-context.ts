
import { AsyncLocalStorage } from 'node:async_hooks';

const contexts = new Map<string, AsyncLocalStorage<{[key:string]: any}>>();

export const setContext = <T extends {[key:string]: any}>(key:string, context:T) => {
  const store = contexts.get(key) || new AsyncLocalStorage<T>();

  if (!contexts.has(key))
    contexts.set(key, store);

  return <K>(cb:()=>K) => store.run<K>(context, cb);
};

export const getContext = (key:string) => {
  const store = contexts.get(key);

  if (store)
    return store.getStore();
};
