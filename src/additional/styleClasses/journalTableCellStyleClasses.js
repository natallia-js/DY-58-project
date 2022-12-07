import { ORDER_PATTERN_TYPES } from '@/constants/orderPatterns';

function journalTableCellStyleClasses(order) {
  let resultStyleClasses = '';
  // Запись о недействительном документе
  if (order?.invalid) {
    resultStyleClasses = 'dy58-invalid-order-record';
  }
  // Запись о документе, изданном ревизором
  if (order?.type === ORDER_PATTERN_TYPES.CONTROL) {
    resultStyleClasses += ' dy58-control-record';
  }
  return resultStyleClasses;
}

export default journalTableCellStyleClasses;
