const ReinforcementItem = ({ title, icon, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-1 md:gap-3 group cursor-pointer hover:bg-gray-50 p-1.5 sm:p-2 rounded-xl transition-all"
        >
            <div className=" flex-shrink-0 flex items-center justify-center">
                <div className="flex items-center justify-center">
                    <img src={icon} alt={title} className="w-10 h-10 sm:w-14 sm:h-14 object-contain" />
                </div>
            </div>
            <span className="text-[13px] sm:text-sm font-medium text-[#060C12] whitespace-nowrap">
                {title}
            </span>
        </button>
    );
};

export default ReinforcementItem;