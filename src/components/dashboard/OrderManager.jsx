import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase'; // Fixed path
import { useAuth } from '../../context/AuthContext'; // Fixed path
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

const OrderManager = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const fetchOrders = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            return;
        }
        setOrders(data || []);
    };

    useEffect(() => {
        fetchOrders();
    }, [user]);

    const handleAddOrder = async (e) => {
        e.preventDefault();
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            toast.error("Veuillez entrer un montant valide");
            return;
        }

        setIsLoading(true);
        const { error } = await supabase
            .from('orders')
            .insert([{ user_id: user.id, amount: parseFloat(amount) }]);

        if (error) {
            toast.error("Erreur lors de l'ajout de la commande");
        } else {
            toast.success("Commande ajoutée");
            setAmount('');
            fetchOrders();
        }
        setIsLoading(false);
    };

    const handleDeleteOrder = async (orderId) => {
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', orderId);

        if (error) {
            toast.error("Erreur lors de la suppression");
        } else {
            toast.success("Commande supprimée");
            fetchOrders();
        }
    };

    const totalAmount = orders.reduce((sum, order) => sum + order.amount, 0);

    return (
        <Card className="w-full bg-zinc-900/50 border-zinc-700 shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-zinc-200 flex justify-between items-center">
                    <span>Commandes</span>
                    <span className="text-cyan-400 font-mono text-2xl font-bold">
                        ${totalAmount.toFixed(2)}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Input Area */}
                <form onSubmit={handleAddOrder} className="flex gap-3 mb-6">
                    <div className="relative flex-1">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 h-4 w-4" />
                        <input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Montant (USD)"
                            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                        />
                    </div>
                    <Button
                        type="submit"
                        isLoading={isLoading}
                        className="bg-cyan-600 hover:bg-cyan-500 text-black font-semibold"
                    >
                        <Plus size={18} className="mr-2" />
                        Ajouter
                    </Button>
                </form>

                {/* Toggle List */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-between w-full text-sm text-zinc-500 hover:text-zinc-300 transition-colors py-2 border-t border-zinc-800/50"
                >
                    <span>{orders.length} commandes enregistrées</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {/* Orders List */}
                <div className={cn(
                    "space-y-2 overflow-hidden transition-all duration-300 grid",
                    isExpanded ? "mt-4 opacity-100" : "grid-rows-[0fr] opacity-0 mt-0"
                )}>
                    <div className="min-h-0">
                        {orders.length === 0 ? (
                            <p className="text-center text-zinc-600 italic text-sm py-2">Aucune commande</p>
                        ) : (
                            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {orders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 border border-zinc-800/50 hover:border-cyan-500/30 transition-colors group"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-cyan-50 font-mono font-medium">${order.amount.toFixed(2)}</span>
                                            <span className="text-xs text-zinc-500">{new Date(order.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteOrder(order.id)}
                                            className="p-2 rounded-full hover:bg-red-500/10 text-zinc-500 hover:text-red-500 transition-colors"
                                            title="Supprimer"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default OrderManager;
