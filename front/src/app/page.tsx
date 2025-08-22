import { getStores } from '@/lib/api';
import styles from './Home.module.scss';
import Link from 'next/link';
import { parse } from 'qs';
import {StoresFilter, StoresResponse} from "@/lib/types";
import StoreList from "@/components/stores/StoreList";

export default async function Home({
                                       searchParams,
                                   }: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const filters: StoresFilter = {
        page: searchParams.page ? parseInt(searchParams.page as string) : 1,
        limit: searchParams.limit ? parseInt(searchParams.limit as string) : undefined,
        name: searchParams.name as string | undefined,
        address: searchParams.address as string | undefined,
        timezone: searchParams.timezone as string | undefined,
        day: searchParams.day as string | undefined,
        from: searchParams.from as string | undefined,
        to: searchParams.to as string | undefined,
    };

    let storesResponse: StoresResponse = { meta: { page: 1, pageSize: 10, totalPages: 1, total: 0 }, items: [] };
    try {
        storesResponse = await getStores(filters);
    } catch (error) {
        console.error('Failed to fetch stores:', error);
    }

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <StoreList initialData={storesResponse} initialFilters={filters} />
            </div>
        </main>
    );
}