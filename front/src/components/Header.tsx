'use client';
import { useAuth } from '@/context/AuthContext';
import {usePathname, useRouter} from 'next/navigation';
import styles from './Header.module.scss';


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

    return !isAuthPage ? (
        <header className={styles.header}>
            <div className={styles.container}>
                <h1 className={styles.logo}>Shops App</h1>
                <button onClick={handleLogout} className={styles.logoutButton}>
                    Log out
                </button>
            </div>
        </header>
    ) : null;
}