import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateShipmentMutation } from "../../../services/shipmentApi";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import { Icons } from "../../../components/Icons";

const shipmentSchema = z.object({
    trackingId: z.string().min(1, "Tracking ID is required"),
    sku: z.string().min(1, "SKU is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    priority: z.enum(["STANDARD", "EXPRESS", "BULK"]),
    zone: z.string().min(1, "Zone is required"),
    origin: z.string().min(1, "Origin is required"),
    destination: z.string().min(1, "Destination is required"),
    weight: z.number().min(0.1, "Weight must be at least 0.1 kg"),
    volume: z.number().min(0.01, "Volume must be at least 0.01 m³")
});

type ShipmentFormData = z.infer<typeof shipmentSchema>;

interface NewShipmentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const NewShipmentModal = ({ isOpen, onClose }: NewShipmentModalProps) => {
    const [createShipment, { isLoading }] = useCreateShipmentMutation();
    const [isScanning, setIsScanning] = useState(false);
    const [type, setType] = useState<"INBOUND" | "OUTBOUND">("INBOUND");

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<ShipmentFormData>({
        resolver: zodResolver(shipmentSchema),
        defaultValues: {
            trackingId: "",
            sku: "",
            quantity: 1,
            priority: "STANDARD",
            zone: "",
            origin: "WAREHOUSE-MAIN",
            destination: "",
            weight: 1,
            volume: 1
        }
    });

    const handleSimulateScan = () => {
        setIsScanning(true);
        setTimeout(() => {
            const randomSKU = "SKU-" + Math.floor(1000 + Math.random() * 9000);
            const randomID = "TRK-" + Math.floor(100000 + Math.random() * 900000);
            setValue("sku", randomSKU);
            setValue("trackingId", randomID);
            setIsScanning(false);
        }, 1500);
    };

    const onSubmit = async (data: ShipmentFormData) => {
        try {
            await createShipment({
                ...data,
                type
            }).unwrap();
            import("react-hot-toast").then((m) => m.default.success("Shipment created successfully"));
            onClose();
        } catch (err: unknown) {
            console.error("Failed to create shipment:", err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <Card className="w-full max-w-lg p-8 glass shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Shipment</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <Icons.X />
                    </button>
                </div>

                <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
                    <button
                        type="button"
                        onClick={() => setType("INBOUND")}
                        className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${type === "INBOUND" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        Inbound
                    </button>
                    <button
                        type="button"
                        onClick={() => setType("OUTBOUND")}
                        className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${type === "OUTBOUND" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        Outbound
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <div className="relative group">
                                <Input
                                    label="Tracking ID"
                                    placeholder="TRK-XXXXXX"
                                    {...register("trackingId")}
                                    error={errors.trackingId?.message}
                                />
                                {type === "INBOUND" && (
                                    <button
                                        type="button"
                                        onClick={handleSimulateScan}
                                        className={`absolute right-2 top-8 p-1.5 rounded-lg transition-all ${isScanning ? "bg-primary text-white animate-pulse" : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-primary"}`}
                                        title="Simulate Barcode Scan"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><line x1="8" x2="8" y1="7" y2="17" /><line x1="12" x2="12" y1="7" y2="17" /><line x1="16" x2="16" y1="7" y2="17" /></svg>
                                    </button>
                                )}
                            </div>
                        </div>
                        <Input
                            label="SKU"
                            placeholder="SKU-XXXX"
                            {...register("sku")}
                            error={errors.sku?.message}
                        />
                        <Input
                            label="Quantity"
                            type="number"
                            {...register("quantity", { valueAsNumber: true })}
                            error={errors.quantity?.message}
                        />
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                            <select
                                {...register("priority")}
                                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-100 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all"
                            >
                                <option value="STANDARD">Standard</option>
                                <option value="EXPRESS">Express</option>
                                <option value="BULK">Bulk</option>
                            </select>
                            {errors.priority && <p className="text-[10px] font-black text-red-500 mt-1 ml-1 uppercase">{errors.priority.message}</p>}
                        </div>
                        <Input
                            label="Zone"
                            placeholder="A1, B2, etc."
                            {...register("zone")}
                            error={errors.zone?.message}
                        />
                        <Input
                            label="Origin"
                            {...register("origin")}
                            error={errors.origin?.message}
                        />
                        <Input
                            label="Destination"
                            placeholder="City, State"
                            {...register("destination")}
                            error={errors.destination?.message}
                        />
                        <Input
                            label="Weight (kg)"
                            type="number"
                            step="0.1"
                            {...register("weight", { valueAsNumber: true })}
                            error={errors.weight?.message}
                        />
                        <Input
                            label="Volume (m³)"
                            type="number"
                            step="0.01"
                            {...register("volume", { valueAsNumber: true })}
                            error={errors.volume?.message}
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" onClick={onClose} variant="secondary" className="flex-1 py-4 uppercase tracking-widest text-xs">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 py-4 uppercase tracking-widest text-xs shadow-xl shadow-primary/20" isLoading={isLoading}>
                            {type === "INBOUND" ? "Receive Shipment" : "Create Order"}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default NewShipmentModal;
