
import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XIcon } from './Icon';

interface NotificationProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            handleClose();
        }, 5000);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [message, type]);

    const handleClose = () => {
        setIsVisible(false);
        // Allow time for fade-out animation before calling onClose
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const config = {
        success: {
            bg: 'bg-green-500',
            icon: <CheckCircleIcon className="w-6 h-6 text-white" />
        },
        error: {
            bg: 'bg-red-500',
            icon: <XCircleIcon className="w-6 h-6 text-white" />
        },
        info: {
            bg: 'bg-blue-500',
            icon: <InformationCircleIcon className="w-6 h-6 text-white" />
        }
    };

    const { bg, icon } = config[type];

    return (
        <div
            className={`fixed bottom-5 right-5 z-50 flex items-center p-4 rounded-lg shadow-lg text-white ${bg} transition-all duration-300 ${
                isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-5 opacity-0'
            }`}
        >
            <div className="mr-3">{icon}</div>
            <div className="flex-1 mr-4 text-sm font-medium">{message}</div>
            <button onClick={handleClose} className="p-1 rounded-full hover:bg-white/20">
                <XIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default Notification;
