'use client'
import styles from "@/components/stores/StoreInfo/StoreInfo.module.scss";
import {HoursList} from "@/components/hours/HoursList/HoursList";
import { useAuth } from '@/context/AuthContext';
import {Store} from "@/lib/types";
import {useState} from "react";
import {deleteStore, getStores, getUserStores} from "@/lib/api";
import {Dialog} from "@/components/ui/Dialog/Dialog";
import { Trash } from 'lucide-react';
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";

type StoreInfoProps = {
    store: Store,
}

export const StoreInfo = ({ store }: StoreInfoProps) => {
    const [isDeleteDialog, setIsDeleteDialog] = useState(false);
    const router = useRouter();
    const { user } = useAuth();
    const userId = user?.userId;
    const isUserAdmin = store.admin.id === userId;

    const handleOpenDeleteDialog = () => {
        setIsDeleteDialog(true);
    }

    const handleCloseDeleteDialog = () => {
        setIsDeleteDialog(false);
    }

    const handleStoreDelete = () => {
        handleOpenDeleteDialog();
    }

    const onDeleteConfirm = async () => {
        try {
            await deleteStore(store.id);

            router.back();
            handleCloseDeleteDialog();
            toast.success('Store deleted successfully', {
                position: 'top-center',
                autoClose: 3000,
            });
        } catch (error) {
            toast.error(error?.message || 'Failed to delete store', {
                position: 'top-center',
                autoClose: 3000,
            });
        }
    }

    return (
        <div className={styles.storeInfo}>
            <div className={styles.header}>
                <p className={styles.storeName}>{store.name} info:</p>
                {isUserAdmin && (
                    <button onClick={handleStoreDelete} className={styles.deleteIcon}>
                        <Trash/>
                    </button>
                )}
            </div>
            <HoursList
                operatingHours={store.operatingHours}
                timezone={store.timezone}
                title="Working Hours"
            />
            <Dialog
                isOpen={isDeleteDialog}
                onClose={handleCloseDeleteDialog}
                title="Delete this store?"

            >
                <div className={styles.dialogButtons}>
                    <button className={styles.cancelButton} onClick={handleCloseDeleteDialog}>Cancel</button>
                    <button className={styles.deleteButton} onClick={onDeleteConfirm}>Delete</button>
                </div>
            </Dialog>

        </div>
    )
}
