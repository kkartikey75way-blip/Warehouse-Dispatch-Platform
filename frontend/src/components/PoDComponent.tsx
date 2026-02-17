import { useRef, useState, useEffect } from "react";
import Card from "./Card";
import Button from "./Button";
import { Icons } from "./Icons";

interface PoDComponentProps {
    onComplete: (proof: { signatureUrl: string; photoUrl: string }) => void;
    onCancel: () => void;
}

const PoDComponent = ({ onComplete, onCancel }: PoDComponentProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);
    const [photo, setPhoto] = useState<string | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
    }, []);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ("touches" in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = ("touches" in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ("touches" in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = ("touches" in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
        setHasSignature(true);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleConfirm = () => {
        const canvas = canvasRef.current;
        if (!canvas || !hasSignature || !photo) return;

        onComplete({
            signatureUrl: canvas.toDataURL(),
            photoUrl: photo
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <Card className="w-full max-w-2xl p-8 glass shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Proof of Delivery</h2>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Capture evidence to complete order</p>
                    </div>
                    <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <Icons.X />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Customer Signature</label>
                            <button onClick={clearSignature} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Clear</button>
                        </div>
                        <div className="relative aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden group/canvas">
                            <canvas
                                ref={canvasRef}
                                width={400}
                                height={225}
                                className="w-full h-full cursor-crosshair touch-none"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                            />
                            {!hasSignature && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 font-bold uppercase tracking-widest text-[10px]">
                                    Sign here
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Delivery Photo</label>
                        <div className="aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center relative group/photo">
                            {photo ? (
                                <img src={photo} alt="Delivery" className="w-full h-full object-cover" />
                            ) : (
                                <label className="cursor-pointer flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-300 group-hover/photo:text-primary transition-colors">
                                        <Icons.Package />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Upload Photo</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                </label>
                            )}
                            {photo && (
                                <button onClick={() => setPhoto(null)} className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur shadow-sm rounded-lg text-red-500 hover:bg-white transition-colors">
                                    <Icons.X />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mt-12">
                    <Button onClick={onCancel} variant="secondary" className="flex-1 py-4 uppercase tracking-widest text-xs">
                        Back to Registry
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!hasSignature || !photo}
                        className="flex-1 py-4 uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
                    >
                        Confirm Delivery
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default PoDComponent;
