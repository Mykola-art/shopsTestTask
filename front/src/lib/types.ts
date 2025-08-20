export interface AuthFormData {
    email: string;
    password: string;
    confirmPassword?: string; // Only for Register
}