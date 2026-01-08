import { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

const ActionCard = ({ title, description, icon: Icon, onClick, isLink, className }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        setIsLoading(true);
        try {
            await onClick();
        } catch (error) {
            console.error("Action error:", error);
        } finally {
            // Un petit délai pour montrer le clic si c'est instantané
            setTimeout(() => setIsLoading(false), 500);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={cn(`
                group relative p-4 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-xl
                hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 
                transition-all duration-300 cursor-pointer overflow-hidden
                flex items-center justify-center h-[100px]
            `, className)}
        >
            <div className="flex items-center gap-3 w-full justify-center">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors shrink-0">
                    <Icon className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                </div>

                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap text-sm sm:text-base transition-colors">
                    {title}
                </h3>

                <ChevronRight size={16} className="text-zinc-400 dark:text-zinc-500 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors ml-1 shrink-0" />
            </div>
        </div>
    );
};

export default ActionCard;
