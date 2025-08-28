import styles from "@/components/ui/Loader/Loader.module.scss";
import { Loader as Spinner }  from "lucide-react";

export const Loader = () => {
    return (
        <div className={styles.container}>
            <Spinner className={styles.spinner}/>
            <p className={styles.text}>Loading...</p>
        </div>
    )
}
