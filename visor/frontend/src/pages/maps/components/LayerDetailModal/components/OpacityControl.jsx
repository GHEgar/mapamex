import { useState, useRef, useEffect } from 'react';
import { useOutsideClick } from '@hooks/useOutsideClick';
import Bar from '@components/Bar';

const OpacityControl = ({ value = 1, onChange }) => {
    const currentPercentage = Math.round(value * 100);
    const [inputValue, setInputValue] = useState(currentPercentage.toString());
    const [isExpanded, setIsExpanded] = useState(false);
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    useOutsideClick([containerRef], () => {
        if (isExpanded) {
            const numValue = parseInt(inputValue, 10);
            if (!isNaN(numValue)) {
                const clampedValue = Math.max(0, Math.min(100, numValue));
                onChange?.(clampedValue / 100);
                setInputValue(clampedValue.toString());
            } else {
                setInputValue(currentPercentage.toString());
            }
            setIsExpanded(false);
        }
    });

    useEffect(() => {
        if (isExpanded && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isExpanded]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isExpanded) {
                setInputValue(currentPercentage.toString());
                setIsExpanded(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isExpanded, currentPercentage]);

    const handleSliderChange = (e) => {
        const percentage = parseInt(e.target.value, 10);
        onChange?.(percentage / 100);
        setInputValue(percentage.toString());
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleInputBlur = () => {
        const numValue = parseInt(inputValue, 10);
        if (!isNaN(numValue)) {
            const clampedValue = Math.max(0, Math.min(100, numValue));
            onChange?.(clampedValue / 100);
            setInputValue(clampedValue.toString());
        } else {
            setInputValue(currentPercentage.toString());
        }
    };

    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleInputBlur();
        }
    };

    const handlePercentageClick = () => {
        setInputValue(currentPercentage.toString());
        setIsExpanded(true);
    };

    return (
        <div ref={containerRef} className="space-y-2">
            <div className="flex items-center gap-1">
                <span className="text-graphite font-sans font-medium text-sm leading-4 md:mr-4 mr-1">
                    <span className="sm:hidden">Opacidad:</span>
                    <span className="hidden sm:inline">Opacidad de la capa:</span>
                </span>
                {isExpanded ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onKeyDown={handleInputKeyDown}
                        className={`
                            w-17 h-12.5 text-center font-sans font-medium text-sm leading-4 text-graphite 
                            bg-white rounded-2xl px-3-5 py-3 outline-none border border-primary-deep 
                            cursor-pointer
                        `}
                    />
                ) : (
                    <button
                        type="button"
                        onClick={handlePercentageClick}
                        className={`
                            w-17 h-12.5 font-sans font-medium text-sm leading-4 text-graphite transition 
                            bg-slate-100 rounded-2xl px-3-5 py-3 cursor-pointer
                        `}
                    >
                        {currentPercentage}%
                    </button>
                )}
            </div>
            {isExpanded && (
                <Bar
                    min={0}
                    max={100}
                    value={currentPercentage}
                    onChange={handleSliderChange}
                />
            )}
        </div>
    );
};

export default OpacityControl;
