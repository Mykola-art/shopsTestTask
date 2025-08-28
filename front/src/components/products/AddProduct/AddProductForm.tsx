'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {useParams, useRouter} from 'next/navigation';
import {addProduct} from '@/lib/api';
import styles from '../../stores/CreateStore/CreateStoreForm.module.scss';
import sanitizeHtml from 'sanitize-html';
import { useState } from 'react';
import {AddProductData} from "@/lib/types";
import {DAYS_OF_WEEK} from "@/lib/constants";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {GoBackButton} from "@/components/ui/GoBackButton/GoBackButton";

const productSchema = z.object({
    name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
    price: z
        .number()
        .min(0.01, { message: 'Price must be greater than 0' })
        .refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toString()), {
            message: 'Price must have at most 2 decimal places',
        }),
    description: z.string().min(5, { message: 'Description must be at least 5 characters' }),
    availability: z
        .object({
            Monday: z.object({ from: z.string(), to: z.string() }).optional(),
            Tuesday: z.object({ from: z.string(), to: z.string() }).optional(),
            Wednesday: z.object({ from: z.string(), to: z.string() }).optional(),
            Thursday: z.object({ from: z.string(), to: z.string() }).optional(),
            Friday: z.object({ from: z.string(), to: z.string() }).optional(),
            Saturday: z.object({ from: z.string(), to: z.string() }).optional(),
            Sunday: z.object({ from: z.string(), to: z.string() }).optional(),
        })
        .refine(
            (data) => Object.values(data).some((hours) => hours && hours.from && hours.to),
            { message: 'At least one day with availability hours is required' }
        ),
    storeId: z.number(),
});

const sanitizeInput = (input: string): string => {
    return sanitizeHtml(input, {
        allowedTags: [],
        allowedAttributes: {},
    });
};

export default function AddProductForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { storeId } = useParams();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        setValue,
    } = useForm<AddProductData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            price: 0.01,
            description: '',
            availability: {},
            modifiers: [],
            storeId: +storeId,
        },
    });

    const onSubmit = async (data: AddProductData) => {
        setIsLoading(true);
        try {
            const sanitizedData = {
                ...data,
                name: sanitizeInput(data.name),
                price: data.price,
                description: sanitizeInput(data.description),
                modifiers: [],
                storeId: +storeId,
            };

            await addProduct(sanitizedData);
            toast.success('Product added successfully', {
                position: 'top-center',
                autoClose: 3000,
            });
            router.back();
            router.refresh();
        } catch (error: any) {
            if (error.message.includes('Too many requests')) {
                setError('root', { message: 'Too many requests. Please try again later.' });
            } else {
                setError('root', { message: error.message || 'Failed to add product' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <GoBackButton />
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <h1 className={styles.title}>Add New Product</h1>

                <div className={styles.field}>
                    <label htmlFor="name" className={styles.label}>
                        Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        {...register('name')}
                        className={styles.input}
                        placeholder="My new product"
                    />
                    {errors.name && <p className={styles.error}>{errors.name.message}</p>}
                </div>

                <div className={styles.field}>
                    <label htmlFor="price" className={styles.label}>
                        Price
                    </label>
                    <input
                        id="price"
                        type="number"
                        step="0.01"
                        {...register('price', { valueAsNumber: true })}
                        className={styles.input}
                        placeholder="9.99"
                    />
                    {errors.price && <p className={styles.error}>{errors.price.message}</p>}
                </div>

                <div className={styles.field}>
                    <label htmlFor="description" className={styles.label}>
                        Description
                    </label>
                    <input
                        id="description"
                        type="text"
                        {...register('description')}
                        className={styles.input}
                        placeholder="Short description"
                    />
                    {errors.description && <p className={styles.error}>{errors.description.message}</p>}
                </div>


                <div className={styles.field}>
                    <label className={styles.label}>Hours of Availability</label>
                    {DAYS_OF_WEEK.map((day) => (
                        <div key={day} className={styles.dayField}>
                            <label>{day}</label>
                            <input
                                type="time"
                                {...register(`availability.${day}.from`)}
                                className={styles.timeInput}
                                placeholder="From"
                            />
                            <input
                                type="time"
                                {...register(`availability.${day}.to`)}
                                className={styles.timeInput}
                                placeholder="To"
                            />
                            {(errors.availability && errors.availability[day]) && (
                                <p className={styles.error}>
                                    {errors.availability[day]?.from?.message || errors.availability[day]?.to?.message}
                                </p>
                            )}
                        </div>
                    ))}
                    {errors.availability?.message && <p className={styles.error}>{errors.availability.message}</p>}
                </div>

                {errors.root && <p className={styles.error}>{errors.root.message}</p>}

                <button type="submit" className={styles.button} disabled={isLoading}>
                    {isLoading ? 'Adding...' : 'Add product'}
                </button>
            </form>
        </div>
    );
}
