import { getTimeZones } from '@vvo/tzdb';

export const getTimezoneAbbreviation = (timeZone: string): string => {
    const timeZones = getTimeZones();

    const tz = timeZones.find((zone) => zone.name === timeZone);

    return tz ? tz.abbreviation : "";
}
