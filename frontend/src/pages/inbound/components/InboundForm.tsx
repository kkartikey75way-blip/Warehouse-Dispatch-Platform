import React from "react";

interface InboundFormProps {
    receiveForm: { actualSku: string; actualQuantity: number };
    setReceiveForm: React.Dispatch<React.SetStateAction<{ actualSku: string; actualQuantity: number }>>;
    onSubmit: (e: React.FormEvent) => void;
    isProcessing: boolean;
}

const InboundForm = ({ receiveForm, setReceiveForm, onSubmit, isProcessing }: InboundFormProps) => {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Detected SKU / Barcode</label>
                <input
                    type="text"
                    required
                    value={receiveForm.actualSku}
                    onChange={e => setReceiveForm(prev => ({ ...prev, actualSku: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Scan SKU"
                />
            </div>
            <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Actual Unit Count</label>
                <input
                    type="number"
                    required
                    value={receiveForm.actualQuantity}
                    onChange={e => setReceiveForm(prev => ({ ...prev, actualQuantity: parseInt(e.target.value) }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Quantity"
                />
            </div>
            <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
                {isProcessing ? 'Validating...' : 'Log Receipt'}
            </button>
        </form>
    );
};

export default InboundForm;
