export function formatToAmPm(time24: string) {
  const [hours, minutes] = time24.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12; // Converts 0 (midnight) or 12 (noon) correctly
  return `${displayHour}:${minutes} ${ampm}`;
}


export function formatTo24Hour(time12h: string): string {
  const [time, modifier] = time12h.trim().split(/\s+/);

  const [hours, minutes] = time.split(':');
  let hoursNum = parseInt(hours, 10);

  if (modifier.toUpperCase() === 'PM' && hoursNum !== 12) {
    hoursNum += 12;
  } else if (modifier.toUpperCase() === 'AM' && hoursNum === 12) {
    hoursNum = 0;
  }

  const formattedHours = hoursNum.toString().padStart(2, '0');
  // this the db time format string
  return `${formattedHours}:${minutes}`;
}
