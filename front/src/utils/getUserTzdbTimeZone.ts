import { getTimeZones } from '@vvo/tzdb';

const JS_TO_TZDB_MAP: Record<string, string> = {
    "Europe/Kiev": "Europe/Kyiv",
    "Europe/Belgrade": "Europe/Belgrad",
    "Asia/Calcutta": "Asia/Kolkata",
};

export function getUserTzdbTimeZone(): string | null {
    const jsTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const tzdbTimeZone = JS_TO_TZDB_MAP[jsTimeZone] || jsTimeZone;

    const timeZones = getTimeZones().map(tz => tz.name);

    if (timeZones.includes(tzdbTimeZone)) {
        return tzdbTimeZone;
    }

    return null;
}
