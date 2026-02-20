import { useGetWarehousesQuery, useGetConflictsQuery, useReconcileConflictMutation } from "../../services/warehouseApi";
import { Icons } from "../../components/Icons";
import Card from "../../components/Card";
import WarehouseGrid from "./components/WarehouseGrid";
import ConflictList from "./components/ConflictList";
import ReturnRoutingCard from "./components/ReturnRoutingCard";
import NewWarehouseModal from "./components/NewWarehouseModal";
import WarehouseInventoryModal from "./components/WarehouseInventoryModal";
import toast from "react-hot-toast";
import { useState } from "react";
import { useDeleteWarehouseMutation, type Warehouse } from "../../services/warehouseApi";

const WarehousesPage = () => {
    const { data: warehouses, isLoading: isLoadingWarehouses } = useGetWarehousesQuery();
    const { data: conflicts, isLoading: isLoadingConflicts } = useGetConflictsQuery();
    const [reconcile] = useReconcileConflictMutation();
    const [deleteWarehouse] = useDeleteWarehouseMutation();

    const [isAddingMode, setIsAddingMode] = useState(false);
    const [selectedWarehouseForInventory, setSelectedWarehouseForInventory] = useState<Warehouse | null>(null);

    const handleReconcile = async (conflictId: string) => {
        try {
            await reconcile({ conflictId, resolution: 'MANUAL_OVERRIDE' }).unwrap();
            toast.success("Conflict reconciled successfully");
        } catch {
            
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to decommission this node? All active inventory must be cleared first.")) return;
        try {
            await deleteWarehouse(id).unwrap();
            toast.success("Node decommissioned successfully");
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            toast.error(error?.data?.message || "Failed to decommission node");
        }
    };

    if (isLoadingWarehouses || isLoadingConflicts) return <div className="p-8 animate-pulse text-slate-400 font-black uppercase tracking-widest">Pinging Nodes...</div>;

    return (
        <div className="space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Global Network Awareness</h1>
                    <p className="text-slate-500 font-medium flex items-center gap-2">
                        <Icons.Globe className="w-5 h-5 text-primary" />
                        Real-time capacity & node health monitoring
                    </p>
                </div>
                <button
                    onClick={() => setIsAddingMode(true)}
                    className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Icons.Plus className="w-4 h-4" />
                    New Node
                </button>
            </div>

            <WarehouseGrid
                warehouses={warehouses || []}
                onDelete={handleDelete}
                onShowInventory={setSelectedWarehouseForInventory}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Conflict Reconciliation" className="p-8 border-none shadow-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">System detected inventory / routing discrepancies</p>
                    <ConflictList
                        conflicts={conflicts || []}
                        onReconcile={handleReconcile}
                    />
                </Card>

                <Card title="Smart Returns Routing" className="p-8 border-none shadow-xl border border-slate-100 bg-slate-900 text-white relative overflow-hidden">
                    <ReturnRoutingCard />
                </Card>
            </div>

            <NewWarehouseModal
                isOpen={isAddingMode}
                onClose={() => setIsAddingMode(false)}
            />

            {selectedWarehouseForInventory && (
                <WarehouseInventoryModal
                    isOpen={!!selectedWarehouseForInventory}
                    onClose={() => setSelectedWarehouseForInventory(null)}
                    warehouseCode={selectedWarehouseForInventory.code}
                    warehouseName={selectedWarehouseForInventory.name}
                />
            )}
        </div>
    );
};

export default WarehousesPage;
