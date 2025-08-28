'use client'
import {StoreInfo} from "@/components/stores/StoreInfo/StoreInfo";
import ProductsList from "@/components/products/ProductsList/ProductsList";
import {useParams} from "next/navigation";
import {useEffect, useState} from "react";
import {ProductsFilter, ProductsResponse, Store} from "@/lib/types";
import {getStoreById, getStoreProducts} from "@/lib/api";
import {Loader} from "@/components/ui/Loader/Loader";
import styles from "@/components/stores/StoreContent/StoreContent.module.scss";
import {GoBackButton} from "@/components/ui/GoBackButton/GoBackButton";
import {useAuth} from "@/context/AuthContext";

const initialProductsResponse: ProductsResponse = {
    meta:{
        page: 1,
        pageSize: 10,
        totalPages: 1,
        total: 0
    },
    items: []
};

export const StoreContent = () => {
    const { storeId } = useParams();
    const [productsResponse, setProductsResponse] = useState<ProductsResponse>(initialProductsResponse);
    const [isLoading, setIsLoading] = useState(true);
    const [store, setStore] = useState<Store>(null);

    const { user } = useAuth();
    const userId = user?.userId;
    const isUserAdmin = store?.admin.id === userId;

    const fetchStoreInfo = async () => {
        setIsLoading(true);
        try {
            const repsonse = await getStoreById(+storeId);
            setStore(repsonse);
        } catch (error) {
            console.error('Failed to fetch store info:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const fetchProducts = async (filters: ProductsFilter) => {
        setIsLoading(true);
        try {
            const response = await getStoreProducts(filters);
            setProductsResponse(response);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStoreInfo();
        fetchProducts({storeId: +storeId});
    }, []);

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <div className={styles.storeContent}>
            <GoBackButton/>
            <StoreInfo store={store} isUserAdmin={isUserAdmin}/>
            <ProductsList
                productsResponse={productsResponse}
                isUserAdmin={isUserAdmin}
                onProductsResponseChange={setProductsResponse}
            />
        </div>
    )
}