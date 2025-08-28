'use client';
import { useAuth } from '@/context/AuthContext';
import {usePathname, useRouter} from 'next/navigation';
import styles from './Header.module.scss';
import { Store } from 'lucide-react';
import Link from "next/link";


export default function Header() {
    const { logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/register';

    const handleLogout = async () => {
        await logout();
        router.push('/login');
        router.refresh();
    };

    const handleStoreClick = () => {
        router.push('/stores/my');
        router.refresh();
    }

    return !isAuthPage ? (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link className={styles.logo} href={"/"}>Stores App</Link>
                <div className={styles.buttonsContainer}>
                    <button onClick={handleStoreClick} className={styles.iconButton}>
                        <Store />
                    </button>
                    <button onClick={handleLogout} className={styles.logoutButton}>
                        Log out
                    </button>
                </div>
            </div>
        </header>
    ) : null;
}