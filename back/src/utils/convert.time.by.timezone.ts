import { DateTime } from 'luxon';

export function ConvertTimeByTimezone(
  userDay: string, 
  userTime: string,
  userTz: string,
  storeTz: string,
) {
  const weekdayNumber = DateTime.fromFormat(userDay, 'cccc').weekday;

  let dt = DateTime.fromFormat(userTime, 'HH:mm', { zone: userTz });
  dt = dt.set({ weekday: weekdayNumber });

  const storeDt = dt.setZone(storeTz);

  return {
    time: storeDt.toFormat('HH:mm'),
    day: storeDt.toFormat('cccc'),
    datetime: storeDt
  };
}
