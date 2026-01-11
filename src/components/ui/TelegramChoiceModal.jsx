import { createPortal } from 'react-dom';
import { X, Layers, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

const TelegramChoiceModal = ({ isOpen, onClose, onSelect }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-[400px] shadow-2xl scale-100 animate-in zoom-in-95 duration-200 transition-colors">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 transition-colors">
                        Mode de lancement
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => onSelect('ALL')}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-cyan-500/50 transition-all duration-300 group text-left"
                    >
                        <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg group-hover:scale-110 transition-transform shadow-sm border border-zinc-100 dark:border-zinc-700">
                            <Layers className="w-6 h-6 text-zinc-600 dark:text-zinc-300 group-hover:text-cyan-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Lancer tous</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Exécuter le script complet</p>
                        </div>
                    </button>

                    <button
                        onClick={() => onSelect('NEW')}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-purple-500/50 transition-all duration-300 group text-left"
                    >
                        <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg group-hover:scale-110 transition-transform shadow-sm border border-zinc-100 dark:border-zinc-700">
                            <Sparkles className="w-6 h-6 text-zinc-600 dark:text-zinc-300 group-hover:text-purple-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Lancer les nouveautés</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Uniquement les nouveaux items</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default TelegramChoiceModal;
