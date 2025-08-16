export function formatDateYYYYMMDD(dateStr: string, short: boolean = false): string {
  if (!/^\d{8}$/.test(dateStr)) {
    throw new Error("Formato inválido, debe ser YYYYMMDD");
  }

  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10) - 1;
  const day = parseInt(dateStr.substring(6, 8), 10);

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  if(short) {
    return `${months[month]} ${day}`;
  }

  return `${months[month]} ${day} de ${year}`;
}
