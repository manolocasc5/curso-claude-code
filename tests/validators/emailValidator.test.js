const { validateEmail } = require('../../src/validators/emailValidator');

describe('validateEmail', () => {
  test('acepta emails validos', () => {
    expect(validateEmail('usuario@dominio.com')).toBe(true);
    expect(validateEmail('nombre.apellido@sub.dominio.com')).toBe(true);
    expect(validateEmail('user+tag@dominio.co')).toBe(true);
  });

  test('rechaza emails con dominio vacio antes del punto (usuario@.com)', () => {
    expect(validateEmail('usuario@.com')).toBe(false);
    expect(validateEmail('usuario@.dominio.com')).toBe(false);
  });

  test('rechaza otros formatos invalidos', () => {
    expect(validateEmail('usuario@dominio')).toBe(false);
    expect(validateEmail('usuario@dominio..com')).toBe(false);
    expect(validateEmail('@dominio.com')).toBe(false);
    expect(validateEmail('usuario@')).toBe(false);
    expect(validateEmail('')).toBe(false);
    expect(validateEmail(null)).toBe(false);
  });
});
