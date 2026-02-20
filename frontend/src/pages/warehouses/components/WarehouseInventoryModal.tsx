import { useGetWarehouseInventoryQuery } from "../../../services/warehouseApi";
import Card from "../../../components/Card";
import { Icons } from "../../../components/Icons";

interface WarehouseInventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    warehouseCode: string;
    warehouseName: string;
}

const WarehouseInventoryModal = ({ isOpen, onClose, warehouseCode, warehouseName }: WarehouseInventoryModalProps) => {
    const { data: inventory, isLoading } = useGetWarehouseInventoryQuery(warehouseCode, { skip: !isOpen });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <Card className="w-full max-w-2xl p-8 glass shadow-2xl animate-in zoom-in-95 duration-300 max-h-[80vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Stock Ledger</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Node: {warehouseName} ({warehouseCode})</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <Icons.X />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 -mx-8 px-8">
                    {isLoading ? (
                        <div className="py-20 text-center animate-pulse">
                            <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Querying Inventory Grid...</p>
                        </div>
                    ) : !inventory || inventory.length === 0 ? (
                        <div className="py-20 text-center border-2 border-dashed border-slate-50 rounded-3xl bg-slate-50/30">
                            <Icons.Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No stock detected at this node</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-slate-50">
                                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU Identifier</th>
                                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">On Hand</th>
                                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reserved</th>
                                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Available</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {inventory.map((item) => (
                                    <tr key={item._id} className="group transition-colors hover:bg-slate-50/50">
                                        <td className="py-4">
                                            <span className="text-xs font-black font-mono text-slate-900">{item.sku}</span>
                                        </td>
                                        <td className="py-4">
                                            <span className="text-xs font-bold text-slate-600">{item.onHand}</span>
                                        </td>
                                        <td className="py-4">
                                            <span className="text-xs font-bold text-amber-600">{item.reserved}</span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <span className="px-2 py-1 bg-primary/5 text-primary text-[10px] font-black rounded-lg">
                                                {item.onHand - item.reserved}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default WarehouseInventoryModal;
