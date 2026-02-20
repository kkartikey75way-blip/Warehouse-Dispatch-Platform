import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useVerifyEmailMutation } from "../../services/authApi";
import Card from "../../components/Card";
import { Icons } from "../../components/Icons";

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");
    const [verifyEmail, { isLoading, isSuccess }] = useVerifyEmailMutation();
    const [message, setMessage] = useState(token ? "Verifying your email..." : "No verification token found.");

    useEffect(() => {
        if (token) {
            verifyEmail(token)
                .unwrap()
                .then((res) => {
                    setMessage(res.message || "Email verified successfully! Redirecting to login...");
                    setTimeout(() => {
                        navigate("/login");
                    }, 3000);
                })
                .catch((err) => {
                    setMessage(err.data?.message || "Verification failed. The link may be invalid or expired.");
                });
        }
    }, [token, verifyEmail, navigate]);

    return (
        <div className="w-full">
            <Card className="w-full text-center p-10 shadow-2xl">
                <div className="mb-8 flex justify-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        {isLoading ? (
                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : isSuccess ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                        ) : (
                            <Icons.Dashboard className="w-10 h-10" />
                        )}
                    </div>
                </div>

                <h1 className="text-2xl font-black text-slate-900 mb-4">
                    {isLoading ? "Verifying..." : isSuccess ? "Success!" : "Verification Status"}
                </h1>

                <p className="text-slate-500 font-medium leading-relaxed mb-8">
                    {message}
                </p>

                {!isLoading && (
                    <Link
                        to="/login"
                        className="inline-flex items-center justify-center w-full py-4 bg-primary text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-all hover:-translate-y-1"
                    >
                        Go to Login
                    </Link>
                )}
            </Card>
        </div>
    );
};

export default VerifyEmail;
