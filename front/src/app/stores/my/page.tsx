import StoreList from "@/components/stores/StoreList/StoreList";
import styles from "@/app/Home.module.scss";

export default async function MyStoresPage() {
    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <StoreList/>
            </div>
        </main>
    );
}
