import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateDriverMutation } from "../services/driverApi";
import type { Driver } from "../services/driverApi";
import Card from "./Card";
import Button from "./Button";
import Input from "./Input";
import { useEffect } from "react";

const shiftSchema = z.object({
    zone: z.string().min(1, "Zone is required"),
    capacity: z.number().min(1, "Capacity must be greater than 0"),
    shiftStart: z.string().min(1, "Start time is required"),
    shiftEnd: z.string().min(1, "End time is required")
});

type ShiftFormData = z.infer<typeof shiftSchema>;

interface ShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    driver: Driver | null;
}

const ShiftModal = ({ isOpen, onClose, driver }: ShiftModalProps) => {
    const [updateDriver, { isLoading }] = useUpdateDriverMutation();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ShiftFormData>({
        resolver: zodResolver(shiftSchema)
    });

    useEffect(() => {
        if (driver) {
            reset({
                zone: driver.zone,
                capacity: driver.capacity,
                shiftStart: new Date(driver.shiftStart).toISOString().slice(0, 16),
                shiftEnd: new Date(driver.shiftEnd).toISOString().slice(0, 16)
            });
        }
    }, [driver, reset]);

    const onSubmit = async (data: ShiftFormData) => {
        if (!driver) return;
        try {
            await updateDriver({
                id: driver._id,
                ...data
            }).unwrap();
            onClose();
        } catch (err) {
            console.error("Failed to update driver", err);
        }
    };

    if (!isOpen || !driver) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <Card className="w-full max-w-md p-8 glass shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Roster: {driver.userId.name}</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                        label="Active Zone"
                        {...register("zone")}
                        error={errors.zone?.message}
                    />
                    <Input
                        label="Capacity (kg)"
                        type="number"
                        {...register("capacity", { valueAsNumber: true })}
                        error={errors.capacity?.message}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Shift Start"
                            type="datetime-local"
                            {...register("shiftStart")}
                            error={errors.shiftStart?.message}
                        />
                        <Input
                            label="Shift End"
                            type="datetime-local"
                            {...register("shiftEnd")}
                            error={errors.shiftEnd?.message}
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" onClick={onClose} variant="secondary" className="flex-1 py-4 uppercase tracking-widest text-xs">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 py-4 uppercase tracking-widest text-xs shadow-xl shadow-primary/20" isLoading={isLoading}>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default ShiftModal;
