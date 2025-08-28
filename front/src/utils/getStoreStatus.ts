import {OperatingHours} from "@/lib/types";
import {DateTime} from "luxon";

export const getStoreStatus = (operatingHours: OperatingHours, storeTimezone: string): string  => {
    const now = DateTime.now().setZone(storeTimezone);
    const today = now.toFormat('EEEE');
    const hours = operatingHours[today];

    if (!hours || !hours.from || !hours.to) {
        return 'Closed today';
    }

    const from = DateTime.fromFormat(hours.from, 'HH:mm', { zone: storeTimezone });
    const to = DateTime.fromFormat(hours.to, 'HH:mm', { zone: storeTimezone });

    if (now < from) {
        const diffHours = Math.round(from.diff(now, 'hours').hours);
        return `Opens in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else if (now >= from && now <= to) {
        const diffHours = Math.round(to.diff(now, 'hours').hours);
        return `Closes in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else {
        return 'Closed now';
    }
}