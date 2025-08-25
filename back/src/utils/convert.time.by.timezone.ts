import { DateTime } from 'luxon';

export function ConvertTimeByTimezone(
  userTime: string,
  userTz: string,
  storeTz: string,
) {
  return DateTime.fromFormat(userTime, 'HH:mm', { zone: userTz })
    .setZone(storeTz)
    .toFormat('HH:mm');
}
