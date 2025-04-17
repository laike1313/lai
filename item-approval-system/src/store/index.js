import { createPinia } from 'pinia';
import { useUserStore } from './user';
import { useProcessStore } from './process';

const pinia = createPinia();

export {
  pinia,
  useUserStore,
  useProcessStore
}; 