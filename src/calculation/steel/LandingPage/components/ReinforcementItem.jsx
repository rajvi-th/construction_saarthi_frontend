const ReinforcementItem = ({ title, icon, onClick, noBackground = false }) => {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 sm:gap-4 group cursor-pointer hover:bg-gray-50 p-1.5 sm:p-2 rounded-xl transition-all"
        >
            <div className={`w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 flex items-center justify-center ${!noBackground ? 'rounded-xl bg-[#F3F3F3] border border-[#B02E0C0A]' : ''}`}>
                <div className="flex items-center justify-center">
                    <img src={icon} alt={title} className={`${!noBackground ? 'w-7 h-7 sm:w-8 sm:h-8' : 'w-12 h-12 sm:w-14 sm:h-14'} object-contain`} />
                </div>
            </div>
            <span className="text-[13px] sm:text-sm font-medium text-[#060C12] whitespace-nowrap">
                {title}
            </span>
        </button>
    );
};

export default ReinforcementItem;
