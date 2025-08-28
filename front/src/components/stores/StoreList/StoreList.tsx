'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {getStores, getUserStores} from '@/lib/api';
import sanitizeHtml from 'sanitize-html';
import { getTimeZones } from '@vvo/tzdb';
import { DAYS_OF_WEEK } from '@/lib/constants';
import styles from './StoreList.module.scss';
import Link from 'next/link';
import { StoresFilter, StoresResponse } from '@/lib/types';
import {getUserTzdbTimeZone} from "@/utils/getUserTzdbTimeZone";
import {Loader} from "@/components/ui/Loader/Loader";
import {getStoreCurrentTime} from "@/utils/getStoreLocalTime";
import {GoBackButton} from "@/components/ui/GoBackButton/GoBackButton";

const filterSchema = z.object({
    name: z.string().optional(),
    address: z.string().optional(),
    timezone: z.string().optional(),
    day: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
});

type FilterFormData = z.infer<typeof filterSchema>;

const initialStoreResponse = {
    meta: {
        page: 1,
        pageSize: 10,
        totalPages: 1,
        total: 0,
    },
    items: [],
}

export default function StoreList() {
    const [storesResponse, setStoresResponse] = useState<StoresResponse>(initialStoreResponse);
    const [isLoading, setIsLoading] = useState(false);
    const timeZones = getTimeZones().map((tz) => tz.name);
    const pathname = usePathname();
    const router = useRouter();

    const isMyStoresPage = pathname === '/stores/my';
    const searchParams = useSearchParams();
    const paramsString = searchParams.toString();

    const { register, handleSubmit, setValue, watch, reset } = useForm<FilterFormData>({
        resolver: zodResolver(filterSchema),
    });

    const [timezoneInput, setTimezoneInput] = useState(getUserTzdbTimeZone() || '');

    useEffect(() => {
        fetchStores({ page: 1 });
    }, []);

    const fetchStores = async (filters: StoresFilter) => {
        setIsLoading(true);
        try {
            if (isMyStoresPage) {
                const response = await getUserStores();
                setStoresResponse({...initialStoreResponse, items: response});
            } else {
                const response = await getStores(filters);
                setStoresResponse(response);
            }
        } catch (error) {
            console.error('Failed to fetch stores:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = (data: FilterFormData) => {
        const sanitizedData: StoresFilter = {
            ...data,
            name: data.name ? sanitizeHtml(data.name, { allowedTags: [], allowedAttributes: {} }) : undefined,
            address: data.address ? sanitizeHtml(data.address, { allowedTags: [], allowedAttributes: {} }) : undefined,
            timezone: data.timezone ? sanitizeHtml(data.timezone, { allowedTags: [], allowedAttributes: {} }) : undefined,
            day: data.day ? sanitizeHtml(data.day, { allowedTags: [], allowedAttributes: {} }) : undefined,
            from: data.from ? sanitizeHtml(data.from, { allowedTags: [], allowedAttributes: {} }) : undefined,
            to: data.from ? sanitizeHtml(data.from, { allowedTags: [], allowedAttributes: {} }) : undefined,
            page: storesResponse.meta.page,
            limit: storesResponse.meta.pageSize,
        };

        const params = new URLSearchParams();

        if (data.timezone) {
            params.set('tz', data.timezone);
        }
        if (data.day) {
            params.set('day', data.day);
        }
        if (data.from) {
            params.set('time', data.from);
        }

        router.push(`?${params.toString()}`);
        fetchStores(sanitizedData);
    };

    const handlePageChange = (newPage: number) => {
        const selectedTime = watch('from');
        const filters: StoresFilter = {
            name: watch('name'),
            address: watch('address'),
            timezone: watch('timezone'),
            day: watch('day'),
            from: selectedTime,
            to: selectedTime,
            page: newPage,
            limit: storesResponse.meta.pageSize,
        };
        fetchStores(filters);
    };

    const handleResetFilters = () => {
        reset({
            name: '',
            address: '',
            timezone: '',
            day: '',
            from: '',
            to: '',
        });
        setTimezoneInput('');
        router.push(pathname);
        fetchStores({ page: 1 });
    };

    return (
        <div className={styles.storeList}>
            {isMyStoresPage && <GoBackButton />}
            <div className={styles.header}>
                {isMyStoresPage && (
                    <Link href="/stores/create" className={styles.createButton}>
                        Create a New Store
                    </Link>
                )}
                <form onSubmit={handleSubmit(onSubmit)} className={styles.filterForm}>
                    <div className={styles.filterField}>
                        <input
                            id="name"
                            type="text"
                            {...register('name')}
                            className={styles.input}
                            placeholder="Search by name"
                        />
                    </div>
                    <div className={styles.filterField}>
                        <input
                            id="address"
                            type="text"
                            {...register('address')}
                            className={styles.input}
                            placeholder="Search by address"
                        />
                    </div>
                    <div className={styles.filterField}>
                        <input
                            id="timezone"
                            type="text"
                            list="timezoneList"
                            {...register('timezone')}
                            className={styles.input}
                            placeholder="Timezone"
                            value={timezoneInput}
                            onChange={(e) => {
                                setTimezoneInput(e.target.value);
                                setValue('timezone', e.target.value);
                            }}
                        />
                        <datalist id="timezoneList">
                            {timeZones.map((tz) => (
                                <option key={tz} value={tz} />
                            ))}
                        </datalist>
                    </div>
                    <div className={styles.filterField}>
                        <select {...register('day')} className={styles.input}>
                            <option value="">Day</option>
                            {DAYS_OF_WEEK.map((day) => (
                                <option key={day} value={day}>
                                    {day}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.filterField}>
                        <input
                            id="from"
                            type="time"
                            {...register('from')}
                            className={styles.input}
                            placeholder="From"
                        />
                    </div>
                    <button type="submit" className={styles.filterButton} disabled={isLoading}>
                        Filter
                    </button>
                    <button
                        type="button"
                        onClick={handleResetFilters}
                        className={styles.resetButton}
                        disabled={isLoading}
                    >
                        Reset
                    </button>
                </form>
            </div>

            {isLoading ? (
                <Loader />
            ) : storesResponse.items.length === 0 ? (
                <p className={styles.noResults}>No stores found.</p>
            ) : (
                <ul className={styles.storeGrid}>
                    {storesResponse.items.map((store) => {
                        const storeCurrentTime = getStoreCurrentTime(store.timezone);
                        return (
                            <Link
                                key={store.id}
                                href={`/stores/${store.id}/products?${paramsString}`}
                                className={styles.storeLink}
                            >
                                <li className={styles.storeCard}>
                                    <div className={styles.storeHeader}>
                                        <h3 className={styles.storeName}>{store.name}</h3>
                                        <span className={styles.storeSlug}>{store.slug}</span>
                                    </div>
                                    <div className={styles.storeDetails}>
                                        <div className={styles.detailItem}>
                                            <strong>Address:</strong> {store.address}
                                        </div>
                                        <div className={styles.detailItem}>
                                            <strong>Timezone:</strong> {store.timezone}
                                        </div>
                                        <div className={styles.detailItem}>
                                            <strong>Local Time:</strong> {storeCurrentTime}
                                        </div>
                                    </div>
                                </li>
                            </Link>
                    )})}
                </ul>
            )}

            {!isMyStoresPage && storesResponse.meta.totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        onClick={() => handlePageChange(storesResponse.meta.page - 1)}
                        disabled={storesResponse.meta.page <= 1}
                        className={styles.pageButton}
                    >
                        Previous
                    </button>
                    <span className={styles.pageInfo}>
                        Page {storesResponse.meta.page} of {storesResponse.meta.totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(storesResponse.meta.page + 1)}
                        disabled={storesResponse.meta.page >= storesResponse.meta.totalPages}
                        className={styles.pageButton}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}