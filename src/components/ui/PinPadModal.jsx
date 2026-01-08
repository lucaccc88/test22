import { useState, useEffect } from 'react';
import { X, Delete } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

const PinPadModal = ({ isOpen, onClose, onSuccess }) => {
    const [pin, setPin] = useState('');
    const CORRECT_PIN = '6951';

    useEffect(() => {
        if (isOpen) {
            setPin('');
        }
    }, [isOpen]);

    const handleNumClick = (num) => {
        if (pin.length >= 4) return; // Prevent extra digits

        const newPin = pin + num;
        setPin(newPin);

        // Check immediately
        if (newPin === CORRECT_PIN) {
            // Success
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 100); // Tiny delay for visual feedback
        } else if (newPin.length === 4) {
            // Wrong PIN
            setTimeout(() => {
                toast.error('Code incorrect');
                setPin('');
            }, 300);
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-[320px] shadow-2xl scale-100 animate-in zoom-in-95 duration-200 transition-colors">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 transition-colors">Code requis</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* PIN Display */}
                <div className="flex justify-center gap-4 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className={cn(
                            "w-4 h-4 rounded-full transition-all duration-300",
                            pin.length > i ? "bg-cyan-500 scale-110" : "bg-zinc-200 dark:bg-zinc-700"
                        )} />
                    ))}
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleNumClick(num.toString())}
                            className="h-16 rounded-2xl bg-zinc-100/50 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-2xl font-semibold text-zinc-900 dark:text-zinc-100 transition-all active:scale-95 border border-zinc-200 dark:border-zinc-800"
                        >
                            {num}
                        </button>
                    ))}

                    {/* Empty spacer for alignment */}
                    <div />

                    <button
                        onClick={() => handleNumClick('0')}
                        className="h-16 rounded-2xl bg-zinc-100/50 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-2xl font-semibold text-zinc-900 dark:text-zinc-100 transition-all active:scale-95 border border-zinc-200 dark:border-zinc-800"
                    >
                        0
                    </button>

                    <button
                        onClick={handleDelete}
                        className="h-16 rounded-2xl hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 text-zinc-400 hover:text-red-400 transition-all active:scale-95 flex items-center justify-center"
                    >
                        <Delete size={24} />
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default PinPadModal;
