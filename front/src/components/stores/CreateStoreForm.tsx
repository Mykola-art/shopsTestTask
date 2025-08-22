'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { createStore } from '@/lib/api';
import styles from './CreateStoreForm.module.scss';
import sanitizeHtml from 'sanitize-html';
import { useState } from 'react';
import { getTimeZones } from '@vvo/tzdb';
import {CreateStoreData} from "@/lib/types";
import {DAYS_OF_WEEK} from "@/lib/constants";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ArrowLeft } from 'lucide-react';

const storeSchema = z.object({
    slug: z
        .string()
        .min(3, { message: 'Slug must be at least 3 characters' })
        .regex(/^[a-z0-9-]+$/, { message: 'Slug can only contain lowercase letters, numbers, and hyphens' }),
    name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
    address: z.string().min(5, { message: 'Address must be at least 5 characters' }),
    timezone: z.string().min(1, { message: 'Timezone is required' }),
    lat: z.number().min(-90).max(90, { message: 'Latitude must be between -90 and 90' }).optional(),
    lng: z.number().min(-180).max(180, { message: 'Longitude must be between -180 and 180' }).optional(),
    operatingHours: z
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
            { message: 'At least one day with operating hours is required' }
        ),
});

const sanitizeInput = (input: string): string => {
    return sanitizeHtml(input, {
        allowedTags: [],
        allowedAttributes: {},
    });
};

export default function CreateStoreForm() {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        setValue,
    } = useForm<CreateStoreData>({
        resolver: zodResolver(storeSchema),
        defaultValues: {
            slug: '',
            name: '',
            address: '',
            timezone: '',
            lat: 0,
            lng: 0,
            operatingHours: {},
        },
    });
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [timezoneInput, setTimezoneInput] = useState('');

    const timeZones = getTimeZones().map((tz) => tz.name);

    const onSubmit = async (data: CreateStoreData) => {
        setIsLoading(true);
        try {
            const sanitizedData = {
                ...data,
                slug: sanitizeInput(data.slug),
                name: sanitizeInput(data.name),
                address: sanitizeInput(data.address),
                timezone: sanitizeInput(data.timezone),
                lat: 0,
                lng: 0,
            };

            await createStore(sanitizedData);
            toast.success('Store created successfully', {
                position: 'top-center',
                autoClose: 3000,
            });
            router.push('/');
            router.refresh();
        } catch (error: any) {
            if (error.message.includes('Too many requests')) {
                setError('root', { message: 'Too many requests. Please try again later.' });
            } else if (error.message.includes('Store with this slug already exists')) {
                setError('slug', { message: 'Store with this slug already exists' });
            } else {
                setError('root', { message: error.message || 'Failed to create store' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <button
                onClick={() => router.push('/')}
                className={styles.backButton}
            >
                <ArrowLeft size={20} />
                Back
            </button>
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <h1 className={styles.title}>Create a New Store</h1>

                <div className={styles.field}>
                    <label htmlFor="slug" className={styles.label}>
                        Slug
                    </label>
                    <input
                        id="slug"
                        type="text"
                        {...register('slug')}
                        className={styles.input}
                        placeholder="my-store"
                    />
                    {errors.slug && <p className={styles.error}>{errors.slug.message}</p>}
                </div>

                <div className={styles.field}>
                    <label htmlFor="name" className={styles.label}>
                        Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        {...register('name')}
                        className={styles.input}
                        placeholder="My Test Store"
                    />
                    {errors.name && <p className={styles.error}>{errors.name.message}</p>}
                </div>

                <div className={styles.field}>
                    <label htmlFor="address" className={styles.label}>
                        Address
                    </label>
                    <input
                        id="address"
                        type="text"
                        {...register('address')}
                        className={styles.input}
                        placeholder="123 Street, City"
                    />
                    {errors.address && <p className={styles.error}>{errors.address.message}</p>}
                </div>

                <div className={styles.field}>
                    <label htmlFor="timezone" className={styles.label}>
                        Timezone
                    </label>
                    <input
                        id="timezone"
                        type="text"
                        list="timezoneList"
                        {...register('timezone')}
                        className={styles.input}
                        placeholder="Europe/Kyiv"
                        value={timezoneInput}
                        onChange={(e) => {
                            setTimezoneInput(e.target.value);
                            setValue('timezone', e.target.value);
                        }}
                    />
                    <datalist id="timezoneList">
                        {timeZones.map((tz) => (
                            <option key={tz} value={tz} />
                        ))}
                    </datalist>
                    {errors.timezone && <p className={styles.error}>{errors.timezone.message}</p>}
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Operating Hours</label>
                    {DAYS_OF_WEEK.map((day) => (
                        <div key={day} className={styles.dayField}>
                            <label>{day}</label>
                            <input
                                type="time"
                                {...register(`operatingHours.${day}.from`)}
                                className={styles.timeInput}
                                placeholder="From"
                            />
                            <input
                                type="time"
                                {...register(`operatingHours.${day}.to`)}
                                className={styles.timeInput}
                                placeholder="To"
                            />
                            {errors.operatingHours?.[day] && (
                                <p className={styles.error}>
                                    {errors.operatingHours[day]?.from?.message || errors.operatingHours[day]?.to?.message}
                                </p>
                            )}
                        </div>
                    ))}
                    {/*{errors.operatingHours?.message && <p className={styles.error}>{errors.operatingHours.message}</p>}*/}
                </div>

                {errors.root && <p className={styles.error}>{errors.root.message}</p>}

                <button type="submit" className={styles.button} disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Store'}
                </button>
            </form>
        </div>
    );
}