// Funciones de validación globales reutilizables

/**
 * Valida que un email esté completo (usuario@dominio.com)
 */
export function emailCompletoValidator(value: string): { kind: string; message: string }[] {
  value = (value ?? '').trim();
  if (!value) return [];
  const atIndex = value.indexOf('@');
  const dotIndex = value.lastIndexOf('.');
  if (
    atIndex < 1 ||
    dotIndex < atIndex + 2 ||
    dotIndex === value.length - 1 ||
    value.endsWith('-')
  ) {
    return [{ kind: 'incomplete', message: 'Ingresa un email completo (ej: usuario@dominio.com)' }];
  }
  return [];
}
