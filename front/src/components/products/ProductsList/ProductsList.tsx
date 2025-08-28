'use client';
import styles from "@/components/products/ProductsList/ProductsList.module.scss";
import {Dialog} from "@/components/ui/Dialog/Dialog";
import {useState} from "react";
import {Product} from "@/lib/types";
import {HoursList} from "@/components/hours/HoursList/HoursList";
import {CirclePlus} from 'lucide-react';
import {usePathname, useRouter} from "next/navigation";

export default function ProductsList({productsResponse}) {
    const [selectedProduct, setSelectedProduct] = useState<Product>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const handleOpenDialog = () => {
        setIsDialogOpen(true);
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setSelectedProduct(null);
    }

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        handleOpenDialog();
    }

    const handleAddClick = () => {
        router.push(`${pathname}/add`);
    }

    return (
        <div>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h3>Products List:</h3>
                    <button onClick={handleAddClick} className={styles.addIcon}>
                        <CirclePlus/>
                    </button>
                </div>
                {productsResponse.items.length === 0
                    ? (<p className={styles.noResults}>No products available.</p>)
                    : (
                        <ul className={styles.productsGrid}>
                            {productsResponse.items.map((product) => {
                                const isProductAvailable = false;
                                return (
                                    <li
                                        key={product.id}
                                        className={styles.productCard}
                                        onClick={() => handleProductClick(product)}
                                    >
                                        <div className={styles.productCardContent}>
                                            <h3 className={isProductAvailable ? styles.available : styles.unavailable}>
                                                {product.name}
                                            </h3>
                                            <p>{product.price}</p>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
            </div>

            <Dialog
                isOpen={isDialogOpen}
                onClose={handleCloseDialog}
                title="Product Details"
            >
                <div>
                    {selectedProduct && (
                        <>
                            <p>Price: {selectedProduct?.price}</p>
                            <p>Description: {selectedProduct?.description}</p>
                            <HoursList
                                operatingHours={selectedProduct.availability}
                                timezone={selectedProduct.store.timezone}
                                title="Hours of Availability"
                            />
                        </>
                )}
                </div>
            </Dialog>
        </div>
    );
}
