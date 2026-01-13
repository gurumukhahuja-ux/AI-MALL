import React, { useEffect } from 'react';
import VendorSupportChat from './components/VendorSupportChat';
import { motion } from 'framer-motion';

const VendorAdminSupport = () => {
    useEffect(() => {
        console.log("VENDOR ADMIN SUPPORT RENDERED - CLEAN VERSION");
    }, []);

    return (
        <div className="h-full bg-white/50">
            <div className="max-w-[1600px] h-full mx-auto flex flex-col p-4 md:p-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex flex-col"
                >
                    <VendorSupportChat />
                </motion.div>
            </div>
        </div>
    );
};

export default VendorAdminSupport;
