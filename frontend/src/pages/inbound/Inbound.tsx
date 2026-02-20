import { useState } from "react";
import { useGetShipmentsQuery, useBlindReceiveMutation } from "../../services/shipmentApi";
import { Icons } from "../../components/Icons";
import Card from "../../components/Card";
import toast from "react-hot-toast";
import ManifestTable from "./components/ManifestTable";
import InboundForm from "./components/InboundForm";
import DiscrepancyList from "./components/DiscrepancyList";

const InboundPage = () => {
    const { data: shipments, isLoading } = useGetShipmentsQuery();
    const [blindReceive, { isLoading: isProcessing }] = useBlindReceiveMutation();

    const [selectedShipment, setSelectedShipment] = useState<string | null>(null);
    const [receiveForm, setReceiveForm] = useState({ actualSku: "", actualQuantity: 0 });

    const inboundShipments = shipments?.filter(s =>
        s.status === 'PENDING' || s.status === 'DISPATCHED' || s.status === 'IN_TRANSIT'
    ) || [];

    const handleReceive = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedShipment) return;

        try {
            await blindReceive({
                id: selectedShipment,
                actualSku: receiveForm.actualSku,
                actualQuantity: receiveForm.actualQuantity
            }).unwrap();

            toast.success("Shipment processed successfully");
            setSelectedShipment(null);
            setReceiveForm({ actualSku: "", actualQuantity: 0 });
        } catch {
            
        }
    };

    if (isLoading) return <div className="p-8 animate-pulse text-slate-400 font-black uppercase tracking-widest">Scanning Network...</div>;

    return (
        <div className="space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Inbound Receiving</h1>
                    <p className="text-slate-500 font-medium flex items-center gap-2">
                        <Icons.Package className="w-5 h-5 text-primary" />
                        Blind receiving & discrepancy reconciliation hub
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Incoming Manifests" className="p-8 border-none shadow-xl glass">
                        <ManifestTable
                            shipments={inboundShipments}
                            selectedShipment={selectedShipment}
                            onSelect={setSelectedShipment}
                        />
                    </Card>
                </div>

                <div className="space-y-8">
                    {selectedShipment ? (
                        <Card title="Blind Receipt Input" className="p-8 border-none shadow-2xl bg-slate-900 text-white relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-xs font-bold text-slate-400 mb-6">Enter what actually arrived. System will auto-calculate discrepancies.</p>
                                <InboundForm
                                    receiveForm={receiveForm}
                                    setReceiveForm={setReceiveForm}
                                    onSubmit={handleReceive}
                                    isProcessing={isProcessing}
                                />
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
                        </Card>
                    ) : (
                        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100 text-slate-300">
                                <Icons.Package className="w-8 h-8" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">No manifest selected</p>
                            <p className="text-xs font-bold text-slate-500">Pick an incoming shipment from the manifest list to begin processing.</p>
                        </div>
                    )}

                    <Card title="Discrepancy Alerts" className="p-8 border-none shadow-xl border border-slate-100">
                        <DiscrepancyList shipments={shipments || []} />
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default InboundPage;
