import { useState } from "react";
import { useGetDispatchesQuery, useAutoAssignDispatchMutation, useGroupShipmentsMutation, useAssignBatchMutation } from "../../services/dispatchApi";
import { useGetShipmentsQuery } from "../../services/shipmentApi";
import { useExportDispatchManifestMutation } from "../../services/exportApi";
import AssignModal from "./AssignModal";
import DispatchHeader from "./components/DispatchHeader";
import PendingShipmentsTable from "./components/PendingShipmentsTable";
import ActiveDispatchesSection from "./components/ActiveDispatchesSection";
import toast from "react-hot-toast";

const DispatchPage = () => {
    const { data: dispatches, isLoading: isDispatchesLoading, error: dispatchesError } = useGetDispatchesQuery();
    const { data: shipments, isLoading: isShipmentsLoading } = useGetShipmentsQuery();

    const [autoAssign, { isLoading: isAutoAssigning }] = useAutoAssignDispatchMutation();
    const [groupShipments, { isLoading: isGrouping }] = useGroupShipmentsMutation();
    const [assignBatch, { isLoading: isBatchAssigning }] = useAssignBatchMutation();
    const [exportManifest] = useExportDispatchManifestMutation();

    const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const pendingShipments = shipments?.filter(s =>
        s.type === 'OUTBOUND' &&
        (s.status === 'PACKED' || s.status === 'RECEIVED' || s.status === 'PENDING') &&
        !s.assignedDriverId
    ) || [];

    const handleAutoAssign = async () => {
        try {
            const result = await autoAssign().unwrap();
            toast.success(result.message || "Auto-assignment completed successfully");
        } catch {

        }
    };

    const handleExport = async () => {
        try {
            const blob = await exportManifest().unwrap();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dispatch-manifest-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success("Dispatch manifest exported successfully");
        } catch (error) {
            console.error('Export error:', error);
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedShipments(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (selected: boolean) => {
        setSelectedShipments(selected ? pendingShipments.map(s => s._id) : []);
    };

    const handleBatchAssign = async (driverId: string) => {
        try {
            const { batchId } = await groupShipments({ shipmentIds: selectedShipments }).unwrap();
            await assignBatch({ batchId, driverId }).unwrap();
            toast.success("Batch assigned successfully");
            setIsModalOpen(false);
            setSelectedShipments([]);
        } catch (err: unknown) {
            console.error("Batch assignment failed", err);
        }
    };

    const selectedShipmentObjects = pendingShipments?.filter(s => selectedShipments.includes(s._id)) || [];
    const targetZone = selectedShipmentObjects.length > 0 ? selectedShipmentObjects[0].zone : undefined;

    return (
        <div className="space-y-8">
            <AssignModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedCount={selectedShipments.length}
                onConfirm={handleBatchAssign}
                isLoading={isGrouping || isBatchAssigning}
                targetZone={targetZone}
            />

            <DispatchHeader
                onExport={handleExport}
                onAutoAssign={handleAutoAssign}
                isAutoAssigning={isAutoAssigning}
            />

            {dispatches?.length && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Optimization Score</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">94<span className="text-primary text-sm">/100</span></p>
                        <div className="h-1 w-full bg-slate-100 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `94%` }} />
                        </div>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-all" />
                    </div>
                </div>
            )}

            <PendingShipmentsTable
                shipments={pendingShipments}
                selectedShipments={selectedShipments}
                isLoading={isShipmentsLoading}
                onToggleSelection={toggleSelection}
                onSelectAll={handleSelectAll}
                onAssignClick={() => setIsModalOpen(true)}
            />

            <ActiveDispatchesSection
                dispatches={dispatches}
                isLoading={isDispatchesLoading}
                error={!!dispatchesError}
            />
        </div>
    );
};

export default DispatchPage;
