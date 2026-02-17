import Button from "../../../components/Button";
import { Icons } from "../../../components/Icons";

interface ShipmentsHeaderProps {
    showNewButton: boolean;
    onNewClick: () => void;
}

const ShipmentsHeader = ({ showNewButton, onNewClick }: ShipmentsHeaderProps) => {
    const handleExport = async () => {
        try {
            const authState = localStorage.getItem('authState');
            const token = authState ? JSON.parse(authState).accessToken : null;

            if (!token) {
                console.error('You must be logged in to export shipments');
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/shipments/export`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                console.error(`Export failed: ${error.message || 'Unknown error'}`);
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'shipments.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export error:', error);
            console.error('Failed to export shipments');
        }
    };

    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Shipment Management</h1>
                <p className="text-slate-500 font-medium">Track and organize inbound/outbound shipments</p>
            </div>
            <div className="flex items-center gap-4">
                <Button
                    variant="secondary"
                    onClick={handleExport}
                    className="flex items-center gap-2"
                >
                    <Icons.Download />
                    Export CSV
                </Button>
                {showNewButton && (
                    <Button
                        onClick={onNewClick}
                        className="flex items-center gap-2 shadow-xl shadow-primary/20"
                    >
                        <Icons.Plus />
                        New Shipment
                    </Button>
                )}
            </div>
        </div>
    );
};

export default ShipmentsHeader;
