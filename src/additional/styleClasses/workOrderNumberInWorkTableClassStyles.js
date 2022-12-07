/**
 * Стили ячейки с номером документа в таблице "Документы в работе" в зависимости от состояния документа.
 */
const workOrderNumberInWorkTableClassStyles = (order, isOrderDispatchedOnCurrentWorkPoligon) => {
  // Документ объявлен как ошибочно изданный (недействительный)
  if (order?.invalid) {
    return 'dy58-order-invalid';
  }
  // Документ издан на текущем рабочем полигоне
  if (isOrderDispatchedOnCurrentWorkPoligon) {
    return 'dy58-order-dispatched-on-this-global-poligon';
  }
};

export default workOrderNumberInWorkTableClassStyles;
