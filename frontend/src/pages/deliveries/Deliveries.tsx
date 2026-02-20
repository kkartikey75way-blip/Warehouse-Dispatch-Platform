import { useState } from "react";
import { useGetShipmentsQuery } from "../../services/shipmentApi";
import { useGetDriversQuery } from "../../services/driverApi";
import { useStartDeliveryMutation, useCompleteDeliveryMutation, useReportExceptionMutation } from "../../services/deliveryApi";
import { useAcceptShipmentMutation } from "../../services/shipmentApi";
import Card from "../../components/Card";
import PoDComponent from "../../components/PoDComponent";
import { useAppSelector } from "../../store/hooks";
import DeliveriesHeader from "./components/DeliveriesHeader";
import DeliveryCard from "./components/DeliveryCard";
import toast from "react-hot-toast";
import { Icons } from "../../components/Icons";

const DeliveriesPage = () => {
    const { user } = useAppSelector((state) => state.auth);
    const { data: shipments, isLoading } = useGetShipmentsQuery();
    const [startDelivery, { isLoading: isStarting }] = useStartDeliveryMutation();
    const [completeDelivery] = useCompleteDeliveryMutation();
    const [reportException] = useReportExceptionMutation();
    const [acceptShipment, { isLoading: isAccepting }] = useAcceptShipmentMutation();

    const [activePoD, setActivePoD] = useState<string | null>(null);

    const { data: drivers } = useGetDriversQuery();

    const userId = user?.id || user?._id;
    const currentDriver = drivers?.find(d => {
        const driverUserId = d.userId?._id || d.userId;
        return driverUserId === userId || driverUserId?.toString() === userId;
    });

    const myShipments = shipments?.filter(s => {
        if (user?.role === 'DRIVER') {
            const isAssignedToMe = String(s.assignedDriverId) === String(currentDriver?._id);
            const isInboundPending = s.type === 'INBOUND' && s.status === 'PENDING';
            return (s.status === "DISPATCHED" || s.status === "IN_TRANSIT" || s.status === "DELIVERED" || isInboundPending) && isAssignedToMe;
        }
        return s.status === "DISPATCHED" || s.status === "IN_TRANSIT" || s.status === "DELIVERED";
    });

    const handleAccept = async (shipmentId: string) => {
        if (!currentDriver?._id) {
            console.error("No driver profile found for current user");
            toast.error("Error: No driver profile found. Please contact support.");
            return;
        }
        try {
            await acceptShipment({ shipmentId, driverId: currentDriver._id }).unwrap();
        } catch {
            
        }
    };

    const handleStart = async (shipmentId: string) => {
        if (!currentDriver?._id) {
            console.error("No driver profile found for current user");
            return;
        }
        try {
            await startDelivery({ shipmentId, driverId: currentDriver._id }).unwrap();
        } catch (err) {
            console.error("Start failed", err);
        }
    };

    const handlePoDComplete = async (proof: { signatureUrl: string; photoUrl: string }) => {
        if (!activePoD) return;
        try {
            await completeDelivery({
                shipmentId: activePoD,
                ...proof
            }).unwrap();
            setActivePoD(null);
            toast.success("Delivery completed successfully");
        } catch {
            
        }
    };

    const handleException = async (shipmentId: string) => {
        const reason = prompt("Enter reason for exception (e.g. DAMAGED, REFUSED):");
        if (reason) {
            try {
                await reportException({ shipmentId, exception: reason.toUpperCase() }).unwrap();
            } catch (err) {
                console.error("Report failed", err);
            }
        }
    };

    return (
        <div className="space-y-12 pb-20">
            <DeliveriesHeader userRole={user?.role || ''} />

            {activePoD && (
                <PoDComponent
                    onComplete={handlePoDComplete}
                    onCancel={() => setActivePoD(null)}
                />
            )}

            <div className="grid grid-cols-1 gap-8">
                {isLoading ? (
                    [1, 2].map(i => <div key={i} className="h-48 bg-white rounded-[2rem] animate-pulse shadow-2xl shadow-slate-200/50 glass" />)
                ) : myShipments?.length === 0 ? (
                    <Card className="p-32 text-center flex flex-col items-center justify-center border-none shadow-2xl shadow-slate-200/50 glass">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                            <Icons.Package className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Queue Clear</h3>
                        <p className="text-xs text-slate-400 font-medium">No active dispatches assigned to your profile</p>
                    </Card>
                ) : (
                    myShipments?.map((s) => (
                        <DeliveryCard
                            key={s._id}
                            shipment={s}
                            onAccept={handleAccept}
                            onStart={handleStart}
                            onFinish={setActivePoD}
                            onReportIssue={handleException}
                            isAccepting={isAccepting}
                            isStarting={isStarting}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default DeliveriesPage;
