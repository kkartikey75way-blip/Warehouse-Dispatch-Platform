import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../../services/authApi";
import { setCredentials } from "../../store/reducers/authReducer";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Card from "../../components/Card";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [login, { isLoading }] = useLoginMutation();
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (searchParams.get("verified") === "true") {
            setSuccessMessage("Email verified successfully! You can now log in.");
        }
        const errorType = searchParams.get("error");
        if (errorType === "verification_failed") {
            setError("Email verification failed. The link may be expired.");
        } else if (errorType === "token_required") {
            setError("Verification token is missing.");
        }
    }, [searchParams]);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            setError(null);
            const result = await login(data).unwrap();

            dispatch(setCredentials({
                user: result.user,
                token: result.accessToken
            }));

            localStorage.setItem("refreshToken", result.refreshToken);
            navigate("/");
        } catch (err: unknown) {
            setError("Invalid credentials or server error. Please try again.");
            console.error("Login failed:", err);
        }
    };

    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-black text-slate-900 mb-2">Welcome Back</h1>
                <p className="text-slate-500 font-medium">Log in to manage your warehouse operations</p>
            </div>

            <Card className="glass shadow-2xl p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                            {successMessage}
                        </div>
                    )}

                    <Input
                        label="Email Address"
                        placeholder="name@company.com"
                        error={errors.email?.message}
                        {...register("email")}
                    />

                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        error={errors.password?.message}
                        {...register("password")}
                    />

                    <div className="flex items-center justify-between text-sm mt-1">
                        <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20" />
                            Remember me
                        </label>
                        <a href="#" className="text-primary font-bold hover:underline">Forgot password?</a>
                    </div>

                    <Button type="submit" isLoading={isLoading} className="w-full mt-2">
                        Sign In
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-sm text-slate-500 font-medium">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-primary font-bold hover:underline">Register now</Link>
                    </p>
                </div>
            </Card>

            <div className="mt-12 text-center">
                <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">
                    Trusted by 500+ Fulfillment Centers
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
