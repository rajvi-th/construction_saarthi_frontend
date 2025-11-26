/**
 * DropdownMenu Component
 * Reusable dropdown menu component that can be used anywhere in the app
 */

import { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export default function DropdownMenu({
    trigger,
    items = [],
    position = 'right', // 'right' | 'left'
    className = '',
    onOpen,
    onClose,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
                onClose?.();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            onOpen?.();
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onOpen, onClose]);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            onOpen?.();
        } else {
            onClose?.();
        }
    };

    const handleItemClick = (item) => {
        if (item.onClick) {
            item.onClick();
        }
        setIsOpen(false);
        onClose?.();
    };

    const positionClasses = {
        right: 'right-0',
        left: 'left-0',
    };

    return (
        <div className={`relative ${className}`} ref={menuRef}>
            {/* Trigger Button */}
            {trigger ? (
                <div onClick={toggleMenu} className="cursor-pointer">
                    {trigger}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={toggleMenu}
                    className="p-1 sm:p-2 cursor-pointer"
                    aria-label="More options"
                >
                    <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </button>
            )}

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className={`absolute ${positionClasses[position]} top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[180px] `}
                >
                    {items.map((item, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleItemClick(item)}
                            className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors cursor-pointer disabled:cursor-not-allowed rounded-lg"
                            disabled={item.disabled}
                        >
                            {item.icon && (
                                <span className={item.iconClassName || ''}>
                                    {item.icon}
                                </span>
                            )}
                            <span
                                className={`text-sm ${
                                    item.textColor || 'text-gray-700'
                                }`}
                            >
                                {item.label}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

