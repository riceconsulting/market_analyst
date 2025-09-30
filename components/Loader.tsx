import React, { useState, useEffect } from 'react';

interface LoaderProps {
    messages?: string[];
}

const DEFAULT_MESSAGES = [
    "Menganalisis data pasar...",
    "Memindai tren media sosial...",
    "Mengevaluasi sentimen pelanggan...",
    "Menyusun wawasan strategis...",
    "Hampir selesai..."
];

const Loader: React.FC<LoaderProps> = ({ messages = DEFAULT_MESSAGES }) => {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
        }, 2000); // Change message every 2 seconds

        return () => clearInterval(intervalId);
    }, [messages.length]);

    return (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-lg border border-slate-200 shadow-sm">
            <svg className="animate-spin h-10 w-10 text-sky-600 mb-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-lg font-medium text-slate-700 transition-opacity duration-300">{messages[currentMessageIndex]}</p>
            <p className="text-sm text-slate-500 mt-1">AI sedang bekerja, mohon tunggu sejenak.</p>
        </div>
    );
};

export default Loader;