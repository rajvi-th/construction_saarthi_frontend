const ReinforcementItem = ({ title, icon, onClick, noBackground = false }) => {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-4 group cursor-pointer hover:bg-gray-50 p-2 rounded-xl"
        >
            <div className={`w-16 h-16 flex-shrink-0 flex items-center justify-center ${!noBackground ? 'rounded-xl bg-[#F3F3F3] border border-[#B02E0C0A]' : ''}`}>
                <div className="flex items-center justify-center">
                    <img src={icon} alt={title} className={`${!noBackground ? 'w-8 h-8' : 'w-16 h-16'} object-contain`} />
                </div>
            </div>
            <span className="text-sm font-medium text-[#060C12] whitespace-nowrap">
                {title}
            </span>
        </button>
    );
};

export default ReinforcementItem;
