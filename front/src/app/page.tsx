'use client'
import styles from './Home.module.scss';
import {useAuth} from "@/context/AuthContext";

export default function Home() {
    const { user } = useAuth();

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <h1 className={styles.title}>
                    Welcome{user?.email ? `, ${user.email}` : ''}!
                </h1>
                <p className={styles.description}>
                    This is the home page of the Shops App. Manage your stores or explore new ones!
                </p>
            </div>
        </main>
    );
}