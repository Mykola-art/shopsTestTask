import styles from "@/components/ui/GoBackButton/GoBackButton.module.scss";
import {ArrowLeft} from "lucide-react";
import {useRouter} from "next/navigation";

export const GoBackButton = () => {
    const router = useRouter();
    return (
        <button
            onClick={() => router.back()}
            className={styles.backButton}
        >
            <ArrowLeft size={20}/>
            Back
        </button>
    )
}
