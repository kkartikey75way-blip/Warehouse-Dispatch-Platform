import { useGetWarehousesQuery, useGetConflictsQuery, useReconcileConflictMutation } from "../../services/warehouseApi";
import { Icons } from "../../components/Icons";
import Card from "../../components/Card";
import WarehouseGrid from "./components/WarehouseGrid";
import ConflictList from "./components/ConflictList";
import ReturnRoutingCard from "./components/ReturnRoutingCard";
import toast from "react-hot-toast";

const WarehousesPage = () => {
    const { data: warehouses, isLoading: isLoadingWarehouses } = useGetWarehousesQuery();
    const { data: conflicts, isLoading: isLoadingConflicts } = useGetConflictsQuery();
    const [reconcile] = useReconcileConflictMutation();

    const handleReconcile = async (conflictId: string) => {
        try {
            await reconcile({ conflictId, resolution: 'MANUAL_OVERRIDE' }).unwrap();
            toast.success("Conflict reconciled successfully");
        } catch {
            // Error handled globally by baseApi
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
            </div>

            <WarehouseGrid warehouses={warehouses || []} />

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
        </div>
    );
};

export default WarehousesPage;
