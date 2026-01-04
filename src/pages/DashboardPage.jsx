import ActionCard from '../components/dashboard/ActionCard';
import { Database, FileText, Send, RefreshCw, Layers, ShieldCheck, BarChart3, MessageSquare } from 'lucide-react';
import { useStats } from '../context/StatsContext';
import { Card, CardContent } from '../components/ui/Card';

const DashboardPage = () => {
    // CONFIG: Webhook URLs - Configurez les URLs pour chaque action
    const WEBHOOK_URLS = {
        "Clear Cache": "https://redbou.maillotvibe.com/webhook/10483eba-0480-4afc-bfb1-26634b32a56d", // URL du webhook pour Clear Cache
        "Data Sync": "",
        "Generate Report": "",
        "Send Newsletter": "",
        "Backup System": "",
        "Audit Security": "",
    };
    
    const { actionUsageCount, chatUsageCount } = useStats();

    const actions = [
        {
            title: "Data Sync",
            description: "Synchronize local database with the remote master server.",
            icon: Database,
        },
        {
            title: "Generate Report",
            description: "Analyze daily logs and compile a PDF summary report.",
            icon: FileText,
        },
        {
            title: "Send Newsletter",
            description: "Dispatch the weekly update to all subscribed users.",
            icon: Send,
        },
        {
            title: "Clear Cache",
            description: "Flush Redis cache and rebuild static assets.",
            icon: RefreshCw,
        },
        {
            title: "Backup System",
            description: "Create a full snapshot of the current system state.",
            icon: Layers,
        },
        {
            title: "Audit Security",
            description: "Run automated vulnerability scan on all endpoints.",
            icon: ShieldCheck,
        },
    ];

    return (
        <div className="flex flex-col items-center w-full">
            {/* Header */}
            <div className="max-w-5xl w-full mb-8 text-center space-y-4">
                <div className="inline-block p-1 px-3 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-medium mb-2">
                    Internal Tools v1.0
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
                    Command Center
                </h1>
                <p className="text-zinc-400 max-w-lg mx-auto text-lg">
                    Manage your operations efficiently. Trigger automated workflows with a single click.
                </p>
            </div>

            {/* Stats Area */}
            <div className="max-w-5xl w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-zinc-100">
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-zinc-400">Total Actions Triggered</p>
                            <h3 className="text-3xl font-bold mt-1">{actionUsageCount}</h3>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                            <BarChart3 size={24} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-zinc-400">Total Chat Messages</p>
                            <h3 className="text-3xl font-bold mt-1">{chatUsageCount}</h3>
                        </div>
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                            <MessageSquare size={24} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Action Grid */}
            <div className="max-w-5xl w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {actions.map((action, index) => (
                    <ActionCard
                        key={index}
                        title={action.title}
                        description={action.description}
                        icon={action.icon}
                        webhookUrl={WEBHOOK_URLS[action.title] || ""}
                    />
                ))}
            </div>
        </div>
    );
};

export default DashboardPage;
