import styles from "@/components/hours/HoursList/HoursList.module.scss";
import {DAYS_OF_WEEK} from "@/lib/constants";
import {convertToLocalTime} from "@/utils/timeConverter";
import React from "react";
import {OperatingHours, Store} from "@/lib/types";
import {getUserTzdbTimeZone} from "@/utils/getUserTzdbTimeZone";
import {getTimezoneAbbreviation} from "@/utils/getTimezoneAbbreviation";

type HoursListProps = {
    operatingHours: OperatingHours;
    timezone: string;
    title: string;
};

export const HoursList = ({operatingHours, timezone, title}: HoursListProps) => {
    const userTimezone = getUserTzdbTimeZone() || "";
    const storeTzAbbr = getTimezoneAbbreviation(timezone);
    const userTzAbbr = getTimezoneAbbreviation(userTimezone);

    return (
        <div className={styles.container}>
            <strong>{title} (Local Time/User Time):</strong>
            <ul className={styles.hoursList}>
                {DAYS_OF_WEEK.map((day) => (
                    operatingHours[day] && (
                        <li key={day}>
                            {day}: {operatingHours[day].from} -{' '}
                            {operatingHours[day].to} {' '}
                            {operatingHours[day].from && storeTzAbbr} /{' '}
                            <strong>
                                {convertToLocalTime(operatingHours[day].from, day, timezone)?.from} -{' '}
                                {convertToLocalTime(operatingHours[day].to, day, timezone)?.to} {' '}
                                {convertToLocalTime(operatingHours[day].from, day, timezone)?.from && userTzAbbr}
                            </strong>
                        </li>
                    )
                ))}
            </ul>
        </div>
    )
}