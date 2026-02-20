import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateWarehouseMutation } from "../../../services/warehouseApi";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import { Icons } from "../../../components/Icons";
import toast from "react-hot-toast";

const warehouseSchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z.string().min(1, "Code is required").toUpperCase(),
    location: z.string().min(1, "Location is required"),
    zone: z.string().min(1, "Zone is required"),
    totalCapacity: z.number().min(1, "Capacity must be at least 1")
});

type WarehouseFormData = z.infer<typeof warehouseSchema>;

interface NewWarehouseModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const NewWarehouseModal = ({ isOpen, onClose }: NewWarehouseModalProps) => {
    const [createWarehouse, { isLoading }] = useCreateWarehouseMutation();

    const { register, handleSubmit, formState: { errors } } = useForm<WarehouseFormData>({
        resolver: zodResolver(warehouseSchema),
        defaultValues: {
            name: "",
            code: "",
            location: "",
            zone: "",
            totalCapacity: 10000
        }
    });

    const onSubmit = async (data: WarehouseFormData) => {
        try {
            await createWarehouse(data).unwrap();
            toast.success("Warehouse created successfully");
            onClose();
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            toast.error(error?.data?.message || "Failed to create warehouse");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <Card className="w-full max-w-lg p-8 glass shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Terminal Node</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <Icons.X />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <Input
                                label="Warehouse Name"
                                {...register("name")}
                                error={errors.name?.message}
                            />
                        </div>
                        <Input
                            label="Code (Unique)"
                            placeholder="WH-XXX"
                            {...register("code")}
                            error={errors.code?.message}
                        />
                        <Input
                            label="Operational Zone"
                            placeholder="Zone-X"
                            {...register("zone")}
                            error={errors.zone?.message}
                        />
                        <div className="col-span-2">
                            <Input
                                label="Location Address"
                                {...register("location")}
                                error={errors.location?.message}
                            />
                        </div>
                        <div className="col-span-2">
                            <Input
                                label="Total Capacity (units)"
                                type="number"
                                {...register("totalCapacity", { valueAsNumber: true })}
                                error={errors.totalCapacity?.message}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" onClick={onClose} variant="secondary" className="flex-1 py-4 uppercase tracking-widest text-xs">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 py-4 uppercase tracking-widest text-xs shadow-xl shadow-primary/20" isLoading={isLoading}>
                            Initialize Node
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default NewWarehouseModal;
