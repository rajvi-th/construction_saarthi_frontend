import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../../components/layout/PageHeader";
import NumberInput from "../../../../components/ui/NumberInput";
import Select from "../../../../components/ui/Select";
import Button from "../../../../components/ui/Button";
import Radio from "../../../../components/ui/Radio";
import DownloadPDFModal from "../../../common/DownloadPDFModal";
import downloadIcon from "../../../../assets/icons/DownloadMinimalistic.svg";
import Gshape2Icon from "../../../../assets/icons/G2.svg";
import { ROUTES_FLAT } from "../../../../constants/routes";

const ConcreteGutterShape2 = () => {
  const { t } = useTranslation("calculation");
  const navigate = useNavigate();

  const [unit, setUnit] = useState("metric");
  const [widthW, setWidthW] = useState("");
  const [heightH, setHeightH] = useState("");
  const [thicknessT, setThicknessT] = useState("");
  const [lengthL, setLengthL] = useState("");
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
    // Mock results for now
    setResults({
      concreteVolume: "5.097",
      cement: "1078.348",
      cementBags: "21.567",
      sand: "2.936",
      aggregate: "4.209",
      admixture: "10.783",
      water: "411.869",
      totalCost: "44,567.33",
    });
  };

  const handleReset = () => {
    setWidthW("");
    setHeightH("");
    setThicknessT("");
    setLengthL("");
    setConcreteGrade("");
    setWaterCementRatio("");
    setAdmixture("");
    setNoOfUnits("");
    setDryVolume("");
    setRateOfConcrete("");
    setResults(null);
  };

  const handleDownload = async (title) => {
    console.log("Download PDF with title:", title);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <PageHeader
          title={t("concrete.gutter.gutterShape2", { defaultValue: "Concrete of Gutter Shape 2" })}
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
          </div>
        </PageHeader>
      </div>

      <div>
        <div className="bg-[#F9F4EE] rounded-xl p-4">
          <div className="border-b border-gray-200 flex flex-col md:flex-row gap-6 pb-4 mb-4">
             <div>
                <img src={Gshape2Icon} alt="Gutter Shape 2" className="w-32 object-contain" />
             </div>
             <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-6">
                    <Radio
                    label={t("concrete.byVolume.metric", { defaultValue: "Metric" })}
                    name="unit"
                    value="metric"
                    checked={unit === "metric"}
                    onChange={(e) => setUnit(e.target.value)}
                    />
                    <Radio
                    label={t("concrete.byVolume.imperial", { defaultValue: "Imperial" })}
                    name="unit"
                    value="imperial"
                    checked={unit === "imperial"}
                    onChange={(e) => setUnit(e.target.value)}
                    />
                </div>
             </div>
          </div>

          <div className="space-y-4">
            <NumberInput
              placeholder={t("concrete.byVolume.width_W", { defaultValue: "Width - W" })}
              value={widthW}
              onChange={(e) => setWidthW(e.target.value)}
              unit={unit === "metric" ? "m" : "ft"}
            />
            <NumberInput
              placeholder={t("concrete.byVolume.height_H", { defaultValue: "Height - H" })}
              value={heightH}
              onChange={(e) => setHeightH(e.target.value)}
              unit={unit === "metric" ? "m" : "ft"}
            />
            <NumberInput
              placeholder={t("concrete.byVolume.thickness_T", { defaultValue: "Thickness - T" })}
              value={thicknessT}
              onChange={(e) => setThicknessT(e.target.value)}
              unit={unit === "metric" ? "m" : "ft"}
            />
            <NumberInput
              placeholder={t("concrete.byVolume.length_L", { defaultValue: "Length - L" })}
              value={lengthL}
              onChange={(e) => setLengthL(e.target.value)}
              unit={unit === "metric" ? "m" : "ft"}
            />

            <Select
              value={concreteGrade}
              onChange={(e) => setConcreteGrade(e.target.value)}
              options={concreteGrades}
              placeholder="M10"
            />

            <div className="grid grid-cols-3 gap-4">
              <NumberInput placeholder={t("concrete.byVolume.cement", { defaultValue: "Cement" })} value="" readOnly />
              <NumberInput placeholder={t("concrete.byVolume.sand", { defaultValue: "Sand" })} value="" readOnly />
              <NumberInput placeholder={t("concrete.byVolume.aggregate", { defaultValue: "Aggr." })} value="" readOnly />
            </div>

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

            <div className="grid grid-cols-2 gap-4">
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
              unit={`₹/${unit === "metric" ? "m³" : "ft³"}`}
            />
          </div>

          <div className="flex justify-end mt-4 gap-4">
            <Button variant="secondary" onClick={handleReset} className="bg-[#F2F2F2]">
              {t("concrete.byVolume.reset", { defaultValue: "Reset" })}
            </Button>
            <Button variant="primary" onClick={handleCalculate} className="">
              {t("concrete.byVolume.calculate", { defaultValue: "Calculate" })}
            </Button>
          </div>
        </div>

        {results && (
          <div className="pt-6">
            <h3 className="text-lg font-semibold text-primary mb-4">
              {t("concrete.byVolume.result", { defaultValue: "Result" })}
            </h3>

            <div className="flex gap-10 mb-4 border-b border-gray-200">
              {["m3", "ft3", "brass"].map((u) => (
                <button
                  key={u}
                  onClick={() => setResultUnit(u)}
                  className={`relative px-6 pb-3 text-sm font-medium ${
                    resultUnit === u ? "text-accent" : "text-secondary hover:text-primary"
                  }`}
                >
                  {u === "m3" ? "m³" : u === "ft3" ? "ft³" : "brass"}
                  {resultUnit === u && <span className="absolute left-0 bottom-0 w-full h-[2px] bg-accent"></span>}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto mb-4">
              <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
                <table className="w-full border-collapse">
                  <thead className="bg-[#F7F7F7]">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-primary border-b border-r border-gray-200">
                        {t("concrete.byVolume.material", { defaultValue: "Material" })}
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-primary border-b border-r border-gray-200">
                        {t("concrete.byVolume.quantity", { defaultValue: "Quantity" })}
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-primary border-b border-gray-200">
                        {t("concrete.byVolume.unit", { defaultValue: "Unit" })}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      [t("concrete.byVolume.concreteVolume", { defaultValue: "Concrete Volume" }), results.concreteVolume, "m³"],
                      [t("concrete.byVolume.cement", { defaultValue: "Cement" }), results.cement, "Kg"],
                      [t("concrete.byVolume.cementBags", { defaultValue: "Cement (50kg)" }), results.cementBags, "bags"],
                      [t("concrete.byVolume.sand", { defaultValue: "Sand" }), results.sand, "m³"],
                      [t("concrete.byVolume.coarseAggregate", { defaultValue: "Coarse Aggregate" }), results.aggregate, "m³"],
                      [t("concrete.byVolume.admixture", { defaultValue: "Admixture" }), results.admixture, "Kg"],
                      [t("concrete.byVolume.water", { defaultValue: "Water" }), results.water, "Litre"],
                    ].map(([label, value, u], index) => (
                      <tr key={index} className="border-b last:border-b-0 border-gray-200">
                        <td className="p-3 text-secondary border-r border-gray-200">{label}</td>
                        <td className="p-3 text-secondary border-r border-gray-200">{value}</td>
                        <td className="p-3 text-secondary">{u}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-[#F9F4EE] py-2 px-4 rounded-xl flex items-center justify-between">
                <span className="text-lg font-normal text-primary">
                  {t("concrete.byVolume.totalCost", { defaultValue: "Total Cost" })}
                </span>
                <span className="text-lg font-normal text-accent">₹{results.totalCost}</span>
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
                      pageTitle: t("concrete.gutter.gutterShape2", {
                        defaultValue: "Concrete of Gutter Shape 2",
                      }),
                      ...results,
                    },
                  })
                }
                className="rounded-2xl text-lg font-medium hover:bg-[#B02E0C] w-full"
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
        onDownload={handleDownload}
        defaultTitle={t("concrete.gutter.gutterShape2", { defaultValue: "Concrete of Gutter Shape 2" })}
      />
    </div>
  );
};

export default ConcreteGutterShape2;
