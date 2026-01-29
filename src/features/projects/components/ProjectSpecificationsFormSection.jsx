/**
 * ProjectSpecificationsFormSection
 * Middle card for Add New Project - key project specification fields
 */

import Button from '../../../components/ui/Button';
import Dropdown from '../../../components/ui/Dropdown';
import Radio from '../../../components/ui/Radio';
import FormInput from '../../../components/forms/FormInput';
import FormTextarea from '../../../components/forms/FormTextarea';
import ConstructionTypeModal from './ConstructionTypeModal';
import ContractTypeModal from './ContractTypeModal';

function ProjectSpecificationsFormSection({
  t,
  register,
  errors,
  areaUnit,
  setAreaUnit,
  constructionType,
  onConstructionTypeChange,
  constructionTypeOptions = [],
  isLoadingConstructionTypes = false,
  onAddNewConstructionType,
  contractType,
  onContractTypeChange,
  contractTypeOptions = [],
  isLoadingContractTypes = false,
  onAddNewContractType,
  onSaveAndContinue,
  onBack,
  onCancel,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 md:p-7.5">
      <h2 className="text-base sm:text-lg font-semibold text-primary mb-4">
        {t('addNewProject.steps.projectSpecifications')}
      </h2>

      <div className="space-y-4">
        {/* Total Area + Unit Toggle */}
        <div>
          <p className="block text-sm font-medium text-primary font-normal mb-2">
            {t('addNewProject.form.totalArea')}
          </p>
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="inline-flex items-center gap-3 rounded-full px-2 py-1">
              <Radio
                name="areaUnit"
                value="sqft"
                label={t('addNewProject.form.areaUnitSqft')}
                checked={areaUnit === 'sqft'}
                onChange={() => setAreaUnit('sqft')}
                className="text-xs"
              />
              <Radio
                name="areaUnit"
                value="meter"
                label={t('addNewProject.form.areaUnitMeter')}
                checked={areaUnit === 'meter'}
                onChange={() => setAreaUnit('meter')}
                className="text-xs"
              />
            </div>

            <div className="flex-1">
              <FormInput
                label=""
                name="totalArea"
                placeholder={t('addNewProject.form.enterValue')}
                type="number"
                register={register}
                validationRules={{
                  min: {
                    value: 0,
                    message: t('addNewProject.validation.positiveNumberOnly')
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                    e.preventDefault();
                  }
                }}
                min={0}
                errors={errors}
              />
            </div>
          </div>
        </div>

        {/* Per Sq. Ft Rate */}
        <FormInput
          label={t('addNewProject.form.perSqFtRate')}
          name="perSqFtRate"
          type="number"
          placeholder={t('addNewProject.form.currencyPlaceholder')}
          register={register}
          validationRules={{
            min: {
              value: 0,
              message: t('addNewProject.validation.positiveNumberOnly')
            }
          }}
          onKeyDown={(e) => {
            if (e.key === '-' || e.key === 'e' || e.key === 'E') {
              e.preventDefault();
            }
          }}
          min={0}
          errors={errors}
          labelClassName="text-primary font-normal"
        />

        {/* Type of construction */}
        <div className="mb-4">
          <Dropdown
            label={t('addNewProject.form.constructionType')}
            value={constructionType}
            onChange={onConstructionTypeChange}
            required
            placeholder={isLoadingConstructionTypes ? t('addNewProject.form.loading') : t('addNewProject.form.selectType')}
            options={constructionTypeOptions}
            error={errors.constructionType?.message}
            disabled={isLoadingConstructionTypes}
            showSeparator={true}
            onAddNew={onAddNewConstructionType}
            addButtonLabel={t('addNewProject.form.addNew')}
            customModal={ConstructionTypeModal}
          />
        </div>

        {/* Number of floors */}
        <FormInput
          label={t('addNewProject.form.numberOfFloors')}
          name="noOfFloors"
          type="number"
          placeholder={t('addNewProject.form.numberOfFloorsPlaceholder')}
          register={register}
          validationRules={{
            min: {
              value: 0,
              message: t('addNewProject.validation.positiveNumberOnly')
            }
          }}
          onKeyDown={(e) => {
            if (e.key === '-' || e.key === 'e' || e.key === 'E') {
              e.preventDefault();
            }
          }}
          min={0}
          errors={errors}
          labelClassName="text-primary font-normal"
        />

        {/* Contract Type */}
        <div className="mb-4">
          <Dropdown
            label={t('addNewProject.form.contractType')}
            value={contractType}
            onChange={onContractTypeChange}
            required
            placeholder={isLoadingContractTypes ? t('addNewProject.form.loading') : t('addNewProject.form.selectType')}
            options={contractTypeOptions}
            error={errors.contractType?.message}
            disabled={isLoadingContractTypes}
            showSeparator={true}
            onAddNew={onAddNewContractType}
            addButtonLabel={t('addNewProject.form.addNew')}
            customModal={ContractTypeModal}
          />
        </div>

        {/* Estimated Budget */}
        <FormInput
          label={t('addNewProject.form.estimatedBudget')}
          name="estimatedBudget"
          type="number"
          placeholder={t('addNewProject.form.currencyPlaceholder')}
          register={register}
          required
          validationRules={{
            required: t("addNewProject.validation.estimatedBudgetRequired") || "Estimated budget is required",
            min: {
              value: 0,
              message: t('addNewProject.validation.positiveNumberOnly')
            }
          }}
          onKeyDown={(e) => {
            if (e.key === '-' || e.key === 'e' || e.key === 'E') {
              e.preventDefault();
            }
          }}
          min={0}
          errors={errors}
          labelClassName="text-primary font-normal"
        />

        {/* Project Description */}
        <FormTextarea
          label={t('addNewProject.form.projectDescription')}
          name="projectDescription"
          placeholder={t('addNewProject.form.writeDescription')}
          rows={4}
          register={register}
          errors={errors}
          labelClassName="text-primary font-normal"
        />
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-row justify-between md:justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="hidden md:flex px-6"
            onClick={onCancel}
          >
            {t('cancel', { ns: 'common' })}
          </Button>
        )}

        <div className="flex flex-row gap-3 w-full md:w-auto">
          {onBack && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="md:hidden flex-1 px-6"
              onClick={onBack}
            >
              {t('common:back', { defaultValue: 'Back' })}
            </Button>
          )}
          {onSaveAndContinue && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="flex-1 md:w-auto px-6"
              onClick={onSaveAndContinue}
            >
              {t('addNewProject.form.saveAndContinue', { defaultValue: 'Next' })}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectSpecificationsFormSection;


