import Button from "../../../components/Button";
import { Icons } from "../../../components/Icons";

interface DispatchHeaderProps {
    onExport: () => void;
    onAutoAssign: () => void;
    isAutoAssigning: boolean;
}

const DispatchHeader = ({ onExport, onAutoAssign, isAutoAssigning }: DispatchHeaderProps) => {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Dispatch Center</h1>
                <p className="text-slate-500 font-medium">Manage assignments and monitor dispatch status</p>
            </div>
            <div className="flex gap-4">
                <Button onClick={onExport} variant="secondary" className="px-6 py-2 uppercase tracking-widest text-[10px] font-black">
                    Export Manifest
                </Button>
                <Button onClick={onAutoAssign} isLoading={isAutoAssigning} className="flex items-center gap-2 shadow-xl shadow-primary/20">
                    <Icons.Zap />
                    Auto-Assign
                </Button>
            </div>
        </div>
    );
};

export default DispatchHeader;
