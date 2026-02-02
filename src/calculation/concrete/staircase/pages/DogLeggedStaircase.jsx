import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../../components/layout/PageHeader";
import Input from "../../../../components/ui/Input";
import NumberInput from "../../../../components/ui/NumberInput";
import Select from "../../../../components/ui/Select";
import Button from "../../../../components/ui/Button";
import Radio from "../../../../components/ui/Radio";
import DownloadPDFModal from "../../../common/DownloadPDFModal";
import downloadIcon from "../../../../assets/icons/DownloadMinimalistic.svg";
import shareIcon from "../../../../assets/icons/Forward.svg";
import Staircase2Icon from "../../../../assets/icons/S2.svg";
import { ROUTES_FLAT } from "../../../../constants/routes";

const DogLeggedStaircase = () => {
  const { t } = useTranslation("calculation");
  const navigate = useNavigate();

  const [unit, setUnit] = useState("metric");

  // Form States
  const [rise, setRise] = useState("");
  const [tread, setTread] = useState("");
  const [width, setWidth] = useState("");
  const [baseDepth, setBaseDepth] = useState("");
  const [midDepth, setMidDepth] = useState("");
  const [topDepth, setTopDepth] = useState("");
  const [ExtraDepth, setExtraDepth] = useState("");
  const [lengthL1, setLengthL1] = useState("");
  const [lengthL2, setLengthL2] = useState("");
  const [lengthL3, setLengthL3] = useState("");
  const [totalStepsVolume, setTotalStepsVolume] = useState("");
  const [concreteGrade, setConcreteGrade] = useState("");

  const [waterCementRatio, setWaterCementRatio] = useState("");
  const [admixture, setAdmixture] = useState("");

  const [noOfUnits, setNoOfUnits] = useState("");
  const [dryVolume, setDryVolume] = useState("");
  const [rateOfConcrete, setRateOfConcrete] = useState("");

  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [results, setResults] = useState(null);
  const [resultUnit, setResultUnit] = useState("m3");

  const concreteGrades = [
    { value: "M10", label: "M10" },
    { value: "M15", label: "M15" },
    { value: "M20", label: "M20" },
    { value: "M25", label: "M25" },
    { value: "M30", label: "M30" },
  ];

  const handleCalculate = () => {
    // Mock results
    setResults({
      concreteVolume: "5.097",
      cement: "1078.348",
      cementBags: "21.567",
      sand: "2.936",
      aggregate: "4.209",
      admixture: "10.783",
      water: "411.669",
      totalCost: "44,567.33",
    });
  };

  const handleReset = () => {
    setRise("");
    setTread("");
    setWidth("");
    setBaseDepth("");
    setMidDepth("");
    setTopDepth("");
    setExtraDepth("");
    setLengthL1("");
    setLengthL2("");
    setLengthL3("");
    setTotalStepsVolume("");
    setConcreteGrade("");
    setWaterCementRatio("");
    setAdmixture("");
    setNoOfUnits("");
    setDryVolume("");
    setRateOfConcrete("");
    setResults(null);
  };

  return (
    <div className="max-w-7xl mx-auto pb-8">
      <div className="mb-6">
        <PageHeader
          title={t("concrete.staircase.dogLeggedStaircase", {
            defaultValue: "Concrete of Dog Legged Staircase",
          })}
          showBackButton
          onBack={() => navigate(-1)}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowDownloadModal(true)}
              className="p-2 cursor-pointer"
              aria-label="Download"
            >
              <img src={downloadIcon} alt="Download" className="w-5 h-5" />
            </button>
            <button className="p-2 cursor-pointer" aria-label="Share">
              <img src={shareIcon} alt="Share" className="w-5 h-5" />
            </button>
          </div>
        </PageHeader>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        <div className="bg-[#F9F4EE] rounded-xl p-4 space-y-4">
        <div className="border-b border-gray-200 pb-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <img
              src={Staircase2Icon}
              alt="Dog Legged Staircase Diagram"
              className="w-32"
            />
          </div>

          {/* Unit Selection */}
          <div className="flex-1 w-full">
            <div className="flex items-center gap-6 p-4">
              <Radio
                label={t("concrete.byVolume.metric", {
                  defaultValue: "Metric",
                })}
                name="unit"
                value="metric"
                checked={unit === "metric"}
                onChange={(e) => setUnit(e.target.value)}
              />
              <Radio
                label={t("concrete.byVolume.imperial", {
                  defaultValue: "Imperial",
                })}
                name="unit"
                value="imperial"
                checked={unit === "imperial"}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NumberInput
            placeholder={t("concrete.byVolume.rise_R", { defaultValue: "Rise - R" })}
            value={rise}
            onChange={(e) => setRise(e.target.value)}
            unit={unit === "metric" ? "m" : "ft"}
          />
          <NumberInput
            placeholder={t("concrete.byVolume.tread_T", { defaultValue: "Tread - T" })}
            value={tread}
            onChange={(e) => setTread(e.target.value)}
            unit={unit === "metric" ? "m" : "ft"}
          />
          <NumberInput
            placeholder={t("concrete.byVolume.width_W", { defaultValue: "Width - W" })}
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            unit={unit === "metric" ? "m" : "ft"}
          />
          <NumberInput
            placeholder={t("concrete.byVolume.baseDepth_D1", { defaultValue: "Base Depth - D1" })}
            value={baseDepth}
            onChange={(e) => setBaseDepth(e.target.value)}
            unit={unit === "metric" ? "m" : "ft"}
          />
          <NumberInput
            placeholder={t("concrete.byVolume.midDepth_D2", { defaultValue: "Mid Depth - D2" })}
            value={midDepth}
            onChange={(e) => setMidDepth(e.target.value)}
            unit={unit === "metric" ? "m" : "ft"}
          />
          <NumberInput
            placeholder={t("concrete.byVolume.topDepth_D3", { defaultValue: "Top Depth - D3" })}
            value={topDepth}
            onChange={(e) => setTopDepth(e.target.value)}
            unit={unit === "metric" ? "m" : "ft"}
          />
          <NumberInput
            placeholder={t("concrete.byVolume.depth_D3", { defaultValue: "Depth - D3" })} // Per image there is a second depth field
            value={ExtraDepth}
            onChange={(e) => setExtraDepth(e.target.value)}
            unit={unit === "metric" ? "m" : "ft"}
          />
          <NumberInput
            placeholder={t("concrete.byVolume.length_L1", { defaultValue: "Length - L1" })}
            value={lengthL1}
            onChange={(e) => setLengthL1(e.target.value)}
            unit={unit === "metric" ? "m" : "ft"}
          />
          <NumberInput
            placeholder={t("concrete.byVolume.length_L2", { defaultValue: "Length - L2" })}
            value={lengthL2}
            onChange={(e) => setLengthL2(e.target.value)}
            unit={unit === "metric" ? "m" : "ft"}
          />
          <NumberInput
            placeholder={t("concrete.byVolume.length_L3", { defaultValue: "Length - L3" })}
            value={lengthL3}
            onChange={(e) => setLengthL3(e.target.value)}
            unit={unit === "metric" ? "m" : "ft"}
          />

          <div className="md:col-span-2">
            <NumberInput
              placeholder={t("concrete.byVolume.totalSteps_N", { defaultValue: "Total Steps - N" })}
              value={totalStepsVolume}
              onChange={(e) => setTotalStepsVolume(e.target.value)}
              unit={t("concrete.byVolume.nos", { defaultValue: "NOs" })}
            />
          </div>

          <div className="md:col-span-2">
            <Select
              value={concreteGrade}
              onChange={(e) => setConcreteGrade(e.target.value)}
              options={concreteGrades}
              placeholder={t("concrete.byVolume.concreteGrade", { defaultValue: "Concrete Grade" })}
            />
          </div>
        </div>

        {/* Read-only Mix Ratio Display */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Input
              placeholder={t("concrete.byVolume.cement", { defaultValue: "Cement" })}
              value=""
              readOnly
              className="bg-gray-50 text-center"
            />
          </div>
          <div>
            <Input
              placeholder={t("concrete.byVolume.sand", { defaultValue: "Sand" })}
              value=""
              readOnly
              className="bg-gray-50 text-center"
            />
          </div>
          <div>
            <Input
              placeholder={t("concrete.byVolume.aggregate", { defaultValue: "Aggr." })}
              value=""
              readOnly
              className="bg-gray-50 text-center"
            />
          </div>
        </div>

        <div className="space-y-4">
          <NumberInput
            placeholder={t("concrete.byVolume.waterCementRatio", { defaultValue: "Water cement Ratio" })}
            value={waterCementRatio}
            onChange={(e) => setWaterCementRatio(e.target.value)}
          />
          <NumberInput
            placeholder={t("concrete.byVolume.admixture", { defaultValue: "Admixture" })}
            value={admixture}
            onChange={(e) => setAdmixture(e.target.value)}
            unit="%"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NumberInput
              placeholder={t("concrete.byVolume.noOfUnits", { defaultValue: "No of Units" })}
              value={noOfUnits}
              onChange={(e) => setNoOfUnits(e.target.value)}
            />
            <NumberInput
              placeholder={t("concrete.byVolume.dryVolume", { defaultValue: "Dry Volume" })}
              value={dryVolume}
              onChange={(e) => setDryVolume(e.target.value)}
            />
          </div>
          <NumberInput
            placeholder={t("concrete.byVolume.rateOfConcrete", { defaultValue: "Rate of Concrete" })}
            value={rateOfConcrete}
            onChange={(e) => setRateOfConcrete(e.target.value)}
            unit="₹/m³"
          />
        </div>{/* Footer Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            variant="secondary"
            onClick={handleReset}
          >
            {t("concrete.byVolume.reset", { defaultValue: "Reset" })}
          </Button>
          <Button
            variant="primary"
            onClick={handleCalculate}
          >
            {t("concrete.byVolume.calculate", { defaultValue: "Calculate" })}
          </Button>
        </div>
        </div>

        {/* Results Section */}
        {results && (
          <div>
            <h3 className="text-lg font-bold text-black mb-4">
              {t("concrete.byVolume.result", { defaultValue: "Result" })}
            </h3>

            {/* Unit Tabs */}
            <div className="flex gap-10 mb-4 border-b border-gray-200">
              {["m3", "ft3", "brass"].map((unit) => (
                <button
                  key={unit}
                  onClick={() => setResultUnit(unit)}
                  className={`relative px-8 pb-3 text-sm font-medium ${
                    resultUnit === unit
                      ? "text-accent"
                      : "text-secondary hover:text-primary"
                  }`}
                >
                  {unit === "m3"
                    ? t("concrete.byVolume.m3Unit", { defaultValue: "m³" })
                    : unit === "ft3"
                    ? t("concrete.byVolume.ft3Unit", { defaultValue: "ft³" })
                    : t("concrete.byVolume.brassUnit", { defaultValue: "Brass" })}
                  {resultUnit === unit && (
                    <span className="absolute left-0 bottom-0 w-full h-[2px] bg-accent"></span>
                  )}
                </button>
              ))}
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto mb-4">
              <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
                <table className="w-full border-collapse">
                  <thead className="bg-[#F7F7F7]">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-primary border-b border-r border-gray-200">
                        {t("concrete.byVolume.material", {
                          defaultValue: "Material",
                        })}
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-primary border-b border-r border-gray-200">
                        {t("concrete.byVolume.quantity", {
                          defaultValue: "Quantity",
                        })}
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-primary border-b border-gray-200">
                        {t("concrete.byVolume.unit", { defaultValue: "Unit" })}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      [t("concrete.byVolume.concreteVolume", { defaultValue: "Concrete Volume" }), results.concreteVolume, t("concrete.byVolume.m3Unit", { defaultValue: "m³" })],
                      [t("concrete.byVolume.cement", { defaultValue: "Cement" }), results.cement, t("history.units.kg", { defaultValue: "Kg" })],
                      [t("concrete.byVolume.cementBags", { defaultValue: "Cement (50kg)" }), results.cementBags, t("history.units.bags", { defaultValue: "bags" })],
                      [t("concrete.byVolume.sand", { defaultValue: "Sand" }), results.sand, t("concrete.byVolume.m3Unit", { defaultValue: "m³" })],
                      [t("concrete.byVolume.coarseAggregate", { defaultValue: "Coarse Aggregate" }), results.aggregate, t("concrete.byVolume.m3Unit", { defaultValue: "m³" })],
                      [t("concrete.byVolume.admixture", { defaultValue: "Admixture" }), results.admixture, t("history.units.kg", { defaultValue: "Kg" })],
                      [t("concrete.byVolume.water", { defaultValue: "Water" }), results.water, t("history.units.liters", { defaultValue: "Litre" })],
                    ].map(([label, value, unit], index) => (
                      <tr
                        key={index}
                        className="border-b last:border-b-0 border-gray-200"
                      >
                        <td className="p-3 text-secondary border-r border-gray-200">
                          {label}
                        </td>
                        <td className="p-3 text-secondary border-r border-gray-200">
                          {value}
                        </td>
                        <td className="p-3 text-secondary">{unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Cost and Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-[#F9F4EE] py-3 px-4 rounded-xl flex items-center justify-between">
                <span className="text-base font-normal text-primary">
                  {t("concrete.byVolume.totalCost", {
                    defaultValue: "Total Cost",
                  })}
                </span>
                <span className="text-xl font-medium text-accent">
                  ₹{results.totalCost}
                </span>
              </div>

              <Button
                variant="primary"
                onClick={() =>
                  navigate(ROUTES_FLAT.CALCULATION_CONCRETE_BY_VOLUME_DETAILED, {
                    state: {
                      volume: results.concreteVolume,
                      concreteGrade,
                      waterCementRatio,
                      admixture,
                      noOfUnits,
                      dryVolume,
                      rateOfConcrete,
                      unit,
                      pageTitle: t("concrete.staircase.dogLeggedStaircase", {
                        defaultValue: "Concrete of Dog Legged Staircase",
                      }),
                      ...results,
                    },
                  })
                }
                className="w-full rounded-xl bg-[#B02E0C]  text-white py-3"
              >
                {t("concrete.byVolume.viewDetailedResult", { defaultValue: "View Detailed Result" })}
              </Button>
            </div>
          </div>
        )}

        
      </div>

      <DownloadPDFModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        defaultTitle="Concrete of Dog Legged Staircase"
      />
    </div>
  );
};

export default DogLeggedStaircase;
