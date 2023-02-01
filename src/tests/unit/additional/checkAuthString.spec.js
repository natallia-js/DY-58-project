import checkAuthString from '../../../additional/checkAuthString';

test('check "1,2" not OK', () => {
  expect(checkAuthString('1,2')).toBe(null);
});

// test('check "123" OK', () => {
//   expect(checkAuthString('123').toBe())
// })
