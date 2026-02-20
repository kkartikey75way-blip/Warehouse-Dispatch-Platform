import { useState } from "react";
import { useBlindReceiveMutation } from "../../../services/shipmentApi";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import { Icons } from "../../../components/Icons";
import type { Shipment } from "../../../types";
import { toast } from "react-hot-toast";

interface BlindReceiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    shipment: Shipment | null;
}

const BlindReceiveModal = ({ isOpen, onClose, shipment }: BlindReceiveModalProps) => {
    const [blindReceive, { isLoading }] = useBlindReceiveMutation();
    const [actualSku, setActualSku] = useState("");
    const [actualQuantity, setActualQuantity] = useState<number | "">("");

    if (!isOpen || !shipment) return null;

    const handleReceive = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!actualSku || !actualQuantity) {
            toast.error("Please fill in all fields");
            return;
        }

        try {
            const result = await blindReceive({
                id: shipment._id,
                actualSku,
                actualQuantity: Number(actualQuantity)
            }).unwrap();

            if (result.status === "DISPUTED") {
                toast.error("Shipment DISPUTED due to discrepancy!", { duration: 5000 });
            } else {
                toast.success("Shipment received successfully");
            }
            onClose();
        } catch {
            
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <Card className="w-full max-w-md p-8 glass shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Blind Receiving</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">PO: {shipment.trackingId}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <Icons.X />
                    </button>
                </div>

                <div className="mb-8 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Security Protocol</p>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed">
                        Please enter the actual values observed from the physical shipment. Discrepancies will be automatically flagged.
                    </p>
                </div>

                <form onSubmit={handleReceive} className="space-y-6">
                    <div className="space-y-4">
                        <Input
                            label="Actual SKU observed"
                            placeholder="Enter SKU from label"
                            value={actualSku}
                            onChange={(e) => setActualSku(e.target.value)}
                            required
                        />
                        <Input
                            label="Actual Quantity observed"
                            type="number"
                            placeholder="Count of units"
                            value={actualQuantity}
                            onChange={(e) => setActualQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                            required
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" onClick={onClose} variant="secondary" className="flex-1 py-4 uppercase tracking-widest text-xs">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 py-4 uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
                            isLoading={isLoading}
                        >
                            Verify & Receive
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default BlindReceiveModal;
