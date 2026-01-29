import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES_FLAT } from '../../../constants/routes';
import steelIcon from '../../../assets/icons/Steel.svg';
import concreteIcon from '../../../assets/icons/Concrete.svg';
import brickIcon from '../../../assets/icons/bticksWorks.svg';
import roofIcon from '../../../assets/icons/roofArea.svg';
import flooringIcon from '../../../assets/icons/flooring.svg';
import calculatorIcon from '../../../assets/icons/CalculatorMinimalistic.svg';
import waterTankIcon from '../../../assets/icons/waterTank.svg';
import excavationIcon from '../../../assets/icons/excavation.svg';
import waterProffingIcon from '../../../assets/icons/waterProffing.svg';
import metalCalIcon from '../../../assets/icons/metalCal.svg';
import railIcon from '../../../assets/icons/rail.svg';
import roadIcon from '../../../assets/icons/road.svg';
import paintIcon from '../../../assets/icons/paint.svg';
import diagonalsIcon from '../../../assets/icons/diagonals.svg';
import antiTermiteIcon from '../../../assets/icons/antiTermite.svg';
import acCapacityIcon from '../../../assets/icons/acCapacity.svg';
import solarIcon from '../../../assets/icons/solar.svg';

const TABS = ['quantity', 'area', 'volume', 'converter', 'study', 'quiz'];

const QUICK_ACTIONS = [
    { id: 1, key: 'constructionCost', icon: calculatorIcon },
    { id: 2, key: 'steelQuantities', icon: steelIcon, isLocked: true },
    { id: 3, key: 'concrete', icon: concreteIcon, isLocked: true },
    { id: 4, key: 'brickWorkPlaster', icon: brickIcon, isLocked: true },
    { id: 5, key: 'roofAreaPitch', icon: roofIcon, isLocked: true },
    { id: 6, key: 'flooringCalculation', icon: flooringIcon, isLocked: true },
    { id: 7, key: 'waterTankCapacity', icon: waterTankIcon, isLocked: true },
    { id: 8, key: 'excavation', icon: excavationIcon, isLocked: true },
    { id: 9, key: 'swimmingPool', icon: waterTankIcon, isLocked: true },
    { id: 10, key: 'waterProofing', icon: waterProffingIcon, isLocked: true },
    { id: 11, key: 'metalCalculator', icon: metalCalIcon, isLocked: true },
    { id: 12, key: 'railConstruction', icon: railIcon, isLocked: true },
    { id: 13, key: 'roadCalculation', icon: roadIcon, isLocked: true },
    { id: 14, key: 'paint', icon: paintIcon, isLocked: true },
    { id: 15, key: 'diagonals', icon: diagonalsIcon, isLocked: true },
    { id: 16, key: 'antiTermite', icon: antiTermiteIcon, isLocked: true },
    { id: 17, key: 'acCapacity', icon: acCapacityIcon, isLocked: true },
    { id: 18, key: 'solarElectric', icon: solarIcon, isLocked: true },
    { id: 19, key: 'solarWaterHeater', isLocked: true },
    { id: 20, key: 'plywoodSheet', isLocked: true },
    { id: 21, key: 'plum', isLocked: true },
    { id: 22, key: 'rainWaterHarvesting', isLocked: true },
    { id: 23, key: 'shuttering', isLocked: true },
    { id: 24, key: 'baluster', isLocked: true },
    { id: 25, key: 'arcCalculator', isLocked: true },
    { id: 26, key: 'precastBoundaryWall', isLocked: true },
    { id: 27, key: 'damCalculations', isLocked: true },
    { id: 28, key: 'sewageSystem', isLocked: true },
    { id: 29, key: 'waterSupplySystem', isLocked: true },
    { id: 30, key: 'materialWeights', isLocked: true },
    { id: 31, key: 'billOfQuantity', isLocked: true },
];

const QuickActions = ({ fromDashboard, fromProjects }) => {
    const { t } = useTranslation('calculation');
    const [activeTab, setActiveTab] = useState('quantity');
    const navigate = useNavigate();

    const ROUTE_MAP = {
        constructionCost: {
            path: '/construction-cost',
        },
        railConstruction: {
            path: '/calculation/coming-soon',
            state: {
                title: 'Rail Construction',
                pageName: 'Rail Construction',
                pageColor: 'text-accent',
                fromDashboard,
                fromProjects,
            },
        },
        steelQuantities: {
            path: '/calculation/steel-quantities',
        },
        concrete: {
            path: '/calculation/concrete',
        },
        brickWorkPlaster: {
            path: '/calculation/brick-work-quantities',
        },
        roofAreaPitch: {
            path: '/calculation/roof-area-pitch',
        },
        flooringCalculation: {
            path: '/calculation/flooring',
        },
        waterTankCapacity: {
            path: '/calculation/water-tank',
        },
        excavation: {
            path: '/calculation/excavation',
        },
        swimmingPool: {
            path: '/calculation/swimming-pool',
        },
        waterProofing: {
            path: '/calculation/water-proofing',
        },
        metalCalculator: {
            path: ROUTES_FLAT.CALCULATION_METAL_QUANTITIES,
        },
    };

    const handleActionClick = (action) => {
        const title = t(`quickActions.items.${action.key}`);

        if (action.isLocked) {
            navigate('/calculation/coming-soon', {
                state: {
                    title,
                    pageName: title,
                    fromDashboard,
                    fromProjects,
                },
            });
            return;
        }

        const routeInfo = ROUTE_MAP[action.key];

        if (routeInfo) {
            navigate(routeInfo.path, {
                state: {
                    ...routeInfo.state,
                    fromDashboard,
                    fromProjects
                }
            });
            return;
        }

        // default: open generic coming soon with translated title (use title as pageName)
        navigate('/calculation/coming-soon', {
            state: {
                title,
                pageName: title,
                fromDashboard,
                fromProjects,
            },
        });
    };

    return (
        <div className="w-full">
            {/* Tabs */}
            <div className="flex gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
                            px-4 py-2 md:px-6 md:py-3 rounded-xl text-sm font-medium border transition-colors cursor-pointer whitespace-nowrap
                            ${activeTab === tab
                                ? 'bg-accent text-white border-accent'
                                : 'bg-[#F7F7F7] text-primary-light border-[#060C120F]'
                            }
                        `}
                    >
                        {t(`quickActions.tabs.${tab}`)}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
                {QUICK_ACTIONS.map((action) => {
                    const title = t(`quickActions.items.${action.key}`);
                    return (
                        <button
                            key={action.id}
                            onClick={() => handleActionClick(action)}
                            className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 transition-all flex flex-col items-center justify-center aspect-square relative cursor-pointer border border-[#F0F0F0] overflow-hidden"
                        >
                            {/* Ribbon for locked items */}
                            {action.isLocked && (
                                <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
                                    <div className="absolute top-[10px] right-[-15px] rotate-45 bg-[#D34526] h-[4px] w-[60px]" />
                                    <div className="absolute top-[16px] right-[-10px] rotate-45 bg-[#D34526] h-[4px] w-[60px]" />
                                </div>
                            )}

                            <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-3 sm:mb-4 border border-black-soft relative
                                ${action.isLocked ? 'bg-[#71717199]' : 'bg-[rgba(71,85,105,0.04)]'}
                            `}>
                                {action.isLocked ? (
                                    <>
                                        {action.icon && (
                                            <img
                                                src={action.icon}
                                                alt={title}
                                                className="w-5 h-5 sm:w-7 sm:h-7 object-contain opacity-40 grayscale"
                                            />
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                        </div>
                                    </>
                                ) : (
                                    <img
                                        src={action.icon}
                                        alt={title}
                                        className="w-5 h-5 sm:w-7 sm:h-7 object-contain"
                                    />
                                )}
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-primary text-center">
                                {title}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default QuickActions;
