import { createContext, useContext, useState } from 'react';

const StatsContext = createContext();

export const StatsProvider = ({ children }) => {
    const [chatUsageCount, setChatUsageCount] = useState(0);
    const [actionUsageCount, setActionUsageCount] = useState(0);

    const incrementChatUsage = () => setChatUsageCount((prev) => prev + 1);
    const incrementActionUsage = () => setActionUsageCount((prev) => prev + 1);

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
