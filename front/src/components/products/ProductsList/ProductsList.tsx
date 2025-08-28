'use client';
import styles from "@/components/products/ProductsList/ProductsList.module.scss";
import {Dialog} from "@/components/ui/Dialog/Dialog";
import {useState} from "react";
import {Product, ProductsResponse} from "@/lib/types";
import {HoursList} from "@/components/hours/HoursList/HoursList";
import {CirclePlus, Trash} from 'lucide-react';
import {usePathname, useRouter} from "next/navigation";
import {deleteProduct} from "@/lib/api";
import {toast} from "react-toastify";
import {getProductAvailability} from "@/utils/getProductAvailability";

type ProductsListProps = {
    productsResponse: ProductsResponse;
    isUserAdmin: boolean,
    onProductsResponseChange: (
        updater: ProductsResponse | ((prev: ProductsResponse) => ProductsResponse)
    ) => void;
}

export default function ProductsList({productsResponse, isUserAdmin, onProductsResponseChange}: ProductsListProps) {
    const [selectedProduct, setSelectedProduct] = useState<Product>(null);
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletedProductId, setDeletedProductId] = useState(0);
    const router = useRouter();
    const pathname = usePathname();

    const handleOpenProductDialog = () => {
        setIsProductDialogOpen(true);
    }

    const handleCloseProductDialog = () => {
        setIsProductDialogOpen(false);
        setSelectedProduct(null);
    }

    const handleOpenDeleteDialog = () => {
        setIsDeleteDialogOpen(true);
    }

    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setDeletedProductId(null);
    }

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        handleOpenProductDialog();
    }

    const handleAddClick = () => {
        router.push(`${pathname}/add`);
    }

    const handleDeleteClick = (event, productId: number) => {
        event.stopPropagation();
        setDeletedProductId(productId);
        handleOpenDeleteDialog();
    }

    const updateProductList = () => {
        onProductsResponseChange((prevResponse) => ({
            ...prevResponse,
            items: prevResponse.items.filter((product) => product.id !== deletedProductId)
        }));
    };

    const onDeleteProductConfirm = async () => {
        try {
            await deleteProduct(deletedProductId);
            updateProductList();
            router.refresh();
            handleCloseDeleteDialog();
            toast.success('Product deleted successfully', {
                position: 'top-center',
                autoClose: 3000,
            });
        } catch (error) {
            toast.error(error?.message || 'Failed to delete product', {
                position: 'top-center',
                autoClose: 3000,
            });
        }
    }

    return (
        <div>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h3>Products List:</h3>
                    {isUserAdmin && (
                        <button onClick={handleAddClick} className={styles.addIcon}>
                            <CirclePlus/>
                        </button>
                    )}
                </div>
                {productsResponse.items.length === 0
                    ? (<p className={styles.noResults}>No products available.</p>)
                    : (
                        <ul className={styles.productsGrid}>
                            {productsResponse.items.map((product) => {
                                const isProductAvailable = getProductAvailability(product);
                                return (
                                    <li
                                        key={product.id}
                                        className={styles.productCard}
                                        onClick={() => handleProductClick(product)}
                                    >
                                        <div className={styles.productCardContent}>
                                            <span
                                                className={styles.statusDot}
                                                data-available={isProductAvailable}
                                            ></span>
                                            <h3>
                                                {product.name}
                                            </h3>
                                            <div className={styles.buttonsContainer}>
                                                {isUserAdmin && (
                                                    <button
                                                        onClick={(event) => {
                                                            handleDeleteClick(event, product.id);
                                                        }}
                                                        className={styles.deleteProductIcon}
                                                    >
                                                        <Trash/>
                                                    </button>
                                                )}
                                                <p>{product.price}</p>
                                            </div>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
            </div>

            <Dialog
                isOpen={isProductDialogOpen}
                onClose={handleCloseProductDialog}
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
            <Dialog
                isOpen={isDeleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                title="Delete this product?"
            >
                <div className={styles.dialogButtons}>
                    <button className={styles.cancelButton} onClick={handleCloseDeleteDialog}>Cancel</button>
                    <button className={styles.deleteButton} onClick={onDeleteProductConfirm}>Delete</button>
                </div>
            </Dialog>
        </div>
    );
}
