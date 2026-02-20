import { useState, useMemo } from "react";
import { useGetShipmentsQuery, useUpdateShipmentStatusMutation } from "../../services/shipmentApi";
import { useAppSelector } from "../../store/hooks";
import Card from "../../components/Card";
import StatusBadge from "../../components/StatusBadge";
import { Icons } from "../../components/Icons";
import { ShipmentStatus } from "../../constants/shipmentStatus";
import ShipmentsHeader from "./components/ShipmentsHeader";
import NewShipmentModal from "./components/NewShipmentModal";
import ShipmentDetailsModal from "./components/ShipmentDetailsModal";
import BlindReceiveModal from "./components/BlindReceiveModal";
import type { Shipment } from "../../types";

const ShipmentsPage = () => {
    const { data: shipments, isLoading } = useGetShipmentsQuery();
    const [updateStatus] = useUpdateShipmentStatusMutation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
    const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const { user } = useAppSelector((state) => state.auth);

    const handleDetailsClick = (shipment: Shipment) => {
        setSelectedShipment(shipment);
        setIsDetailsModalOpen(true);
    };

    const handleReceiveClick = (shipment: Shipment) => {
        setSelectedShipment(shipment);
        setIsReceiveModalOpen(true);
    };

    const filteredShipments = useMemo(() => {
        return shipments?.filter((s) => {
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                s.trackingId.toLowerCase().includes(query) ||
                s.sku.toLowerCase().includes(query) ||
                s.zone.toLowerCase().includes(query);

            const matchesStatus = filterStatus === "ALL" || s.status === filterStatus;

            return matchesSearch && matchesStatus;
        });
    }, [shipments, searchQuery, filterStatus]);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "EXPRESS": return "text-red-500";
            case "STANDARD": return "text-blue-500";
            default: return "text-slate-500";
        }
    };

    return (
        <div className="space-y-8">
            <ShipmentsHeader
                showNewButton={user?.role === 'ADMIN' || user?.role === 'WAREHOUSE_MANAGER'}
                onNewClick={() => setIsModalOpen(true)}
            />

            <NewShipmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <ShipmentDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                shipment={selectedShipment}
            />
            <BlindReceiveModal
                isOpen={isReceiveModalOpen}
                onClose={() => setIsReceiveModalOpen(false)}
                shipment={selectedShipment}
            />

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Icons.Search />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by Tracking ID, SKU, or Zone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 pb-3.5 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium text-slate-700"
                    />
                </div>
                <div className="relative">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="appearance-none pl-4 pr-10 py-3 pb-3.5 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium text-slate-700 cursor-pointer min-w-[140px]"
                    >
                        <option value="ALL">All Status</option>
                        {Object.values(ShipmentStatus).map((status) => (
                            <option key={status} value={status}>
                                {status.charAt(0) + status.slice(1).toLowerCase()}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Icons.Filter />
                    </div>
                </div>
            </div>

            <Card className="p-0 overflow-hidden border-none shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th>Tracking ID</th>
                                <th>SKU</th>
                                <th>Qty</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle/10">
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map((i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-full" /></td>
                                    </tr>
                                ))
                            ) : filteredShipments?.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No shipments found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredShipments?.map((s) => (
                                    <tr key={s._id} className="hover:bg-primary/[0.02] transition-colors group">
                                        <td>
                                            <span className="text-sm font-bold font-mono tracking-tight group-hover:text-primary transition-colors">{s.trackingId}</span>
                                        </td>
                                        <td>
                                            <span className="text-xs font-bold font-mono opacity-60">{s.sku}</span>
                                        </td>
                                        <td>
                                            <span className="text-sm font-black">{s.quantity}</span>
                                        </td>
                                        <td>
                                            <StatusBadge status={s.status} />
                                        </td>
                                        <td>
                                            <span className={`text-[10px] font-black ${getPriorityColor(s.priority)} uppercase tracking-tight`}>
                                                {s.priority}
                                            </span>
                                        </td>
                                        <td className="text-right flex items-center justify-end gap-3">
                                            {s.status === "PENDING" && s.type === "INBOUND" && (user?.role === 'ADMIN' || user?.role === 'WAREHOUSE_MANAGER') && (
                                                <button
                                                    onClick={() => handleReceiveClick(s)}
                                                    className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-all uppercase tracking-widest"
                                                >
                                                    Receive
                                                </button>
                                            )}
                                            {(user?.role === 'ADMIN' || user?.role === 'WAREHOUSE_MANAGER') && (
                                                <select
                                                    value={s.status}
                                                    onChange={(e) => updateStatus({ id: s._id, status: e.target.value })}
                                                    className="text-[10px] font-black bg-surface-elevated border-none rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-primary/20"
                                                >
                                                    {(Object.values(ShipmentStatus) as string[]).map(status => (
                                                        <option key={status} value={status}>{status}</option>
                                                    ))}
                                                </select>
                                            )}
                                            <button
                                                onClick={() => handleDetailsClick(s)}
                                                className="text-xs font-black opacity-40 hover:opacity-100 hover:text-primary uppercase tracking-tighter transition-all"
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default ShipmentsPage;
