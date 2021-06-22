export const OrderInputTypesNames = Object.freeze({
  manual: 0,
  voice: 1,
});

export const OrderInputTypes = [
  { type: OrderInputTypesNames.manual, label: 'Ручной ввод' },
  { type: OrderInputTypesNames.voice, label: 'Голосовой ассистент' },
];
