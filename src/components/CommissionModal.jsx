import React, { useState, useEffect } from 'react';

const CommissionModal = ({ isOpen, onClose, onSave, currentRate, title, subtitle }) => {
    const [rate, setRate] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Convert decimal rate (0.002) back to percentage string (0.2)
            // Using toFixed(4) to avoid floating point issues, then trimming zeros
            const pct = (currentRate * 100).toFixed(4).replace(/\.?0+$/, '');
            setRate(pct);
        }
    }, [isOpen, currentRate]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(rate);
    };

    return (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-primary">{title || 'Update Commission'}</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-1">{subtitle || 'Financial Adjustment'}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white transition-colors text-gray-400 hover:text-primary shadow-sm"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="block text-[10px] uppercase font-black text-gray-400 mb-3 tracking-widest">Commission Rate (%)</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.001"
                                value={rate}
                                onChange={(e) => setRate(e.target.value)}
                                placeholder="e.g. 0.2"
                                autoFocus
                                className="w-full text-2xl font-black text-primary border-b-2 border-gray-100 py-3 outline-none focus:border-secondary transition-colors pr-8 bg-transparent"
                            />
                            <span className="absolute right-0 bottom-4 text-xl font-black text-gray-300">%</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold mt-3 leading-relaxed">
                            Entering <span className="text-primary">0.2</span> will set the commission to <span className="text-primary">0.2%</span> of the product price.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-white border border-gray-100 text-gray-400 text-[10px] font-black uppercase py-4 rounded-2xl hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-primary text-white text-[10px] font-black uppercase py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Save Rate
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CommissionModal;

