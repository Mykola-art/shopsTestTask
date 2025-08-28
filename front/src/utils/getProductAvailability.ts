import {DateTime} from "luxon";
import {Product} from "@/lib/types";

export function getProductAvailability(product: Product): boolean {
    const storeTimeZone = product.store.timezone
    const now = DateTime.now().setZone(storeTimeZone);
    const today = now.toFormat('EEEE');
    const hours = product.availability[today];

    if (!hours?.from || !hours?.to) return false;

    const from = DateTime.fromFormat(hours.from, 'HH:mm', { zone: storeTimeZone });
    const to = DateTime.fromFormat(hours.to, 'HH:mm', { zone: storeTimeZone });

    return now >= from && now <= to;
}
