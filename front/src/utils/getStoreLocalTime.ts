import {DateTime} from "luxon";

export function getStoreCurrentTime(timezone: string) {
    const now = DateTime.now().setZone(timezone);

    const time = now.toFormat("HH:mm");

    const day = now.toFormat("EEEE");

    return `${day} - ${time}`;
}
