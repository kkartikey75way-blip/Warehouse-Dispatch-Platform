import { Icons } from "./Icons";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "info";
    isLoading?: boolean;
}

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger",
    isLoading = false
}: ConfirmationModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                <div className={`h-2 w-full ${type === "danger" ? "bg-red-500" : "bg-primary"}`} />

                <div className="p-10 space-y-8">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-4 ${type === "danger" ? "bg-red-50 text-red-500 shadow-xl shadow-red-500/10" : "bg-primary/10 text-primary shadow-xl shadow-primary/10"}`}>
                            {type === "danger" ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                            ) : (
                                <Icons.AlertCircle className="w-10 h-10" />
                            )}
                        </div>

                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h2>
                        <p className="text-slate-500 font-medium leading-relaxed">{message}</p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-2 ${type === "danger"
                                ? "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20"
                                : "bg-primary text-white hover:bg-primary/90 shadow-primary/20"
                                }`}
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : confirmText}
                        </button>

                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all font-bold"
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
