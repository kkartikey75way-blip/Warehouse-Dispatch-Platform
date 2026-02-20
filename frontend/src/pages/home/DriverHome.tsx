import { useState } from "react";
import { useGetDriversQuery, useUpdateDriverAvailabilityMutation, useDeleteDriverMutation } from "../../services/driverApi";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../store/reducers/authReducer";
import Card from "../../components/Card";
import ConfirmationModal from "../../components/ConfirmationModal";
import { Icons } from "../../components/Icons";

import type { User } from "../../store/reducers/authReducer";

const DriverHome = ({ user }: { user: User }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { data: drivers } = useGetDriversQuery();
    const [updateAvailability, { isLoading: isUpdating }] = useUpdateDriverAvailabilityMutation();
    const [deleteDriver, { isLoading: isDeleting }] = useDeleteDriverMutation();
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);


    const userId = user?.id || user?._id;
    const myDriver = drivers?.find(d => {
        const driverUserId = d.userId?._id || d.userId;
        return driverUserId === userId || driverUserId?.toString() === userId;
    });

    const handleToggle = async () => {
        if (!myDriver) return;
        try {
            await updateAvailability({ id: myDriver._id, isAvailable: !myDriver.isAvailable }).unwrap();
        } catch (err) {
            console.error("Failed to update availability", err);
        }
    };

    const handleDeleteClick = () => {
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!myDriver) return;
        try {
            await deleteDriver(myDriver._id).unwrap();
            setIsConfirmModalOpen(false);
            dispatch(logout());
            localStorage.removeItem("refreshToken");
            navigate("/login");
        } catch (err) {
            console.error("Failed to delete account", err);
        }
    };

    if (!myDriver) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-12 text-center bg-txt-main/5 rounded-[3.5rem] mt-8">
            <div className="w-24 h-24 rounded-[2rem] bg-amber-500/10 flex items-center justify-center text-amber-500 mb-8 border border-amber-500/20 shadow-2xl shadow-amber-500/10">
                <Icons.AlertCircle className="w-12 h-12" />
            </div>
            <h2 className="text-4xl font-black text-txt-main tracking-tight mb-4">Profile Synchronization Pending</h2>
            <p className="text-txt-muted text-lg max-w-md font-medium opacity-70">We couldn't locate your driver identity. Please notify operations to initialize your fleet credentials.</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-24">
            {}
            <div className="relative overflow-hidden rounded-[3.5rem] bg-slate-950 p-12 md:p-16 text-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] group">
                {}
                <div className="absolute right-0 top-0 w-2/3 h-full bg-gradient-to-l from-primary/10 via-transparent to-transparent opacity-40" />
                <div className="absolute -right-20 -top-20 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[140px] opacity-30 group-hover:opacity-50 transition-all duration-1000" />

                <div className="relative z-10 space-y-8">
                    <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
                        <div className="w-2 h-2 rounded-full bg-primary relative">
                            <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-50" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                            Active Session: Fleet-{Math.floor(Math.random() * 900) + 100}
                        </span>
                    </div>

                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 text-white">Welcome, <span className="text-gradient">{user.name?.split(' ')[0]}</span></h1>
                        <p className="text-slate-400 text-lg font-medium opacity-80">Infrastructure is online. Your next route is pending.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {}
                <Card className="p-12 border-none shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] glass relative overflow-hidden group">
                    <div className={`absolute -right-6 -top-6 w-40 h-40 rounded-full blur-[60px] opacity-10 transition-all duration-1000 ${myDriver.isAvailable ? 'bg-emerald-500' : 'bg-slate-500'}`} />

                    <div className="flex justify-between items-start mb-16 relative z-10">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-txt-muted uppercase tracking-[0.3em] opacity-60">System Identity</p>
                            <h3 className={`text-4xl font-black tracking-tighter tabular-nums ${myDriver.isAvailable ? "text-emerald-500" : "text-txt-muted"}`}>
                                {myDriver.isAvailable ? "ON DUTY" : "OFF DUTY"}
                            </h3>
                            <div className="flex items-center gap-3">
                                <span className={`w-3 h-3 rounded-full shadow-lg ${myDriver.isAvailable ? 'bg-emerald-500 shadow-emerald-500/50 animate-pulse' : 'bg-txt-main/10'}`} />
                                <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest opacity-60">Fleet Tracking Active</p>
                            </div>
                        </div>
                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-white shadow-2xl transition-all duration-700 group-hover:rotate-12 ${myDriver.isAvailable ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/20" : "bg-gradient-to-br from-slate-400 to-slate-600 shadow-slate-500/20"}`}>
                            <Icons.Truck className="w-10 h-10" />
                        </div>
                    </div>

                    <button
                        onClick={handleToggle}
                        disabled={isUpdating}
                        className={`btn-premium w-full flex items-center justify-center relative z-10 ${myDriver.isAvailable
                            ? "bg-txt-main/5 text-txt-main hover:bg-txt-main/10"
                            : "btn-primary"
                            }`}
                    >
                        {isUpdating ? (
                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : myDriver.isAvailable ? "Terminate Shift" : "Initiate System"}
                    </button>
                </Card>

                {}
                <Card className="p-8 border-none shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] glass relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-40 h-40 bg-indigo-500/10 rounded-full blur-[60px] group-hover:opacity-30 transition-all duration-1000" />

                    <div className="flex justify-between items-start mb-12 relative z-10">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-txt-muted uppercase tracking-[0.3em] opacity-60">Payload Metrics</p>
                            <div className="flex items-baseline gap-3">
                                <h3 className="text-5xl font-black text-txt-main tracking-tighter tabular-nums group-hover:text-primary transition-colors">
                                    {myDriver.currentLoad}
                                </h3>
                                <span className="text-lg font-black text-txt-muted opacity-40">/ {myDriver.capacity} kg</span>
                            </div>
                        </div>
                        <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20 transition-all duration-700 group-hover:-rotate-12">
                            <Icons.Package className="w-8 h-8" />
                        </div>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="relative h-3 w-full bg-txt-main/5 rounded-full overflow-hidden p-[2px] ring-1 ring-txt-main/5">
                            <div
                                className="bg-gradient-to-r from-indigo-500 via-primary to-blue-400 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_oklch(0.6_0.18_250/_0.4)]"
                                style={{ width: `${Math.min((myDriver.currentLoad / myDriver.capacity) * 100, 100)}%` }}
                            />
                        </div>
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] font-black text-txt-muted uppercase tracking-widest opacity-60">REMAINING: {myDriver.capacity - myDriver.currentLoad} kg</span>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${(myDriver.currentLoad / myDriver.capacity) > 0.85 ? 'bg-orange-500/10 text-orange-500' : 'bg-primary/10 text-primary'}`}>
                                {Math.round((myDriver.currentLoad / myDriver.capacity) * 100)}% LOADED
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <Link to="/deliveries" className="group">
                    <Card className="h-full bg-slate-900 text-white border-none shadow-2xl p-8 hover:shadow-primary/20 hover:-translate-y-2 transition-all duration-500 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-5 mb-5">
                                <div className="w-11 h-11 rounded-[1rem] bg-white/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                    <Icons.Package className="w-5 h-5" />
                                </div>
                                <h3 className="text-2xl font-black tracking-tight text-white">Assigned Routes</h3>
                            </div>
                            <p className="text-slate-400 font-medium mb-8 text-base">Access your active manifests and submit real-time Proof of Delivery.</p>
                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                                Launch Navigator
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-3 transition-transform"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </div>
                        </div>
                    </Card>
                </Link>

                <Link to="/notifications" className="group">
                    <Card className="h-full border-none shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] glass p-8 hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between min-h-[240px]">
                        <div>
                            <div className="flex items-center gap-5 mb-5">
                                <div className="w-11 h-11 rounded-[1rem] bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                                    <Icons.Dashboard className="w-5 h-5" />
                                </div>
                                <h3 className="text-2xl font-black text-txt-main tracking-tight">Alert Center</h3>
                            </div>
                            <p className="text-txt-muted font-medium mb-8 text-base opacity-80">Direct communications from dispatch regarding schedule adjustments.</p>
                        </div>
                        <div className="flex items-center gap-4 text-primary font-black text-[10px] uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all">
                            View Messages
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-3 transition-transform"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                        </div>
                    </Card>
                </Link>
            </div>

            {}
            <div className="pt-12">
                <Card className="border-red-500/20 bg-red-500/5 p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-2">
                    <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-xl font-black text-red-500 tracking-tight">Danger Zone</h3>
                        <p className="text-sm text-txt-muted font-medium opacity-70">Permanently decommission your driver identity and purge all associated fleet credentials.</p>
                    </div>
                    <button
                        onClick={handleDeleteClick}
                        disabled={isDeleting}
                        className="flex items-center gap-3 bg-red-500 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-2xl shadow-red-500/20 disabled:opacity-50"
                    >
                        {isDeleting ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                        )}
                        Decommission Identity
                    </button>
                </Card>
            </div>

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Decommission Account?"
                message="This will permanently delete your driver profile and your user account. You will lose access to the platform immediately."
                confirmText="Decommission Permanently"
                isLoading={isDeleting}
            />
        </div>
    );
};

export default DriverHome;
