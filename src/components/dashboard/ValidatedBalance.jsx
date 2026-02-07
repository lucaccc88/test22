import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Check, DollarSign, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';

const ValidatedBalance = () => {
    const { user } = useAuth();
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const fetchBalance = async () => {
        if (!user) return;
        setIsLoading(true);
        const { data, error } = await supabase
            .from('user_balances')
            .select('amount')
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
            console.error('Error fetching balance:', error);
        }

        if (data) {
            setAmount(data.amount.toString());
        } else {
            setAmount('0');
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchBalance();
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        const val = parseFloat(amount);
        if (isNaN(val)) {
            toast.error("Veuillez entrer un nombre valide");
            setIsSaving(false);
            return;
        }

        const { error } = await supabase
            .from('user_balances')
            .upsert({ user_id: user.id, amount: val, updated_at: new Date() });

        if (error) {
            console.error('Error saving balance:', error);
            toast.error("Erreur sauvegarde");
        } else {
            toast.success("Validation enregistrée");
        }
        setIsSaving(false);
    };

    return (
        <Card className="w-full bg-zinc-900/50 border-zinc-700 shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-zinc-200 flex justify-between items-center">
                    <span>Argent validé</span>
                    <span className="text-cyan-400 font-mono text-2xl font-bold">
                        ${Number(amount || 0).toFixed(2)}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 h-4 w-4" />
                        <input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors font-mono"
                        />
                    </div>
                    <Button
                        onClick={handleSave}
                        isLoading={isSaving}
                        className="bg-cyan-600 hover:bg-cyan-500 text-black font-semibold w-12 px-0"
                    >
                        {isSaving ? <Loader2 className="animate-spin" /> : <Check size={18} />}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ValidatedBalance;
