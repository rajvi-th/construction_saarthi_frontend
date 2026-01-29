/**
 * AddProjectSteps
 * Sidebar showing step circles and titles for Add New Project flow
 */

import CircularProgress from '../../../components/ui/CircularProgress';

function AddProjectSteps({ steps, currentStep, onStepClick, isEditMode, maxStepAccessed = 1 }) {
  const optionalText = '(Optional)';

  const renderTitle = (title) => {
    const [before, after] = title.split(optionalText);

    if (!title.includes(optionalText)) {
      return title;
    }

    return (
      <>
        {before}
        <span className="text-primary-light text-sm">{optionalText}</span>
        {after}
      </>
    );
  };

  const renderStepCircle = (stepIndex, size = 44) => {
    const totalSteps = steps.length;
    const percentage = ((stepIndex + 1) / totalSteps) * 100;
    const isActive = currentStep === stepIndex + 1;

    return (
      <div className="relative flex-shrink-0">
        <div className='flex items-center justify-center'>
          <CircularProgress
            percentage={percentage}
            size={size}
            strokeWidth={3}
            showPercentage={false}
            backgroundColor={isActive ? '#E7D7C1' : '#E7D7C1'}
            className={`${isActive ? '' : 'opacity-80'} flex items-center justify-center`}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[9px] 2xl:text-xs font-medium text-primary">
            {stepIndex + 1} of {totalSteps}
          </span>
        </div>
      </div>
    );
  };

  const currentStepData = steps.find(s => s.id === currentStep) || steps[0];
  const nextStepData = steps.find(s => s.id === currentStep + 1);

  return (
    <aside className="w-full 2xl:w-1/4 2xl:sticky 2xl:top-20 h-fit">
      {/* Mobile Compact View (sm) - Matching User Images */}
      <div className="block md:hidden mb-4 px-0">
        <div className="bg-[#FAF6F1] rounded-[24px] p-5 flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <CircularProgress
              percentage={(currentStep / steps.length) * 100}
              size={64}
              strokeWidth={5}
              showPercentage={false}
              backgroundColor="#E7D7C1"
              color="#B02E0C"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[12px] font-bold text-primary">
                {currentStep} of {steps.length}
              </span>
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="text-[18px] font-bold text-primary leading-tight">
              {renderTitle(currentStepData.title)}
            </h3>
            {nextStepData && (
              <p className="text-[13px] text-primary/40 mt-0.5 font-medium leading-tight">
                Next: {nextStepData.title.replace(optionalText, '').trim()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tablet/Desktop View (md and up) */}
      <div className="hidden md:flex bg-white rounded-2xl p-2 2xl:p-4 flex-row 2xl:flex-col gap-2 2xl:gap-4 overflow-x-auto 2xl:overflow-x-visible no-scrollbar">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isFuture = !isEditMode && step.id > maxStepAccessed;

          return (
            <div
              key={step.id}
              onClick={() => (isEditMode || !isFuture) && onStepClick?.(step.id)}
              className={`flex items-center gap-1.5 sm:gap-3 rounded-2xl px-1.5 2xl:px-3 py-2 2xl:py-3 transition-colors flex-1 2xl:flex-initial min-w-0 2xl:min-w-0 ${isActive ? 'bg-soft' : 'bg-white hover:bg-soft/20'
                } ${isFuture ? 'opacity-50 pointer-events-none cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="hidden 2xl:block">
                {renderStepCircle(index, 56)}
              </div>
              <div className="block 2xl:hidden">
                {renderStepCircle(index, 36)}
              </div>

              <div className="min-w-0 overflow-hidden">
                <p className="text-[9px] sm:text-xs text-primary-light mb-0 sm:mb-1 whitespace-nowrap">
                  {`Step ${step.id}`}
                </p>
                <p className="text-[10px] sm:text-sm 2xl:text-base font-medium text-primary leading-tight sm:leading-snug truncate 2xl:whitespace-normal">
                  {renderTitle(step.title)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

export default AddProjectSteps;


