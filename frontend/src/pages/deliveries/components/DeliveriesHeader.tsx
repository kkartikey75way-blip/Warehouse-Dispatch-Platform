import toast from "react-hot-toast";

interface DeliveriesHeaderProps {
    userRole: string;
}

const DeliveriesHeader = ({ userRole }: DeliveriesHeaderProps) => {
    const handleExport = async () => {
        try {
            const authState = localStorage.getItem('authState');
            const token = authState ? JSON.parse(authState).accessToken : null;

            if (!token) {
                toast.error('You must be logged in to export reports');
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/export/delivery-report`, {
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
            a.download = 'delivery-report.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export delivery report');
        }
    };

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                    {userRole === 'DRIVER' ? 'My Trip Manifest' : 'Delivery Intelligence'}
                </h1>
                <p className="text-slate-500 font-medium">Monitoring final-mile precision and completion rates</p>
            </div>
            {(userRole === 'WAREHOUSE_MANAGER' || userRole === 'ADMIN' || userRole === 'DISPATCHER') && (
                <button
                    onClick={handleExport}
                    className="group flex items-center gap-3 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-200/50"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Export Performance Data
                </button>
            )}
        </div>
    );
};

export default DeliveriesHeader;
