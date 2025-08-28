import styles from '../Home.module.scss';
import StoreList from "@/components/stores/StoreList/StoreList";

export default async function StoresPage() {

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <StoreList />
            </div>
        </main>
    );
}
