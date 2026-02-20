import { Icons } from "../../../components/Icons";
import Card from "../../../components/Card";
import { type Warehouse } from "../../../services/warehouseApi";

interface WarehouseGridProps {
    warehouses: Warehouse[];
}

const WarehouseGrid = ({ warehouses }: WarehouseGridProps) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {warehouses.map((w) => (
                <Card key={w._id} className="p-6 border-none shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-2 h-full ${w.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                            <Icons.Package className="w-6 h-6" />
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${w.status === 'online' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {w.status}
                        </span>
                    </div>
                    <h3 className="font-black text-slate-900 text-lg mb-1">{w.name}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Node ID: {w.code}</p>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                <span className="text-slate-400">Utilization</span>
                                <span className="text-slate-900">{Math.round((w.currentLoad / w.capacity) * 100)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ${(w.currentLoad / w.capacity) > 0.9 ? 'bg-red-500' :
                                        (w.currentLoad / w.capacity) > 0.7 ? 'bg-amber-500' : 'bg-primary'
                                        }`}
                                    style={{ width: `${(w.currentLoad / w.capacity) * 100}%` }}
                                />
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span>Load: {w.currentLoad}</span>
                            <span>Cap: {w.capacity}</span>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default WarehouseGrid;
