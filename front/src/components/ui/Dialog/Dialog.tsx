'use client';
import React, { useEffect } from 'react';
import styles from './Dialog.module.scss';
import {X} from "lucide-react";

type DialogProps = {
    isOpen: boolean;
    title?: string;
    children: React.ReactNode;
    onClose: () => void;
};

export const Dialog = ({isOpen, title, children, onClose }: DialogProps) => {
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKey);
        }
        return () => {
            document.removeEventListener('keydown', handleKey)
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    {title && <h2 className={styles.title}>{title}</h2>}
                    <button className={styles.closeIcon} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className={styles.content}>{children}</div>
            </div>
        </div>
    );
}
