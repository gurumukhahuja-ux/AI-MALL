import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');

    // Simple translation dictionary for demonstration
    const translations = {
        en: {
            chat: 'Chat',
            myAgents: 'My Agents',
            marketplace: 'Marketplace',
            vendorDashboard: 'Vendor Dashboard',
            billing: 'Info',
            securityGuidelines: 'Security & Guidelines',
            adminDashboard: 'Admin Dashboard',
            updates: 'Updates',
            logOut: 'Log Out',
            helpFaq: 'Help & FAQ',
            adminSupport: 'Admin Support',
            // Add other keys as needed based on Sidebar.jsx usage
        },
        // Add other languages here
    };

    const t = (key) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ t, language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
