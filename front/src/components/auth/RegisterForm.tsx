'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './RegisterForm.module.scss';
import { RegisterFormData } from '@/lib/types';
import { registerUser } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

const registerSchema = z
    .object({
        email: z.string().email({ message: 'Invalid email format' }),
        password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
        confirmPassword: z.string().min(8, { message: 'Confirm password is required' }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

export default function RegisterForm() {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });
    const { setAuth } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        try {
            const response = await registerUser({
                email: data.email,
                password: data.password,
            });
            setAuth(response);
            router.push('/');
            router.refresh();
        } catch (error: any) {
            if (error.message.includes('Request failed with status code 400')) {
                setError('email', { message: 'User with such email already exists' });
            } else if (error.message.includes('Too many requests')) {
                setError('root', { message: 'Too many registration attempts. Please try again later.' });
            } else if (error.message.includes('Internal server error')) {
                setError('root', { message: 'Something went wrong, please try again later' });
            } else {
                setError('root', { message: error.message || 'Registration failed' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <h1 className={styles.title}>Sign Up</h1>

                <div className={styles.field}>
                    <label htmlFor="email" className={styles.label}>
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        {...register('email')}
                        className={styles.input}
                        placeholder="Enter your email"
                    />
                    {errors.email && <p className={styles.error}>{errors.email.message}</p>}
                </div>

                <div className={styles.field}>
                    <label htmlFor="password" className={styles.label}>
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        {...register('password')}
                        className={styles.input}
                        placeholder="Enter your password"
                    />
                    {errors.password && <p className={styles.error}>{errors.password.message}</p>}
                </div>

                <div className={styles.field}>
                    <label htmlFor="confirmPassword" className={styles.label}>
                        Confirm Password
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        {...register('confirmPassword')}
                        className={styles.input}
                        placeholder="Confirm your password"
                    />
                    {errors.confirmPassword && (
                        <p className={styles.error}>{errors.confirmPassword.message}</p>
                    )}
                </div>

                {errors.root && <p className={styles.error}>{errors.root.message}</p>}

                <button type="submit" className={styles.button} disabled={isLoading}>
                    {isLoading ? 'Signing Up...' : 'Sign Up'}
                </button>

                <Link href="/login" className={styles.link}>
                    Already have an account?
                </Link>
            </form>
        </div>
    );
}