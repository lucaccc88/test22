import ActionCard from '../components/dashboard/ActionCard';
import OrderManager from '../components/dashboard/OrderManager';
import { Send, Link2, ShoppingBag, FileSpreadsheet } from 'lucide-react';
import { useStats } from '../context/StatsContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import PinPadModal from '../components/ui/PinPadModal';

const DashboardPage = () => {
    const WEBHOOK_URL_TELEGRAM = "https://redbou.maillotvibe.com/webhook/10483eba-0480-4afc-bfb1-26634b32a56d";

    // On garde incrementActionUsage pour les logs internes si besoin, mais on n'affiche plus les stats simples
    const { incrementActionUsage } = useStats();
    const { user } = useAuth();
    const [chartData, setChartData] = useState([]);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // Trigger manuel pour rafraichir le graph
    const [lastRunText, setLastRunText] = useState(""); // Texte pour "Dernier lancement"

    // Charger les données du graphique (dernières 24h)
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            const now = new Date();
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

            // 1. Récupérer les données pour le graphique (24h)
            const { data: chartLogs, error: chartError } = await supabase
                .from('action_logs')
                .select('created_at')
                .eq('user_id', user.id)
                .eq('action_name', 'Run telegram')
                .gte('created_at', yesterday)
                .order('created_at', { ascending: true });

            if (!chartError) {
                const groupedData = {};
                for (let i = 23; i >= 0; i--) {
                    const d = new Date(now.getTime() - i * 60 * 60 * 1000);
                    const key = `${d.getHours()}h`;
                    groupedData[key] = { name: key, value: 0 };
                }
                chartLogs.forEach(log => {
                    const d = new Date(log.created_at);
                    const key = `${d.getHours()}h`;
                    if (groupedData[key]) groupedData[key].value = 1;
                });
                setChartData(Object.values(groupedData));
            }

            // 2. Récupérer la TOUTE DERNIÈRE action (même si > 24h) pour le texte
            const { data: lastLog, error: lastLogError } = await supabase
                .from('action_logs')
                .select('created_at')
                .eq('user_id', user.id)
                .eq('action_name', 'Run telegram')
                .order('created_at', { ascending: false }) // Le plus récent d'abord
                .limit(1)
                .single();

            if (!lastLogError && lastLog) {
                const diffMs = now.getTime() - new Date(lastLog.created_at).getTime();
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMins / 60);
                const diffDays = Math.floor(diffHours / 24);

                let text = "";
                if (diffMins < 1) text = "à l'instant";
                else if (diffMins < 60) text = `il y a ${diffMins} min`;
                else if (diffHours < 24) text = `il y a ${diffHours}h`;
                else text = `il y a ${diffDays}j`;

                setLastRunText(text);
            } else {
                setLastRunText("Jamais");
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [user, refreshTrigger]); // Se met à jour quand l'utilisateur fait l'action

    // Log action to DB
    const logAction = async (actionName) => {
        if (!user) return;
        await supabase.from('action_logs').insert([{ user_id: user.id, action_name: actionName }]);
    };

    // Gestion spécial : Ouverture du Modal PIN
    const handleTelegramClick = () => {
        setIsPinModalOpen(true);
    };

    // Exécution réelle après succès du PIN
    const handleTelegramLaunch = async () => {
        incrementActionUsage();
        await logAction('Run telegram');
        setRefreshTrigger(prev => prev + 1); // Rafraichit le graphique et le texte

        // Fire and forget webhook
        fetch(WEBHOOK_URL_TELEGRAM, { method: 'POST', mode: 'no-cors' }).catch(err => console.error(err));
        toast.success("Lancement Telegram effectué");
    };

    const handleLinkOpen = (title, url) => {
        window.open(url, '_blank');
        incrementActionUsage();
        logAction(title).catch(err => console.error("Erreur log action:", err));
    };

    const actions = [
        {
            title: "Run telegram",
            description: "",
            icon: Send,
            onClick: handleTelegramClick
        },
        {
            title: "Hacoo lien",
            description: "",
            icon: Link2,
            onClick: () => handleLinkOpen("Hacoo lien", "https://affiliate.hacoo.app/en-FR/promotion/link")
        },
        {
            title: "Commandes",
            description: "",
            icon: ShoppingBag,
            onClick: () => handleLinkOpen("Commandes", "https://affiliate.hacoo.app/en-FR/conversion/reports")
        },
        {
            title: "Google sheet",
            description: "",
            icon: FileSpreadsheet,
            onClick: () => handleLinkOpen("Google sheet", "https://docs.google.com/spreadsheets/d/1-0Cbkhbrufaw-P68c34iG2FxQ7krraPEg7TaScnmew8/edit?gid=0#gid=0")
        },
    ];

    return (
        <>
            <PinPadModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={handleTelegramLaunch}
            />

            <div className="flex flex-col items-center w-full space-y-8">
                {/* Header */}
                <div className="max-w-5xl w-full text-center space-y-2">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
                        REDBOU hacoo
                    </h1>
                </div>

                {/* Orders Section (Replacing Stats) */}
                <div className="max-w-5xl w-full">
                    <OrderManager />
                </div>

                {/* Main Actions Grid */}
                <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-4 gap-4">
                    {actions.map((action, index) => (
                        <ActionCard
                            key={index}
                            title={action.title}
                            description={action.description}
                            icon={action.icon}
                            onClick={action.onClick}
                        />
                    ))}
                </div>

                {/* Analytics Chart */}
                <div className="max-w-5xl w-full">
                    <Card className="bg-zinc-900/50 border-zinc-700 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-medium text-zinc-200 flex items-center justify-between">
                                <span>Activité Telegram (24h)</span>
                                {lastRunText && (
                                    <span className="text-sm font-normal text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                                        Dernier : {lastRunText}
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}> {/* Increased bottom margin */}
                                    <XAxis
                                        dataKey="name"
                                        stroke="#22d3ee" // Turquoise line
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={true} // Show the axis line
                                        tick={{ fill: '#22d3ee', fontSize: 12, dy: 10 }} // Turquoise text
                                        interval={window.innerWidth < 768 ? 5 : 0} // Mobile: every 6h (skip 5), Desktop: all
                                        height={40}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(34, 211, 238, 0.1)' }}
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-zinc-950/90 border border-cyan-500/50 p-3 rounded-lg shadow-xl backdrop-blur-sm">
                                                        <p className="text-cyan-400 font-bold mb-1 text-sm">{label}</p>
                                                        <p className="text-zinc-100 text-sm font-medium">
                                                            {payload[0].value}
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="value" fill="#22d3ee" radius={[4, 4, 0, 0]} maxBarSize={40} /> {/* Bright Turquoise bars */}
                                    <ReferenceLine y={0.5} stroke="#27272a" strokeDasharray="3 3" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default DashboardPage;
