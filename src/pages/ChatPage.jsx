import { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Mic, Send, Bot, User, Loader2, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { useStats } from '../context/StatsContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const WEBHOOK_URL = 'https://redbou.maillotvibe.com/webhook/f45d27bf-322b-4649-a835-a3ef185a83ff';

const ChatPage = () => {
    // Plus de message par défaut initial
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { incrementChatUsage } = useStats();
    const { user } = useAuth();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Charger l'historique depuis Supabase
    useEffect(() => {
        if (!user) return;

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Erreur chargement messages:', error);
                return;
            }

            if (data && data.length > 0) {
                setMessages(data);
            }
        };

        fetchMessages();
    }, [user]);

    // Fonction pour sauvegarder un message
    const saveMessageToDb = async (text, sender) => {
        if (!user) return null;

        const { data, error } = await supabase
            .from('chat_messages')
            .insert([
                { user_id: user.id, text, sender }
            ])
            .select()
            .single();

        if (error) {
            console.error('Erreur sauvegarde message:', error);
            // On continue même si l'erreur survient pour ne pas bloquer l'UI
            return { id: Date.now(), text, sender, created_at: new Date().toISOString() };
        }

        return data;
    };

    // Fonction pour effacer l'historique
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    // Fonction pour effacer l'historique
    const handleClearHistory = async () => {
        if (!isConfirmingDelete) {
            setIsConfirmingDelete(true);
            // Reset après 3 secondes si pas de confirmation
            setTimeout(() => setIsConfirmingDelete(false), 3000);
            return;
        }

        if (!user) return;
        setIsConfirmingDelete(false); // Reset state

        const { error } = await supabase
            .from('chat_messages')
            .delete()
            .eq('user_id', user.id);

        if (error) {
            console.error("Erreur suppression:", error);
            toast.error('Erreur lors de la suppression');
            return;
        }

        setMessages([]);
        toast.success('Historique effacé définitivement');
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || isLoading) return;

        const messageText = inputText.trim();
        setInputText('');

        // 1. Ajouter le message de l'utilisateur (Optimiste)
        const tempUserMsgId = Date.now();
        const optimisticUserMsg = { id: tempUserMsgId, text: messageText, sender: 'user', created_at: new Date().toISOString() };
        setMessages(prev => [...prev, optimisticUserMsg]);
        setIsLoading(true);

        // 2. Sauvegarder message utilisateur en DB
        await saveMessageToDb(messageText, 'user');

        // 3. Afficher indicateur chargement
        const loadingMsgId = Date.now() + 1;
        setMessages(prev => [...prev, {
            id: loadingMsgId,
            text: "...",
            sender: 'bot',
            isLoading: true
        }]);

        incrementChatUsage();

        try {
            console.log('Envoi du message au webhook:', messageText);

            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: messageText }),
            });

            let data;
            try {
                const text = await response.text();
                if (text) data = JSON.parse(text);
            } catch (e) {
                console.error('JSON Parse error', e);
            }

            if (!response.ok && !data) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            let responseText = '';
            if (data) {
                if (data.response) responseText = typeof data.response === 'string' ? data.response : JSON.stringify(data.response);
                else if (data.message) responseText = typeof data.message === 'string' ? data.message : JSON.stringify(data.message);
                else if (data.text) responseText = typeof data.text === 'string' ? data.text : JSON.stringify(data.text);
                else responseText = JSON.stringify(data);
            } else {
                throw new Error('Aucune réponse du webhook');
            }

            setMessages(prev => prev.filter(msg => msg.id !== loadingMsgId));

            const savedBotMsg = await saveMessageToDb(responseText, 'bot');

            setMessages(prev => [...prev, savedBotMsg || {
                id: Date.now() + 2,
                text: responseText,
                sender: 'bot'
            }]);

        } catch (error) {
            console.error('Erreur:', error);
            setMessages(prev => prev.filter(msg => msg.id !== loadingMsgId));
            const errorMsg = `Erreur: ${error.message || "Une erreur est survenue."}`;
            setMessages(prev => [...prev, {
                id: Date.now() + 2,
                text: errorMsg,
                sender: 'bot'
            }]);
            toast.error('Erreur lors de l\'envoi du message');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMic = () => {
        setIsListening(!isListening);
        if (!isListening) {
            toast("Microphone activé");
        } else {
            toast("Microphone désactivé");
        }
    };

    return (
        <div className="max-w-4xl w-full mx-auto h-[calc(100vh-8rem)] flex flex-col">
            <div className="mb-8 text-center space-y-2">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex-1"></div>
                    <div className="flex-1 text-center">
                        <h1 className="text-3xl font-bold bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent transition-all">
                            redbou chatte
                        </h1>
                        {/* Subtitle removed as requested replacement implies single text or replacing both with one title, user said replace "X and Y" by "Z". I will assume replacing the Title with Z and removing Y or making Y empty/hidden if strictly following "replace X... by Z". I'll put it in h1. */}
                    </div>
                    <div className="flex-1 flex justify-end">
                        <Button
                            onClick={handleClearHistory}
                            variant={isConfirmingDelete ? "destructive" : "outline"}
                            size="sm"
                            className={cn(
                                "transition-all duration-200",
                                isConfirmingDelete
                                    ? "bg-red-500/10 text-red-500 border-red-500/50 hover:bg-red-500/20"
                                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                            )}
                            title="Effacer l'historique"
                        >
                            <Trash2 size={16} className="mr-2" />
                            {isConfirmingDelete ? "Confirmer ?" : "Effacer"}
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="flex-1 flex flex-col bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 overflow-hidden transition-colors">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                            <Bot size={48} className="mb-4 opacity-20" />
                            <p>Aucun message pour le moment</p>
                        </div>
                    )}
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
                                msg.sender === 'user' ? "bg-cyan-500" : "bg-zinc-800"
                            )}>
                                {msg.sender === 'user' ? <User size={16} className="text-black" /> : (msg.isLoading ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />)}
                            </div>
                            <div className={cn(
                                "p-3 rounded-2xl text-sm leading-relaxed",
                                msg.sender === 'user'
                                    ? "bg-cyan-500/10 text-cyan-900 dark:text-cyan-50 border border-cyan-500/20 rounded-tr-none"
                                    : "bg-zinc-100 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-tl-none",
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
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 transition-colors">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={toggleMic}
                            className={cn(
                                "p-3 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-zinc-600",
                                isListening
                                    ? "bg-red-500/20 text-red-500 animate-pulse border border-red-500/50"
                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-200"
                            )}
                            title="Toggle Microphone"
                        >
                            <Mic size={20} />
                        </button>

                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Écrivez votre message..."
                            disabled={isLoading}
                            className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-full px-4 py-2.5 focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        />

                        <Button
                            type="submit"
                            size="icon"
                            className="rounded-full w-11 h-11 shrink-0 bg-cyan-600 hover:bg-cyan-500 text-black border-0 font-bold"
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
