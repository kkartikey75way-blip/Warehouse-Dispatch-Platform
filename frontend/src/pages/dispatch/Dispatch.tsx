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
