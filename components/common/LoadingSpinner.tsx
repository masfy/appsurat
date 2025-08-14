
import React from 'react';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium', className = '' }) => {
    const sizeClasses = {
        small: 'w-5 h-5 border-2',
        medium: 'w-8 h-8 border-4',
        large: 'w-16 h-16 border-4',
    };

    return (
        <div className={`
            ${sizeClasses[size]} 
            border-blue-500 
            border-t-transparent 
            rounded-full 
            animate-spin
            ${className}
        `}></div>
    );
};

export default LoadingSpinner;
