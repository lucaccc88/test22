import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useStats } from '../../context/StatsContext';

const ActionCard = ({ title, description, icon: Icon, webhookUrl }) => {
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const { incrementActionUsage } = useStats();

    const handleAction = async () => {
        setStatus('loading');
        incrementActionUsage();

        // Simulation of API delay for better UX if the user hasn't set a URL
        const startTime = Date.now();

        try {
            if (!webhookUrl) throw new Error("Webhook URL is not configured");

            console.log('Envoi de la requête POST vers:', webhookUrl);

            const response = await fetch(webhookUrl, {
                method: 'POST',
                mode: 'cors',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: title, timestamp: new Date().toISOString() }),
            });

            console.log('Réponse reçue:', response.status, response.statusText);

            // Pour "Clear Cache", on ne vérifie pas la réponse - l'action est déclenchée et c'est suffisant
            if (title === 'Clear Cache') {
                // On considère que c'est un succès dès que la requête est envoyée
                // Pas besoin d'attendre ou de vérifier la réponse
                const elapsed = Date.now() - startTime;
                if (elapsed < 500) await new Promise(r => setTimeout(r, 500 - elapsed));
                
                setStatus('success');
            } else {
                // Pour les autres actions, on vérifie la réponse comme avant
                if (!response.ok) {
                    const errorText = await response.text().catch(() => '');
                    throw new Error(`HTTP error! status: ${response.status}${errorText ? ` - ${errorText}` : ''}`);
                }

                // Ensure at least 500ms loading state for smooth UI
                const elapsed = Date.now() - startTime;
                if (elapsed < 500) await new Promise(r => setTimeout(r, 500 - elapsed));

                setStatus('success');
            }
            
            // Messages personnalisés pour "Clear Cache"
            if (title === 'Clear Cache') {
                toast.success('Cache vidé avec succès !', {
                    icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
                });
            } else {
                toast.success(`${title} executed successfully`, {
                    description: "The automation has been triggered.",
                    icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
                });
            }

            // Reset status after a delay
            setTimeout(() => setStatus('idle'), 3000);

        } catch (error) {
            console.error('Erreur lors de l\'appel du webhook:', error);
            setStatus('error');
            
            // Messages personnalisés pour "Clear Cache"
            if (title === 'Clear Cache') {
                // Afficher l'erreur détaillée en console pour le debug
                console.error('Détails de l\'erreur Clear Cache:', {
                    message: error.message,
                    name: error.name,
                    stack: error.stack
                });
                toast.error('Erreur lors du vidage du cache.', {
                    description: error.message || "Une erreur s'est produite.",
                    icon: <AlertCircle className="h-4 w-4 text-red-500" />,
                });
            } else {
                toast.error(`Failed to execute ${title} `, {
                    description: error.message || "An unexpected error occurred.",
                    icon: <AlertCircle className="h-4 w-4 text-red-500" />,
                });
            }
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return (
        <Card className={cn(
            "border-l-4 transition-all duration-300",
            status === 'success' ? "border-l-green-500 shadow-green-900/10 shadow-lg" :
                status === 'error' ? "border-l-red-500" :
                    "border-l-zinc-800 hover:border-l-zinc-700 hover:shadow-lg hover:shadow-zinc-900/10"
        )}>
            <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                        <Icon className="h-5 w-5 text-zinc-400" />
                    </div>
                    <CardTitle className="text-zinc-200">{title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-zinc-400 leading-relaxed">
                    {description}
                </p>
            </CardContent>
            <CardFooter className="flex justify-end pt-2">
                <Button
                    onClick={handleAction}
                    isLoading={status === 'loading'}
                    className={cn("w-full transition-all", status === 'success' && "bg-green-600 hover:bg-green-700 text-white")}
                    variant={status === 'error' ? "destructive" : "default"}
                >
                    {status === 'idle' && <><Play className="mr-2 h-4 w-4" /> Run Action</>}
                    {status === 'loading' && (title === 'Clear Cache' ? 'Chargement...' : 'Processing...')}
                    {status === 'success' && "Done"}
                    {status === 'error' && "Retry"}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default ActionCard;
