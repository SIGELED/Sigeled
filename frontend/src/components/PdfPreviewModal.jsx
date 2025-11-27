import { useEffect, useCallback } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { IoClose } from 'react-icons/io5';

export default function PdfPreviewModal({url, title = 'Documento', onClose}){
    const defaultLayout = defaultLayoutPlugin();

    const onEsc = useCallback((e) => {
        if(e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', onEsc);
        return () => document.removeEventListener('keydown', onEsc);
    }, [onEsc]);

    const stop = (e) => e.stopPropagation();

    return (
    <div className="fixed inset-0 z-[80]">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div
                role="dialog"
                aria-modal="true"
                className="w-full p-5 max-w-8xl rounded-2xl bg-[#101922] shadow-xl"
                onClick={stop}
                onMouseDown={stop} 
                >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                        <h4 className="text-xl font-semibold text-[#19F124] truncate">{title}</h4>
                        <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#1A2430] cursor-pointer transition-all duration-300 hover:text-red-700">
                            <IoClose size={24}/>
                        </button>
                    </div>

                    <div className="h-[80vh] bg-[#0D1520]">
                        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                        <Viewer fileUrl={url} plugins={[defaultLayout]} />
                        </Worker>
                    </div>
                </div>
            </div>
        </div>
    );
}