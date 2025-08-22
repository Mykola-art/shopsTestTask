import { DateTime } from 'luxon';
import {DAYS_OF_WEEK} from "@/lib/constants";

export const convertToLocalTime = (
    time: string,
    day: string,
    storeTimezone: string
): { from: string; to: string } | null => {
    if (!time) return null;

    const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const now = DateTime.now().setZone(storeTimezone);
    const targetDate = now.startOf('week').plus({ days: DAYS_OF_WEEK.indexOf(day) });

    const [fromHours, fromMinutes] = time.split(':').map(Number);
    const fromTime = targetDate.set({ hour: fromHours, minute: fromMinutes });

    const fromLocal = fromTime.setZone(localTimezone).toFormat('HH:mm');

    const [toHours, toMinutes] = time.split(':').map(Number);
    const toTime = targetDate.set({ hour: toHours, minute: toMinutes });
    const toLocal = toTime.setZone(localTimezone).toFormat('HH:mm');

    return { from: fromLocal, to: toLocal };
};