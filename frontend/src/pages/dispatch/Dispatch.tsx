import { useState } from "react";
import { useGetDispatchesQuery, useAutoAssignDispatchMutation, useGroupShipmentsMutation, useAssignBatchMutation } from "../../services/dispatchApi";
import { useGetShipmentsQuery } from "../../services/shipmentApi";
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

    const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [assignmentError, setAssignmentError] = useState<string | null>(null);

    const pendingShipments = shipments?.filter(s =>
        (s.status === 'PACKED' || s.status === 'RECEIVED') && !s.assignedDriverId
    ) || [];

    const handleAutoAssign = async () => {
        try {
            const result = await autoAssign().unwrap();
            toast.success(result.message || "Auto-assignment completed successfully");
        } catch (err: unknown) {
            console.error("Operation failed", err);
            const errorMessage = (err as { data?: { message?: string } })?.data?.message || "Fleet auto-assignment failed. No eligible shipments or available drivers found.";
            toast.error(errorMessage);
        }
    };

    const handleExport = async () => {
        try {
            const authState = localStorage.getItem('authState');
            const token = authState ? JSON.parse(authState).accessToken : null;

            if (!token) {
                toast.error('You must be logged in to export reports');
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/export/dispatch-manifest`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(`Export failed: ${error.message || 'Unknown error'}`);
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'dispatch-manifest.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export dispatch manifest');
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
        setAssignmentError(null);
        try {
            const { batchId } = await groupShipments({ shipmentIds: selectedShipments }).unwrap();
            await assignBatch({ batchId, driverId }).unwrap();
            setIsModalOpen(false);
            setSelectedShipments([]);
        } catch (err: unknown) {
            console.error("Batch assignment failed", err);
            const errorMessage = (err as { data?: { message?: string } })?.data?.message || "Failed to assign batch. Check driver capacity.";
            setAssignmentError(errorMessage);
        }
    };

    const selectedShipmentObjects = pendingShipments?.filter(s => selectedShipments.includes(s._id)) || [];
    const targetZone = selectedShipmentObjects.length > 0 ? selectedShipmentObjects[0].zone : undefined;

    return (
        <div className="space-y-8">
            <AssignModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setAssignmentError(null);
                }}
                selectedCount={selectedShipments.length}
                onConfirm={handleBatchAssign}
                isLoading={isGrouping || isBatchAssigning}
                targetZone={targetZone}
                error={assignmentError}
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
                            <div className="h-full bg-primary" style={{ width: '94%' }} />
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
