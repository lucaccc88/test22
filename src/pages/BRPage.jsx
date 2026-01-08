import { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Clock, RotateCcw, Play, History, X, Plus, Check, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import ScrollPicker from '../components/ui/ScrollPicker';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const BRPage = () => {
    const { user } = useAuth();

    // --- Timer Logic States ---
    const [elapsed, setElapsed] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // --- History Logic States ---
    const [history, setHistory] = useState([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    // Computed Start Date: The most recent BR entry is the start date for the counter
    const startDate = history.length > 0 ? history[0].date : null;

    // --- Add Form States ---
    const now = new Date();
    // Re-using ScrollPicker states for "Add BR" form (could separate if needed, but we can reset on open)
    // We need separate states for the "Add BR" form otherwise it conflicts with the main "Start Timer" form if we want to support both.
    // The main "Start Timer" is only visible if !startDate.
    // If startDate exists, we are in "Display" mode. So we can re-use or create new ones.
    // To be safe and clean, let's use separate states for the "Add BR" form.

    // Add Form Date
    const [addDay, setAddDay] = useState(now.getDate());
    const [addMonth, setAddMonth] = useState(now.getMonth() + 1);
    const [addYear, setAddYear] = useState(now.getFullYear());
    const [addHour, setAddHour] = useState(now.getHours());
    const [addMinute, setAddMinute] = useState(now.getMinutes());

    // Add Form Type
    const brTypes = ['TikTok', 'Porno', 'Imagination'];
    const [addType, setAddType] = useState('TikTok');

    // --- Main Timer Picker States (for starting the main counter) ---
    // (Only used when !startDate)
    const [startDay, setStartDay] = useState(now.getDate());
    const [startMonth, setStartMonth] = useState(now.getMonth() + 1);
    const [startYear, setStartYear] = useState(now.getFullYear());
    const [startHour, setStartHour] = useState(now.getHours());
    const [startMinute, setStartMinute] = useState(now.getMinutes());

    // --- Ranges ---
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    // Years: let's give a good range for history too
    const years = Array.from({ length: 101 }, (_, i) => 2000 + i);
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    // --- Data Fetching ---
    const fetchHistory = async () => {
        if (!user) {
            setIsLoadingData(false);
            return;
        }
        setIsLoadingData(true);
        try {
            const { data, error } = await supabase
                .from('br_entries')
                .select('*')
                .eq('user_id', user.id) // Filter by current user
                .order('date', { ascending: false });

            if (error) throw error;
            setHistory(data || []);
        } catch (error) {
            console.error('Error fetching history:', error);
            toast.error('Erreur lors du chargement de l\'historique');
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchHistory();
        }
    }, [user]);

    // --- Timer Effect ---
    useEffect(() => {
        if (!startDate) {
            setElapsed(null);
            return;
        }

        const start = new Date(startDate).getTime();

        const calculateElapsed = () => {
            const now = new Date().getTime();
            const difference = now - start;

            if (difference < 0) {
                setElapsed({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setElapsed({ days, hours, minutes, seconds });
        };

        calculateElapsed();
        const interval = setInterval(calculateElapsed, 1000);
        return () => clearInterval(interval);
    }, [startDate]);


    // --- Handlers ---

    const handleStartTimer = async (e) => {
        e.preventDefault();

        let isoString = '';
        const mobileInput = e.target.elements.mobileDate?.value;
        const isMobile = window.innerWidth < 768;

        if (isMobile && mobileInput) {
            isoString = new Date(mobileInput).toISOString();
        } else {
            const date = new Date(startYear, startMonth - 1, startDay, startHour, startMinute, 0);
            isoString = date.toISOString();
        }

        try {
            const { error } = await supabase
                .from('br_entries')
                .insert([{
                    user_id: user.id,
                    date: isoString,
                    type: 'Départ'
                }]);

            if (error) throw error;

            toast.success('Compteur démarré !');
            fetchHistory(); // Refetch to update startDate and history
        } catch (error) {
            toast.error("Impossible de démarrer le compteur");
            console.error(error);
        }
    };

    const handleDeleteBR = async (id) => {
        if (!confirm("Supprimer cette BR de l'historique ?")) return;

        try {
            const { error } = await supabase
                .from('br_entries')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id); // Ensure user can only delete their own entries

            if (error) throw error;

            toast.success('Entrée supprimée');
            fetchHistory();
        } catch (error) {
            toast.error("Erreur lors de la suppression");
            console.error(error);
        }
    };

    const handleAddBR = async (e) => {
        e.preventDefault();

        // Construct date
        let dateObj = null;
        const mobileInput = e.target.elements.mobileAddDate?.value;
        const isMobile = window.innerWidth < 768;

        if (isMobile) {
            if (!mobileInput) {
                toast.error("Veuillez sélectionner une date");
                return;
            }
            dateObj = new Date(mobileInput);
        } else {
            dateObj = new Date(addYear, addMonth - 1, addDay, addHour, addMinute);
        }

        try {
            const { error } = await supabase
                .from('br_entries')
                .insert([{
                    user_id: user.id,
                    date: dateObj.toISOString(),
                    type: addType
                }]);

            if (error) throw error;

            toast.success('BR ajoutée !');
            setIsAdding(false);
            setIsHistoryOpen(true);
            fetchHistory();
        } catch (error) {
            toast.error("Erreur lors de l'ajout");
            console.error(error);
        }
    };

    const openAddForm = () => {
        // Reset add form to now
        const n = new Date();
        setAddDay(n.getDate());
        setAddMonth(n.getMonth() + 1);
        setAddYear(n.getFullYear());
        setAddHour(n.getHours());
        setAddMinute(n.getMinutes());
        setAddType('TikTok');

        setIsAdding(true);
    };

    // --- Loading State ---
    if (isLoadingData) {
        return (
            <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
                <Loader2 className="animate-spin text-zinc-500" size={32} />
            </div>
        );
    }

    // --- Renders ---

    // 1. History Modal / Overlay
    if (isHistoryOpen) {
        return (
            <div className="fixed inset-0 z-50 bg-zinc-50 dark:bg-zinc-950 flex flex-col animate-in slide-in-from-bottom-5 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md">
                    <Button variant="ghost" size="icon" onClick={() => {
                        if (isAdding) setIsAdding(false);
                        else setIsHistoryOpen(false);
                    }}>
                        <X size={24} className="text-zinc-500" />
                    </Button>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {isAdding ? "Ajouter une BR" : "Historique BR"}
                    </h2>
                    {!isAdding && (
                        <Button
                            onClick={openAddForm}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border-0 text-sm font-medium"
                        >
                            J'me suis BR
                        </Button>
                    )}
                    {isAdding && <div className="w-10" />} {/* Spacer */}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {isAdding ? (
                        <form onSubmit={handleAddBR} className="h-full flex flex-col max-w-lg mx-auto">
                            <div className="flex-1 space-y-8 py-8">
                                {/* Mobile Date Input */}
                                <div className="md:hidden space-y-2">
                                    <label className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Date</label>
                                    <input
                                        type="datetime-local"
                                        name="mobileAddDate"
                                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl"
                                    />
                                </div>

                                {/* Desktop Date Picker */}
                                <div className="hidden md:block">
                                    <label className="block text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4 text-center">Date</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        <ScrollPicker items={days} value={addDay} onChange={setAddDay} label="Jour" />
                                        <ScrollPicker items={months} value={addMonth} onChange={setAddMonth} label="Mois" />
                                        <ScrollPicker items={years} value={addYear} onChange={setAddYear} label="Année" />
                                        <ScrollPicker items={hours} value={addHour} onChange={setAddHour} label="Heure" />
                                        <ScrollPicker items={minutes} value={addMinute} onChange={setAddMinute} label="Min" />
                                    </div>
                                </div>

                                {/* Type Picker */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4 text-center">Type</label>
                                    <ScrollPicker
                                        items={brTypes}
                                        value={addType}
                                        onChange={setAddType}
                                        className="w-full max-w-xs mx-auto"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full py-6 text-lg font-bold text-green-700 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 backdrop-blur-sm"
                            >
                                Valider la BR
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-3 max-w-2xl mx-auto">
                            {history.length === 0 ? (
                                <div className="text-center py-20 text-zinc-400">
                                    AUCUNE BR ENREGISTRÉE
                                </div>
                            ) : (
                                history.map((item, index) => {
                                    // Calculate number: count how many VALID items (not Départ) are older than this one (appear later in list)
                                    // + 1 because it's 1-indexed
                                    const validItemsAfter = history.slice(index + 1).filter(h => h.type !== 'Départ').length;
                                    const itemNumber = validItemsAfter + 1;
                                    const isDepart = item.type === 'Départ';

                                    return (
                                        <div key={item.id} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl group">
                                            <div>
                                                <p className="font-bold text-zinc-900 dark:text-zinc-100">
                                                    {!isDepart && (
                                                        <span className="text-zinc-400 font-normal mr-2">{itemNumber})</span>
                                                    )}
                                                    {item.type}
                                                </p>
                                                <p className="text-sm text-zinc-500">{new Date(item.date).toLocaleString()}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteBR(item.id)}
                                                className="text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                                title="Supprimer cette BR"
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // 2. Main Timer View
    return (
        <div className="h-[calc(100vh-8rem)] flex items-center justify-center p-4">
            {!startDate ? (
                // --- Start Timer Form ---
                <Card className="w-full max-w-2xl p-8 bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 backdrop-blur-sm shadow-xl">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-500 mb-4">
                            <Clock size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">BR Counter</h1>
                        <p className="text-zinc-500 dark:text-zinc-400">Configurez la date de départ</p>
                    </div>

                    <form onSubmit={handleStartTimer} className="space-y-8">
                        <div className="md:hidden space-y-2">
                            <label htmlFor="mobileDate" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Date et Heure</label>
                            <input type="datetime-local" id="mobileDate" name="mobileDate" className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg" />
                        </div>
                        <div className="hidden md:grid grid-cols-5 gap-2">
                            <ScrollPicker items={days} value={startDay} onChange={setStartDay} label="Jour" />
                            <ScrollPicker items={months} value={startMonth} onChange={setStartMonth} label="Mois" />
                            <ScrollPicker items={years} value={startYear} onChange={setStartYear} label="Année" />
                            <ScrollPicker items={hours} value={startHour} onChange={setStartHour} label="Heure" />
                            <ScrollPicker items={minutes} value={startMinute} onChange={setStartMinute} label="Min" />
                        </div>
                        <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white border-0 py-6 text-lg mt-4">
                            <Play size={20} className="mr-2" /> Lancer le compteur
                        </Button>
                    </form>
                </Card>
            ) : (
                // --- Elapsed Timer Display ---
                <div className="w-full max-w-4xl text-center animate-in zoom-in-95 duration-500 relative">
                    <h2 className="text-zinc-500 dark:text-zinc-400 font-medium mb-12 uppercase tracking-[0.2em]">
                        Temps écoulé depuis la derniere BR
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-12">
                        {/* Days */}
                        <div className="flex flex-col items-center p-6 rounded-2xl bg-white/5 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-sm">
                            <span className="text-5xl md:text-7xl font-bold text-zinc-900 dark:text-white tabular-nums mb-2">{elapsed?.days || 0}</span>
                            <span className="text-sm text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Jours</span>
                        </div>
                        {/* Hours */}
                        <div className="flex flex-col items-center p-6 rounded-2xl bg-white/5 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-sm">
                            <span className="text-5xl md:text-7xl font-bold text-zinc-900 dark:text-white tabular-nums mb-2">{elapsed?.hours || 0}</span>
                            <span className="text-sm text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Heures</span>
                        </div>
                        {/* Minutes */}
                        <div className="flex flex-col items-center p-6 rounded-2xl bg-white/5 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-sm">
                            <span className="text-5xl md:text-7xl font-bold text-zinc-900 dark:text-white tabular-nums mb-2">{elapsed?.minutes || 0}</span>
                            <span className="text-sm text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Minutes</span>
                        </div>
                        {/* Seconds */}
                        <div className="flex flex-col items-center p-6 rounded-2xl bg-white/5 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-sm">
                            <span className="text-5xl md:text-7xl font-bold text-cyan-600 dark:text-cyan-400 tabular-nums mb-2">{elapsed?.seconds || 0}</span>
                            <span className="text-sm text-cyan-600/70 dark:text-cyan-400/70 uppercase tracking-wider">Secondes</span>
                        </div>
                    </div>

                    {/* Footer / Controls */}
                    <div className="flex flex-col items-center gap-6">
                        {/* BR History Button */}
                        <Button
                            onClick={() => setIsHistoryOpen(true)}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-2 rounded-full shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                        >
                            Calendrier des BR
                        </Button>

                        <div className="h-px w-24 bg-zinc-200 dark:bg-zinc-800" />

                        <div className="flex items-center gap-4">
                            <p className="text-zinc-400 text-sm">
                                Début : {new Date(startDate).toLocaleString()}
                            </p>
                        </div>

                        {/* Total BR Count Square */}
                        <div className="mt-2 text-center">
                            <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-cyan-500/20 mx-auto">
                                {history.filter(h => h.type !== 'Départ').length}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BRPage;
