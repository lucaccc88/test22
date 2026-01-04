import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Mic, Send, Bot, User, Loader2, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { useStats } from '../context/StatsContext';

const WEBHOOK_URL = 'https://redbou.maillotvibe.com/webhook/f45d27bf-322b-4649-a835-a3ef185a83ff';
const STORAGE_KEY = 'chat_messages';

const ChatPage = () => {
    // Message initial par défaut
    const defaultMessage = [
        { id: 1, text: "Hello! I'm your database assistant. How can I help you query your data today?", sender: 'bot' }
    ];

    // Charger les messages depuis localStorage au montage
    const [messages, setMessages] = useState(() => {
        try {
            const savedMessages = localStorage.getItem(STORAGE_KEY);
            if (savedMessages) {
                const parsed = JSON.parse(savedMessages);
                // S'assurer qu'on a au moins un message
                return parsed.length > 0 ? parsed : defaultMessage;
            }
        } catch (error) {
            console.error('Erreur lors du chargement des messages:', error);
        }
        return defaultMessage;
    });

    const [inputText, setInputText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { incrementChatUsage } = useStats();

    // Sauvegarder les messages dans localStorage à chaque modification
    useEffect(() => {
        try {
            // Filtrer les messages de chargement avant de sauvegarder
            const messagesToSave = messages.filter(msg => !msg.isLoading);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messagesToSave));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des messages:', error);
        }
    }, [messages]);

    // Fonction pour effacer l'historique
    const handleClearHistory = () => {
        setMessages(defaultMessage);
        localStorage.removeItem(STORAGE_KEY);
        toast.success('Historique effacé', {
            description: 'Tous les messages ont été supprimés.',
        });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || isLoading) return;

        const messageText = inputText.trim();
        
        // Ajouter le message de l'utilisateur instantanément
        const userMsg = { id: Date.now(), text: messageText, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        
        // Vider le champ de saisie
        setInputText('');
        
        // Afficher le message de chargement
        setIsLoading(true);
        const loadingMsgId = Date.now() + 1;
        setMessages(prev => [...prev, {
            id: loadingMsgId,
            text: "L'assistant écrit...",
            sender: 'bot',
            isLoading: true
        }]);

        incrementChatUsage();

        try {
            // Envoyer la requête POST au webhook et attendre la réponse complète
            // Le système attendra la réponse du webhook avant d'afficher la réponse dans le chat
            console.log('Envoi du message au webhook:', messageText);
            
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: messageText }),
            });
            
            console.log('Statut de la réponse:', response.status, response.statusText);

            // Essayer de récupérer la réponse même en cas d'erreur HTTP
            let data;
            try {
                const responseText = await response.text();
                if (responseText) {
                    data = JSON.parse(responseText);
                }
            } catch (parseError) {
                console.error('Erreur lors du parsing de la réponse:', parseError);
            }

            // Si le webhook retourne une erreur HTTP, on essaie quand même d'utiliser la réponse
            if (!response.ok) {
                // Si on a réussi à parser une réponse, on l'utilise
                if (data && (data.response || data.message || data.error)) {
                    const responseText = data.response || data.message || data.error || `Erreur ${response.status}: ${data.message || 'Erreur serveur'}`;
                    
                    setMessages(prev => prev.filter(msg => msg.id !== loadingMsgId));
                    setMessages(prev => [...prev, {
                        id: Date.now() + 2,
                        text: responseText,
                        sender: 'bot'
                    }]);
                    return;
                }
                throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
            }

            // Si pas de données, créer un objet vide
            if (!data) {
                throw new Error('Aucune réponse du webhook');
            }
            
            // Debug : afficher la réponse complète dans la console
            console.log('Réponse du webhook:', data);
            
            // Récupérer la réponse du webhook (essayer plusieurs formats possibles)
            let responseText = '';
            if (data.response) {
                responseText = typeof data.response === 'string' ? data.response : JSON.stringify(data.response);
            } else if (data.message) {
                responseText = typeof data.message === 'string' ? data.message : JSON.stringify(data.message);
            } else if (data.text) {
                responseText = typeof data.text === 'string' ? data.text : JSON.stringify(data.text);
            } else if (typeof data === 'string') {
                responseText = data;
            } else {
                responseText = JSON.stringify(data);
            }
            
            // Retirer le message de chargement
            setMessages(prev => prev.filter(msg => msg.id !== loadingMsgId));
            
            // Ajouter la réponse du webhook dans le chat (on attend bien la réponse avant d'afficher)
            setMessages(prev => [...prev, {
                id: Date.now() + 2,
                text: responseText,
                sender: 'bot'
            }]);

        } catch (error) {
            console.error('Erreur lors de l\'envoi du message au webhook:', error);
            
            // Retirer le message de chargement
            setMessages(prev => prev.filter(msg => msg.id !== loadingMsgId));
            
            // Afficher un message d'erreur dans le chat
            let errorMessage = "Désolé, une erreur s'est produite. Veuillez réessayer.";
            if (error.message) {
                errorMessage = `Erreur: ${error.message}`;
            }
            
            setMessages(prev => [...prev, {
                id: Date.now() + 2,
                text: errorMessage,
                sender: 'bot'
            }]);

            // Afficher une notification toast d'erreur
            toast.error('Erreur lors de l\'envoi du message', {
                description: error.message || 'Impossible de communiquer avec le webhook.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMic = () => {
        setIsListening(!isListening);
        if (!isListening) {
            toast("Microphone activated", { description: "Listening..." });
        } else {
            toast("Microphone deactivated");
        }
    };

    return (
        <div className="max-w-4xl w-full mx-auto h-[calc(100vh-8rem)] flex flex-col">
            <div className="mb-8 text-center space-y-2">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex-1"></div>
                    <div className="flex-1 text-center">
                        <h1 className="text-3xl font-bold bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
                            Database Chat
                        </h1>
                        <p className="text-zinc-400">Ask questions to your database using natural language.</p>
                    </div>
                    <div className="flex-1 flex justify-end">
                        <Button
                            onClick={handleClearHistory}
                            variant="outline"
                            size="sm"
                            className="text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700"
                            title="Effacer l'historique"
                        >
                            <Trash2 size={16} className="mr-2" />
                            Effacer l'historique
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="flex-1 flex flex-col bg-zinc-950/50 border-zinc-800 overflow-hidden">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex items-start gap-3 max-w-[80%]",
                                msg.sender === 'user' ? "ml-auto flex-row-reverse" : ""
                            )}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                msg.sender === 'user' ? "bg-blue-600" : "bg-zinc-800"
                            )}>
                                {msg.sender === 'user' ? <User size={16} /> : (msg.isLoading ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />)}
                            </div>
                            <div className={cn(
                                "p-3 rounded-2xl text-sm leading-relaxed",
                                msg.sender === 'user'
                                    ? "bg-blue-600/10 text-blue-100 border border-blue-600/20 rounded-tr-none"
                                    : "bg-zinc-800/50 text-zinc-100 border border-zinc-800 rounded-tl-none",
                                msg.isLoading && "opacity-70"
                            )}>
                                {msg.isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 size={14} className="animate-spin" />
                                        {msg.text}
                                    </span>
                                ) : (
                                    msg.text
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={toggleMic}
                            className={cn(
                                "p-3 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-zinc-600",
                                isListening
                                    ? "bg-red-500/20 text-red-500 animate-pulse border border-red-500/50"
                                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                            )}
                            title="Toggle Microphone"
                        >
                            <Mic size={20} />
                        </button>

                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type your query..."
                            disabled={isLoading}
                            className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-full px-4 py-2.5 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        />

                        <Button
                            type="submit"
                            size="icon"
                            className="rounded-full w-11 h-11 shrink-0 bg-blue-600 hover:bg-blue-500 text-white border-0"
                            disabled={!inputText.trim() || isLoading}
                            isLoading={isLoading}
                        >
                            {!isLoading && <Send size={18} />}
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
};

export default ChatPage;
