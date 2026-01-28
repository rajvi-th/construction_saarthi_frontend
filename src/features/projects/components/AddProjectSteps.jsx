/**
 * AddProjectSteps
 * Sidebar showing step circles and titles for Add New Project flow
 */

import CircularProgress from '../../../components/ui/CircularProgress';

function AddProjectSteps({ steps, currentStep, onStepClick, isEditMode }) {
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

  const renderStepCircle = (stepIndex) => {
    const totalSteps = steps.length;
    const percentage = ((stepIndex + 1) / totalSteps) * 100;
    const isActive = currentStep === stepIndex + 1;

    return (
      <div className="relative">
        <div className='flex'>
          <CircularProgress
            percentage={percentage}
            size={56}
            strokeWidth={4}
            showPercentage={false}
            // color={isActive ? '#B02E0C' : undefined}
            backgroundColor={isActive ? '#E7D7C1' : '#E7D7C1'}
            className={`${isActive ? '' : 'opacity-80'} flex items-center justify-center`}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-medium text-primary">
            {stepIndex + 1} of {totalSteps}
          </span>
        </div>
      </div>
    );
  };

  return (
    <aside className="w-full lg:w-1/3 xl:w-1/4 lg:sticky lg:top-20 h-fit">
      <div className="bg-white rounded-2xl p-4 space-y-4">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const isFuture = !isEditMode && step.id > currentStep;

          return (
            <div
              key={step.id}
              onClick={() => (isEditMode || !isFuture) && onStepClick?.(step.id)}
              className={`flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors ${isActive ? 'bg-soft' : 'bg-white hover:bg-soft/20'
                } ${isFuture ? 'opacity-50 pointer-events-none cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {renderStepCircle(index)}

              <div>
                <p className="text-sm text-primary-light mb-1">
                  {`Step ${step.id}`}
                </p>
                <p className="sm:text-base font-medium text-primary leading-snug">
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


