import { ref } from 'vue';

const dateFrom = ref<string>('');
const dateTo = ref<string>('');

export function useGlobalFilter() {
  return { dateFrom, dateTo };
}
