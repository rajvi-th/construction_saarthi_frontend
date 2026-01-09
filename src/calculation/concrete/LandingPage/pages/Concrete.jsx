import React from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../../components/layout/PageHeader';
import ConcreteAccordion from '../components/ConcreteAccordion';
import { useNavigate } from 'react-router-dom';

// Section Components
import ByVolumeSection from '../components/ByVolumeSection';
import ColumnSection from '../components/ColumnSection';
import FootingSection from '../components/FootingSection';
import StaircaseSection from '../components/StaircaseSection';
import WallSection from '../components/WallSection';
import CurbedStoneSection from '../components/CurbedStoneSection';
import TubeSection from '../components/TubeSection';
import GutterSection from '../components/GutterSection';

const Concrete = () => {
    const { t } = useTranslation('calculation');
    const navigate = useNavigate();

    const handleItemClick = (itemTitle) => {
        // Check for Square Column
        if (itemTitle === t('concrete.column.squareColumn', { defaultValue: 'Concrete of Square Column' })) {
            navigate('/calculation/concrete/column/square');
            return;
        }
        
        // Check for Rectangular Column
        if (itemTitle === t('concrete.column.rectangularColumn', { defaultValue: 'Concrete of Rectangular Column' })) {
            navigate('/calculation/concrete/column/rectangular');
            return;
        }
        
        // Check for Round Column
        if (itemTitle === t('concrete.column.roundColumn', { defaultValue: 'Concrete of Round Column' })) {
            navigate('/calculation/concrete/column/round');
            return;
        }
        
        // Check for Box Footing
        if (itemTitle === t('concrete.footing.boxFooting', { defaultValue: 'Concrete of Box Footing' })) {
            navigate('/calculation/concrete/footing/box');
            return;
        }
        
        // Check for Trapezoidal Footing
        if (itemTitle === t('concrete.footing.trapezoidalFooting', { defaultValue: 'Concrete of Trapezoidal Footing' })) {
            navigate('/calculation/concrete/footing/trapezoidal');
            return;
        }

        // Check for Straight Staircase
        if (itemTitle === t('concrete.staircase.straightStaircase')) {
            navigate('/calculation/concrete/staircase/straight');
            return;
        }

        // Check for Dog Legged Staircase
        if (itemTitle === t('concrete.staircase.dogLeggedStaircase')) {
            navigate('/calculation/concrete/staircase/dog-legged');
            return;
        }

        // Check for Wall Shape 1
        if (itemTitle === t('concrete.wall.wallShape1')) {
            navigate('/calculation/concrete/wall/shape1');
            return;
        }

        // Check for Wall Shape 2
        if (itemTitle === t('concrete.wall.wallShape2')) {
            navigate('/calculation/concrete/wall/shape2');
            return;
        }
        
        // Navigate to coming soon page for other items
        navigate('/calculation/coming-soon', {
            state: {
                title: itemTitle,
                pageName: itemTitle,
            },
        });
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <PageHeader
                    title={t('quickActions.items.concrete')}
                    showBackButton
                    onBack={() => navigate(-1)}
                />
            </div>

            <div className="">
                <ConcreteAccordion title={t('concrete.sections.byVolume')} defaultOpen={true}>
                    <ByVolumeSection onItemClick={handleItemClick} />
                </ConcreteAccordion>

                <ConcreteAccordion title={t('concrete.sections.column')}>
                    <ColumnSection onItemClick={handleItemClick} />
                </ConcreteAccordion>

                <ConcreteAccordion title={t('concrete.sections.footing')}>
                    <FootingSection onItemClick={handleItemClick} />
                </ConcreteAccordion>

                <ConcreteAccordion title={t('concrete.sections.staircase')}>
                    <StaircaseSection onItemClick={handleItemClick} />
                </ConcreteAccordion>

                <ConcreteAccordion title={t('concrete.sections.wall')}>
                    <WallSection onItemClick={handleItemClick} />
                </ConcreteAccordion>

                <ConcreteAccordion title={t('concrete.sections.curbedStone')}>
                    <CurbedStoneSection onItemClick={handleItemClick} />
                </ConcreteAccordion>

                <ConcreteAccordion title={t('concrete.sections.tube')}>
                    <TubeSection onItemClick={handleItemClick} />
                </ConcreteAccordion>

                <ConcreteAccordion title={t('concrete.sections.gutter')}>
                    <GutterSection onItemClick={handleItemClick} />
                </ConcreteAccordion>
            </div>
        </div>
    );
};

export default Concrete;

