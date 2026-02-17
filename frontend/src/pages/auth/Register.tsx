import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../../services/authApi";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Card from "../../components/Card";

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["ADMIN", "DISPATCHER", "DRIVER", "WAREHOUSE_MANAGER"], {
        message: "Please select a valid role"
    }),
    zone: z.string().min(1, "Zone is required"),
    shift: z.enum(["MORNING", "AFTERNOON", "NIGHT"]).optional()
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage = () => {
    const navigate = useNavigate();
    const [register, { isLoading }] = useRegisterMutation();
    const [isRegistered, setIsRegistered] = useState(false);

    const { register: registerField, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema)
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            await register(data).unwrap();
            setIsRegistered(true);
        } catch (err: unknown) {
            console.error("Registration failed:", err);
        }
    };

    if (isRegistered) {
        return (
            <div className="w-full">
                <Card className="w-full p-10 text-center glass animate-fade-in shadow-2xl">
                    <div className="mb-8 flex justify-center">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.5 0 4 2 4 4.5V17z" /><path d="m2 9.5 10 6 10-6" /></svg>
                        </div>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Check your email</h1>
                    <p className="text-slate-500 font-medium leading-relaxed mb-8">
                        We've sent a verification link to your email address. Please click the link to activate your account.
                    </p>
                    <button
                        onClick={() => navigate("/login")}
                        className="inline-flex items-center justify-center w-full py-4 bg-primary text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-all hover:-translate-y-1"
                    >
                        Go to Sign In
                    </button>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full">
            <Card className="w-full p-8 glass animate-fade-in shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 italic">WAREHOUSE</h1>
                    <p className="text-slate-500 font-medium">Create your operative account</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                        label="Full Name"
                        placeholder="John Doe"
                        {...registerField("name")}
                        error={errors.name?.message}
                    />
                    <Input
                        label="Email Address"
                        placeholder="john@warehouse.com"
                        {...registerField("email")}
                        error={errors.email?.message}
                    />
                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        {...registerField("password")}
                        error={errors.password?.message}
                    />

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Role</label>
                        <select
                            {...registerField("role")}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-100 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all"
                        >
                            <option value="">Select Role</option>
                            <option value="ADMIN">Administrator</option>
                            <option value="DISPATCHER">Dispatcher</option>
                            <option value="DRIVER">Driver</option>
                            <option value="WAREHOUSE_MANAGER">Warehouse Manager</option>
                        </select>
                        {errors.role && <p className="text-[10px] font-black text-red-500 mt-1 ml-1 uppercase">{errors.role.message}</p>}
                    </div>

                    <Input
                        label="Assigned Zone"
                        placeholder="e.g. Zone-A, North-WH"
                        {...registerField("zone")}
                        error={errors.zone?.message}
                    />

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Working Shift</label>
                        <select
                            {...registerField("shift")}
                            className={`w-full p-3 rounded-xl border ${errors.shift ? 'border-red-500' : 'border-slate-200'} bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-slate-600`}
                        >
                            <option value="MORNING">Morning (06:00 - 14:00)</option>
                            <option value="AFTERNOON">Afternoon (14:00 - 22:00)</option>
                            <option value="NIGHT">Night (22:00 - 06:00)</option>
                        </select>
                        {errors.shift && <p className="text-[10px] font-black text-red-500 mt-1 ml-1 uppercase">{errors.shift.message}</p>}
                    </div>

                    <Button type="submit" className="w-full py-4 text-sm tracking-widest" isLoading={isLoading}>
                        CREATE ACCOUNT
                    </Button>
                </form>

                <div className="mt-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Already an operative? <Link to="/login" className="text-primary hover:underline">Sign In</Link>
                </div>
            </Card>
        </div>
    );
};

export default RegisterPage;
