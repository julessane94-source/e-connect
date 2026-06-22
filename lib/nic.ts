export function normalizeRegistryNumber(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function generateCitizenNic(registryNumber: string, birthDate: string | Date) {
  const normalizedRegistry = normalizeRegistryNumber(registryNumber);
  const date = birthDate instanceof Date ? birthDate : new Date(`${birthDate}T00:00:00.000Z`);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const datePart = `${year}${month}${day}`;
  const raw = `${normalizedRegistry}${datePart}`;
  const checksum = String(
    raw.split("").reduce((total, char, index) => total + char.charCodeAt(0) * (index + 1), 0) % 97
  ).padStart(2, "0");

  return `NIC-${datePart}-${normalizedRegistry}-${checksum}`;
}

export function parseBirthDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}
