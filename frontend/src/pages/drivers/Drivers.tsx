import { useState } from "react";
import { useGetDriversQuery, useUpdateDriverAvailabilityMutation, useDeleteDriverMutation } from "../../services/driverApi";
import type { Driver } from "../../services/driverApi";
import { useAppSelector } from "../../store/hooks";
import Card from "../../components/Card";
import ShiftModal from "../../components/ShiftModal";
import ConfirmationModal from "../../components/ConfirmationModal";

const DriversPage = () => {
    const { user } = useAppSelector((state) => state.auth);
    const { data: drivers, isLoading, error } = useGetDriversQuery();
    const [updateAvailability] = useUpdateDriverAvailabilityMutation();
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [driverToDelete, setDriverToDelete] = useState<string | null>(null);

    const [deleteDriver] = useDeleteDriverMutation();

    const toggleAvailability = async (id: string, current: boolean) => {
        try {
            await updateAvailability({ id, isAvailable: !current }).unwrap();
        } catch (err) {
            console.error("Failed to update availability", err);
        }
    };

    const handleDeleteClick = (id: string) => {
        setDriverToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!driverToDelete) return;
        try {
            await deleteDriver(driverToDelete).unwrap();
            setIsDeleteModalOpen(false);
            setDriverToDelete(null);
        } catch (err) {
            console.error("Failed to delete driver", err);
        }
    };

    const handleEdit = (driver: Driver) => {
        setSelectedDriver(driver);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Fleet Management</h1>
                <p className="text-slate-500 font-medium">Manage driver status, capacity, and active zones</p>
            </div>

            {
                error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-bold flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                        Failed to load drivers. {(error as { data?: { message?: string } })?.data?.message || "Please check your connection."}
                    </div>
                )
            }

            <ShiftModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                driver={selectedDriver}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Purge Driver Identity?"
                message="This will permanently remove the driver and their associated user account from the platform. This action cannot be undone."
                confirmText="Terminate Permanently"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-64 rounded-3xl bg-white/50 animate-pulse border border-slate-100" />)
                ) : drivers?.map((driver) => {
                    const loadPercentage = Math.min((driver.currentLoad / driver.capacity) * 100, 100);
                    const isNearCapacity = loadPercentage > 85;

                    return (
                        <Card key={driver._id} className="group relative overflow-hidden p-0 border-none shadow-2xl shadow-slate-200/50 hover:-translate-y-2 transition-all duration-500 glass">
                            {}
                            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-20 transition-all duration-700 group-hover:scale-150 ${driver.isAvailable ? 'bg-emerald-500' : 'bg-red-500'}`} />

                            <div className="p-8 space-y-8 relative z-10">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4 items-center">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl ${driver.isAvailable ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-200' : 'bg-gradient-to-br from-slate-400 to-slate-600 shadow-slate-200'}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{driver.userId?.name || 'Unknown Driver'}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{driver.zone} Region</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <button
                                            onClick={() => toggleAvailability(driver._id, driver.isAvailable)}
                                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${driver.isAvailable
                                                ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 hover:bg-emerald-500 hover:text-white hover:shadow-lg hover:shadow-emerald-200'
                                                : 'bg-red-50 text-red-600 ring-1 ring-red-100 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-200'
                                                }`}
                                        >
                                            {driver.isAvailable ? 'Available' : 'Busy'}
                                        </button>
                                        {(user?.role === 'ADMIN' || user?.role === 'WAREHOUSE_MANAGER') && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(driver)}
                                                    className="p-2 text-slate-400 hover:text-primary transition-colors hover:scale-110 active:scale-95"
                                                    title="Edit Settings"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(driver._id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 transition-colors hover:scale-110 active:scale-95"
                                                    title="Delete Driver"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-end justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Payload</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className={`text-2xl font-black tracking-tight ${isNearCapacity ? 'text-orange-600' : 'text-slate-900'}`}>{driver.currentLoad}</span>
                                                <span className="text-xs font-bold text-slate-400">/ {driver.capacity} kg</span>
                                            </div>
                                        </div>
                                        <div className={`text-[10px] font-black px-2 py-1 rounded-lg ${isNearCapacity ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {Math.round(loadPercentage)}% LOADED
                                        </div>
                                    </div>

                                    <div className="h-3 w-full bg-slate-100/50 rounded-full overflow-hidden p-0.5 border border-slate-100 ring-2 ring-transparent group-hover:ring-slate-50 transition-all">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ease-out relative ${isNearCapacity ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-gradient-to-r from-blue-400 to-indigo-600'}`}
                                            style={{ width: `${loadPercentage}%` }}
                                        >
                                            {isNearCapacity && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Shift Ends</p>
                                            <p className="text-[10px] font-black text-slate-800">{new Date(driver.shiftEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div >
    );
};

export default DriversPage;
