
import React from 'react';

interface ErrorMessageProps {
    title?: string;
    message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ title = "Terjadi Kesalahan", message }) => {
    return (
        <div className="bg-error-light dark:bg-error-dark border border-error-light dark:border-error-dark text-error-light dark:text-error-dark rounded-lg p-4    animate-pop-in" role="alert">
            <div className="flex">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-error-light dark:text-error-dark">{title}</h3>
                    <div className="mt-2 text-sm text-error-light dark:text-error-dark">
                        <p>{message}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ErrorMessage;