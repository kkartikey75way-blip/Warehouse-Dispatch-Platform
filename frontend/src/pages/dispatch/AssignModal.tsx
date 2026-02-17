import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetDriversQuery } from "../../services/driverApi";
import Card from "../../components/Card";
import Button from "../../components/Button";

const assignSchema = z.object({
    driverId: z.string().min(1, "Please select a driver")
});

type AssignFormData = z.infer<typeof assignSchema>;

interface AssignModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCount: number;
    onConfirm: (driverId: string) => void;
    isLoading: boolean;
    targetZone?: string;
    error?: string | null;
}

const AssignModal = ({ isOpen, onClose, selectedCount, onConfirm, isLoading, targetZone, error }: AssignModalProps) => {
    const { data: drivers } = useGetDriversQuery();
    const [showAllZones, setShowAllZones] = useState(false);

    const { register, handleSubmit, formState: { errors }, watch } = useForm<AssignFormData>({
        resolver: zodResolver(assignSchema),
        defaultValues: {
            driverId: ""
        }
    });

    const selectedDriver = watch("driverId");

    const onSubmit = (data: AssignFormData) => {
        onConfirm(data.driverId);
    };

    if (!isOpen) return null;

    const availableDrivers = drivers?.filter(d =>
        d.isAvailable && (showAllZones || !targetZone || d.zone === targetZone)
    ) || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <Card className="w-full max-w-md p-8 glass shadow-2xl animate-in zoom-in-95 duration-300">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-4">Assign Batch</h2>
                <p className="text-slate-500 mb-6">Assign {selectedCount} shipments to a driver.</p>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="block text-sm font-bold text-slate-700">Select Driver</label>
                            <label className="flex items-center gap-2 text-xs font-medium text-slate-500 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showAllZones}
                                    onChange={(e) => setShowAllZones(e.target.checked)}
                                    className="rounded border-slate-300 text-primary focus:ring-primary"
                                />
                                Show all zones
                            </label>
                        </div>

                        <div className="space-y-1.5">
                            <select
                                {...register("driverId")}
                                className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-slate-600"
                            >
                                <option value="">-- Choose a driver {targetZone && !showAllZones ? `in ${targetZone}` : ''} --</option>
                                {availableDrivers.length === 0 && (
                                    <option disabled>No available drivers {targetZone && !showAllZones ? `in ${targetZone}` : ''}</option>
                                )}
                                {availableDrivers.map(driver => (
                                    <option key={driver._id} value={driver._id}>
                                        {driver.userId.name} ({driver.currentLoad}/{driver.capacity}kg - {driver.zone})
                                    </option>
                                ))}
                            </select>
                            {errors.driverId && <p className="text-[10px] font-black text-red-500 mt-1 ml-1 uppercase">{errors.driverId.message}</p>}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button type="button" onClick={onClose} variant="secondary" className="flex-1">Cancel</Button>
                        <Button
                            type="submit"
                            disabled={!selectedDriver || isLoading}
                            isLoading={isLoading}
                            className="flex-1 shadow-xl shadow-primary/20"
                        >
                            Assign
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default AssignModal;
