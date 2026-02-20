import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { useGetDriverProfileQuery } from "../services/driverApi";
import { useState, useEffect } from "react";
import { Icons } from "./Icons";

const TopBar = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const isDriver = user?.role === "DRIVER";
    const { data: driverProfile } = useGetDriverProfileQuery(undefined, {
        skip: !isDriver,
        pollingInterval: 60000
    });

    const [timeLeft, setTimeLeft] = useState<string>("");
    const [isLow, setIsLow] = useState(false);

    useEffect(() => {
        if (!driverProfile?.shiftEnd) return;

        const timer = setInterval(() => {
            const end = new Date(driverProfile.shiftEnd).getTime();
            const now = new Date().getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft("SHIFT ENDED");
                setIsLow(true);
                clearInterval(timer);
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (hours === 0 && minutes < 30) {
                setIsLow(true);
            } else {
                setIsLow(false);
            }

            setTimeLeft(
                `${hours.toString().padStart(2, '0')}:${minutes
                    .toString()
                    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        }, 1000);

        return () => clearInterval(timer);
    }, [driverProfile]);

    return (
        <header className="h-24 bg-surface/60 backdrop-blur-2xl border-b border-border-subtle flex items-center justify-between px-10 sticky top-0 z-20 overflow-hidden">
            <div className="relative z-10 flex flex-col justify-center">
                <p className="text-[10px] font-black text-txt-muted uppercase tracking-[0.3em] mb-1">Operational Pulse</p>
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-txt-main tracking-tight leading-none truncate max-w-[200px] sm:max-w-none">
                        Greeting, <span className="text-primary">{user?.email?.split('@')[0]}</span>
                    </h2>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50 flex-shrink-0" />
                </div>
            </div>

            <div className="flex items-center gap-6 relative z-10">
                {isDriver && timeLeft && (
                    <div className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border transition-all animate-in fade-in slide-in-from-right-4 ${isLow
                        ? "bg-red-500/10 border-red-500/20 text-red-500 shadow-lg shadow-red-500/5"
                        : "bg-primary/5 border-primary/20 text-primary shadow-lg shadow-primary/5"
                        }`}>
                        <Icons.Clock className={`w-4 h-4 ${isLow ? "animate-pulse" : ""}`} />
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">Shift Timer</span>
                            <span className="text-sm font-black tracking-widest tabular-nums leading-none">
                                {timeLeft}
                            </span>
                        </div>
                    </div>
                )}

                <div className="hidden lg:flex items-center gap-4 px-5 py-2.5 bg-txt-main/5 rounded-xl border border-border-subtle/50 transition-all hover:bg-txt-main/10 active:scale-95 cursor-pointer">
                    <div className="relative flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute opacity-40" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative ring-4 ring-emerald-500/10" />
                    </div>
                    <span className="text-[10px] font-black text-txt-muted uppercase tracking-widest whitespace-nowrap">Secured Node</span>
                </div>

                <div className="h-10 w-px bg-border-subtle hidden sm:block" />

                <div className="group flex items-center gap-4 cursor-pointer hover:bg-txt-main/5 p-2 -m-2 rounded-2xl transition-all duration-300">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-black text-txt-main leading-none group-hover:text-primary transition-colors">{user?.email?.split('@')[0]}</p>
                        <p className="text-[9px] font-black text-txt-muted uppercase tracking-[0.2em] mt-1.5 opacity-60">
                            ID: {user?.role?.substring(0, 3)}-{Math.floor(Math.random() * 9000) + 1000}
                        </p>
                    </div>
                    <div className="relative">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 p-0.5 shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-3">
                            <div className="w-full h-full rounded-[0.6rem] bg-slate-900 flex items-center justify-center border border-white/10">
                                <span className="text-white font-black text-lg">{user?.email?.[0].toUpperCase()}</span>
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-surface shadow-sm" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopBar;
