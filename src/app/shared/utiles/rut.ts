export enum RutFormat {
  DOTS = 0,
  DASH = 1,
  DOTS_DASH = 2,
}

export function cleanRut(rut: string): string {
  return (rut ?? '').replace(/[^0-9kK]/g, '').toUpperCase();
}

function splitRut(rut?: string): { digits: string; verifier: string } {
  const normalizedRut = cleanRut(rut ?? '');
  if (normalizedRut.length < 2) {
    return { digits: '', verifier: '' };
  }

  return {
    digits: normalizedRut.slice(0, -1),
    verifier: normalizedRut.slice(-1),
  };
}

function calculateRutVerifier(digits: string): string {
  let sum = 0;
  let multiplier = 2;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    sum += Number(digits[index]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  if (remainder === 11) {
    return '0';
  }
  if (remainder === 10) {
    return 'K';
  }

  return String(remainder);
}

export function validateRut(rut?: string): boolean {
  const { digits, verifier } = splitRut(rut);
  if (!digits || !verifier || !/^\d+$/.test(digits)) {
    return false;
  }

  return calculateRutVerifier(digits) === verifier;
}

export function formatRut(rut?: string, format: RutFormat = RutFormat.DOTS_DASH): string {
  const { digits, verifier } = splitRut(rut);
  if (!digits || !verifier) {
    return '';
  }

  const digitsWithDots = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  switch (format) {
    case RutFormat.DOTS:
      return digitsWithDots;
    case RutFormat.DASH:
      return `${digits}-${verifier}`;
    case RutFormat.DOTS_DASH:
    default:
      return `${digitsWithDots}-${verifier}`;
  }
}
