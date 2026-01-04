import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const StatsContext = createContext();

export const StatsProvider = ({ children }) => {
    const [chatUsageCount, setChatUsageCount] = useState(0);
    const [actionUsageCount, setActionUsageCount] = useState(0);
    const { user } = useAuth();

    // Fetch stats on load or user change
    useEffect(() => {
        if (!user) {
            setChatUsageCount(0);
            setActionUsageCount(0);
            return;
        }

        const fetchStats = async () => {
            const { data, error } = await supabase
                .from('user_stats')
                .select('chat_usage_count, action_usage_count')
                .eq('user_id', user.id)
                .single();

            if (data) {
                setChatUsageCount(data.chat_usage_count || 0);
                setActionUsageCount(data.action_usage_count || 0);
            } else if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
    }, [user]);

    const updateRemoteStats = async (updates) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('user_stats')
                .upsert({
                    user_id: user.id,
                    ...updates,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });

            if (error) throw error;
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    };

    const incrementChatUsage = () => {
        setChatUsageCount((prev) => {
            const newValue = prev + 1;
            updateRemoteStats({ chat_usage_count: newValue, action_usage_count: actionUsageCount });
            return newValue;
        });
    };

    const incrementActionUsage = () => {
        setActionUsageCount((prev) => {
            const newValue = prev + 1;
            updateRemoteStats({ action_usage_count: newValue, chat_usage_count: chatUsageCount });
            return newValue;
        });
    };

    return (
        <StatsContext.Provider value={{
            chatUsageCount,
            actionUsageCount,
            incrementChatUsage,
            incrementActionUsage
        }}>
            {children}
        </StatsContext.Provider>
    );
};

export const useStats = () => {
    const context = useContext(StatsContext);
    if (!context) {
        throw new Error('useStats must be used within a StatsProvider');
    }
    return context;
};
