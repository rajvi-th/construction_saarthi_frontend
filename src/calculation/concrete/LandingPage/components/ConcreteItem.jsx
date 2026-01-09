const ConcreteItem = ({ title, icon, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 sm:gap-4 group cursor-pointer  p-1.5 sm:p-2 rounded-xl transition-all"
        >
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center">
                <img src={icon} alt={title} className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
            </div>
            <span className="text-[13px] sm:text-sm font-medium text-[#060C12] whitespace-nowrap">
                {title}
            </span>
        </button>
    );
};

export default ConcreteItem;

