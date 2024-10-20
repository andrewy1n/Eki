import { AccountData } from '@/models/Account';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AccountContextType {
    accountData: AccountData | null;
    setAccountData: (accountData: AccountData) => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider = ({ children }: { children: ReactNode }) => {
    const [accountData, setAccountData] = useState<AccountData | null>(null);

    return (
        <AccountContext.Provider
            value={{
                accountData,
                setAccountData
            }}
        >
            {children}
        </AccountContext.Provider>
    );
};

export const useAccountContext = () => {
    const context = useContext(AccountContext);
    if (!context) {
        throw new Error('useContext must be used within an AccountProvider');
    }
    return context;
};