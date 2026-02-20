import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link, useNavigationType } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../../services/authApi";
import { setCredentials } from "../../store/reducers/authReducer";
import { Icons } from "../../components/Icons";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const navType = useNavigationType();
    const [login, { isLoading }] = useLoginMutation();

    useEffect(() => {
        if (navType === "POP") {
            navigate("/", { replace: true });
        }
    }, [navType, navigate]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            const result = await login(data).unwrap();

            dispatch(setCredentials({
                user: result.user,
                token: result.accessToken
            }));

            localStorage.setItem("refreshToken", result.refreshToken);
            navigate("/dashboard");
        } catch (err: unknown) {
            console.error("Login failed:", err);
        }
    };

    return (
        <div className="w-full">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-black text-txt-main mb-3 tracking-tighter">
                    Welcome Back
                </h1>
                <p className="text-sm text-txt-muted font-medium uppercase tracking-widest">Access your WAREFLOW Console</p>
            </div>

            <div className="p-10 rounded-[2.5rem] bg-white border border-border-subtle shadow-2xl shadow-slate-200/50">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                            Control Identity
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted group-focus-within:text-primary transition-colors">
                                <Icons.Users className="w-5 h-5" />
                            </div>
                            <input
                                type="email"
                                placeholder="name@company.com"
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-txt-main placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-sm"
                                {...register("email")}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-[10px] font-black text-red-500 mt-1 ml-1 uppercase tracking-tight">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                            Access Protocol
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted group-focus-within:text-primary transition-colors">
                                <Icons.Zap className="w-5 h-5" />
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-txt-main placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-sm"
                                {...register("password")}
                            />
                        </div>
                        {errors.password && (
                            <p className="text-[10px] font-black text-red-500 mt-1 ml-1 uppercase tracking-tight">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest pt-2">
                        <label className="flex items-center gap-2 text-txt-muted cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 rounded-lg border-slate-200 text-primary focus:ring-primary/20 transition-all cursor-pointer" />
                            <span className="group-hover:text-txt-main transition-colors">Keep Session</span>
                        </label>
                        <a href="#" className="text-primary hover:text-secondary transition-colors underline decoration-primary/20 underline-offset-4">Forgot Entry?</a>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-premium btn-primary py-5 text-xs shadow-xl shadow-primary/30 active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Authenticating...
                            </div>
                        ) : (
                            "Initiate Console Session"
                        )}
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-border-subtle text-center">
                    <p className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em]">
                        New Terminal User?{" "}
                        <Link to="/register" className="text-primary hover:text-secondary transition-colors underline decoration-primary/20 underline-offset-4">
                            Register now
                        </Link>
                    </p>
                </div>
            </div>

            <div className="mt-12 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border-subtle shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-black text-txt-muted uppercase tracking-[0.2em]">WAREFLOW Global Network v4.2</span>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
