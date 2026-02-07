import { useState, useEffect } from 'react';
import { Package, XCircle, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { cn } from '../../lib/utils';

const OrderManager = () => {
    // This component now strictly handles Hacoo Orders
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const fetchOrders = async () => {
        if (!user) return;
        setIsLoading(true);

        const { data, error } = await supabase
            .from('hacoo_orders')
            .select('*')
            .order('order_date', { ascending: false });

        if (error) {
            console.error('Error fetching hacoo orders:', error);
        } else {
            setOrders(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, [user]);

    // Calculation Logic: ignore canceled AND delivered from total
    const totalAmount = orders.reduce((sum, order) => {
        const status = order.status?.toLowerCase();
        if (status === 'canceled' || status === 'delivered') return sum;
        return sum + (Number(order.estimated_commission) || 0);
    }, 0);

    // Styling Helpers
    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'canceled': return <XCircle className="w-4 h-4 text-red-400/80" />;
            case 'pending': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'delivered': return <Package className="w-4 h-4 text-white" />;
            default: return <Package className="w-4 h-4 text-zinc-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'canceled': return 'text-red-400/80 bg-red-500/5 border-red-500/10 font-normal';
            case 'pending': return 'text-green-400 bg-green-500/10 border-green-500/20';
            case 'delivered': return 'text-white bg-zinc-500/10 border-zinc-500/20';
            default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
        }
    };

    return (
        <Card className="w-full bg-zinc-900/50 shadow-sm border-zinc-700 mt-6">
            <CardHeader className="pb-3">
                <CardTitle className="text-zinc-200 flex justify-between items-center">
                    <span className="flex items-center">
                        <Package className="w-5 h-5 text-purple-400 mr-2" />
                        Hacoo Orders
                    </span>
                    <span className="font-mono text-2xl font-bold text-purple-400">
                        ${totalAmount.toFixed(2)}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-zinc-400">
                        Commission estimée
                    </p>
                </div>

                {/* Toggle List */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-between w-full text-sm text-zinc-500 hover:text-zinc-300 transition-colors py-2 border-t border-zinc-800/50"
                >
                    <span>{orders.length} commandes synchronisées</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {/* Orders List */}
                <div className={cn(
                    "space-y-2 overflow-hidden transition-all duration-300 grid",
                    isExpanded ? "mt-4 opacity-100" : "grid-rows-[0fr] opacity-0 mt-0"
                )}>
                    <div className="min-h-0">
                        {isLoading && <p className="text-center text-zinc-600 italic text-sm py-2">Chargement...</p>}

                        {!isLoading && orders.length === 0 ? (
                            <p className="text-center text-zinc-600 italic text-sm py-2">Aucune commande</p>
                        ) : (
                            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {orders.map((order) => {
                                    const amountVal = Number(order.estimated_commission || 0);

                                    return (
                                        <div
                                            key={order.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 border border-zinc-800/50 hover:border-purple-500/30 transition-colors group"
                                        >
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn("text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 scale-90 origin-left", getStatusColor(order.status))}>
                                                        {getStatusIcon(order.status)}
                                                        {order.status}
                                                    </span>
                                                    <span className="text-xs text-zinc-500">
                                                        {new Date(order.order_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            <span className={cn(
                                                "font-mono font-medium",
                                                (order.status?.toLowerCase() === 'canceled' || order.status?.toLowerCase() === 'delivered')
                                                    ? "text-zinc-500 line-through"
                                                    : "text-purple-50"
                                            )}>
                                                ${amountVal.toFixed(2)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default OrderManager;
