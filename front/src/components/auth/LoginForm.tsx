'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './LoginForm.module.scss';
import { AuthFormData } from '@/lib/types';
import { loginUser } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

const loginSchema = z.object({
    email: z.string().email({ message: 'Invalid email format' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
});

export default function LoginForm() {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<AuthFormData>({
        resolver: zodResolver(loginSchema),
    });
    const { setAuth } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: AuthFormData) => {
        setIsLoading(true);
        try {
            const response = await loginUser(data);
            setAuth(response);
            router.push('/');
            router.refresh();
        } catch (error: any) {
            if (error.message.includes('Too many requests')) {
                setError('root', { message: 'Too many login attempts. Please try again later.' });
            } else {
                setError('root', { message: error.message || 'Login failed' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <h1 className={styles.title}>Login</h1>

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

                {errors.root && <p className={styles.error}>{errors.root.message}</p>}

                <button type="submit" className={styles.button} disabled={isLoading}>
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </button>

                <Link href="/register" className={styles.link}>
                    Don&apos;t have an account?
                </Link>
            </form>
        </div>
    );
}