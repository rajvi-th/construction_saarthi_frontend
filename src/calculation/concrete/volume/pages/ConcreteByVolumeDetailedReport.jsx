import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageHeader from "../../../../components/layout/PageHeader";
import DownloadPDFModal from "../../../common/DownloadPDFModal";
import { useState } from "react";

const ConcreteByVolumeDetailedReport = () => {
  const { t } = useTranslation("calculation");
  const location = useLocation();
  const navigate = useNavigate();
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  // Get data from location state or use default values
  const data = location.state || {
    volume: "5.097",
    concreteGrade: "M10",
    waterCementRatio: "0.55",
    admixture: "1",
    noOfUnits: "1",
    dryVolume: "1.55",
    rateOfConcrete: "8750",
    unit: "metric",
    pageTitle: null,
  };

  // Get page title from state or use default
  const baseTitle = data.pageTitle || t("concrete.byVolume.concreteByVolume", {
    defaultValue: "Concrete by Volume",
  });
  const pageTitle = `${baseTitle} ${t("concrete.byVolume.detailedReport", {
    defaultValue: "Detailed Report",
  })}`;

  // Calculate values based on M10 mix ratio (1:3.92:5.62:0.01)
  const volume = parseFloat(data.volume) || 5.097;
  const dryVolume = parseFloat(data.dryVolume) || 1.55;
  const waterCementRatio = parseFloat(data.waterCementRatio) || 0.55;
  const admixtureRatio = parseFloat(data.admixture) / 100 || 0.01;

  // Mix ratio for M10: 1:3.92:5.62:0.01 (Cement:Sand:Aggregate:Admixture)
  const cementPart = 1.0;
  const sandPart = 3.92;
  const aggregatePart = 5.62;
  const admixturePart = 0.01;

  const concreteParts = cementPart + sandPart + aggregatePart + admixturePart; // 10.55

  // Calculations
  const cementVolume = (cementPart / concreteParts) * volume * dryVolume; // m³
  const sandVolume = (sandPart / concreteParts) * volume * dryVolume; // m³
  const aggregateVolume = (aggregatePart / concreteParts) * volume * dryVolume; // m³

  const cementDensity = 1440; // kg/m³
  const cementWeight = cementVolume * cementDensity; // kg
  const cementBags = cementWeight / 50; // bags

  const admixtureWeight = cementWeight * admixtureRatio; // kg

  const waterVolume = cementVolume * waterCementRatio; // m³
  const waterWeight = waterVolume * 1000; // Liters

  // Convert all materials to kg
  const cementWeightKg = cementWeight; // Already in kg
  const sandWeightKg = sandVolume * 1600; // Convert m³ to kg using 1600 kg/m³
  const aggregateWeightKg = aggregateVolume * 1500; // Convert m³ to kg using 1500 kg/m³
  const admixtureWeightKg = admixtureWeight; // Already in kg
  const waterWeightKg = waterWeight; // Already in kg (liters)

  // Calculate totalWeight as sum of all materials in kg
  const totalWeight =
    cementWeightKg +
    sandWeightKg +
    aggregateWeightKg +
    admixtureWeightKg +
    waterWeightKg;

  // Format percentages: show decimals for values < 10 (only if not whole number), whole numbers for >= 10
  // Match image exactly: 25%, 41%, 28%, 5%, 8.7%
  const formatPercent = (materialWeightKg) => {
    const percent = (materialWeightKg / totalWeight) * 100;
    if (percent < 10) {
      // For values < 10, show 1 decimal only if not a whole number
      // e.g., 8.7% shows as "8.7", but 5% shows as "5" (not "5.0")
      const rounded = Math.round(percent * 10) / 10; // Round to 1 decimal place
      if (rounded % 1 === 0) {
        return rounded.toString(); // Whole number, no decimal
      }
      return rounded.toFixed(1); // Has decimal, show 1 decimal place
    } else {
      return Math.round(percent).toString(); // Round and show no decimals for values >= 10 (e.g., 25%, 41%, 28%)
    }
  };

  // Calculate percentages for all materials
  const cementPercent = formatPercent(cementWeightKg);
  const sandPercent = formatPercent(sandWeightKg);
  const aggregatePercent = formatPercent(aggregateWeightKg);
  const admixturePercent = formatPercent(admixtureWeightKg);
  const waterPercent = formatPercent(waterWeightKg);

  const handleDownload = async (title) => {
    // TODO: Implement PDF download logic
    console.log("Download PDF with title:", title);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: t("concrete.byVolume.detailedReport", {
          defaultValue: "Concrete by Volume Detailed Report",
        }),
        text: "Concrete by Volume Detailed Report",
        url: window.location.href,
      });
    }
  };

  // Donut chart SVG
  const DonutChart = () => {
    const svgSize = 300; // Increased SVG size
    const outerRadius = 120; // Increased outer radius
    const innerRadius = 75; // Increased inner radius for donut hole
    const centerX = svgSize / 2; // 150
    const centerY = svgSize / 2; // 150
    let currentAngle = -90; // Start from top

    const colors = {
      cement: "#3B82F6", // Blue
      water: "#F6B100", // Orange (for 41%)
      aggregate: "#10B981", // Green
      admixture: "#A855F7", // Purple
      sand: "#EA580C", // Reddish-orange (for 8.7%)
    };

    const segments = [
      { percent: cementPercent, color: colors.cement, label: t("concrete.byVolume.cement", { defaultValue: "Cement" }) },
      { percent: waterPercent, color: colors.water, label: t("concrete.byVolume.water", { defaultValue: "Water" }) },
      {
        percent: aggregatePercent,
        color: colors.aggregate,
        label: t("concrete.byVolume.aggregate", { defaultValue: "Aggregate" }),
      },
      {
        percent: admixturePercent,
        color: colors.admixture,
        label: t("concrete.byVolume.admixture", { defaultValue: "Admixture" }),
      },
      { percent: sandPercent, color: colors.sand, label: t("concrete.byVolume.sand", { defaultValue: "Sand" }) },
    ].sort((a, b) => parseFloat(b.percent) - parseFloat(a.percent)); // Sort by percentage descending

    const createDonutPath = (startAngle, endAngle) => {
      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;

      // Outer arc points
      const outerStartX = centerX + outerRadius * Math.cos(startAngleRad);
      const outerStartY = centerY + outerRadius * Math.sin(startAngleRad);
      const outerEndX = centerX + outerRadius * Math.cos(endAngleRad);
      const outerEndY = centerY + outerRadius * Math.sin(endAngleRad);

      // Inner arc points
      const innerStartX = centerX + innerRadius * Math.cos(startAngleRad);
      const innerStartY = centerY + innerRadius * Math.sin(startAngleRad);
      const innerEndX = centerX + innerRadius * Math.cos(endAngleRad);
      const innerEndY = centerY + innerRadius * Math.sin(endAngleRad);

      const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

      // Create donut segment path
      return `
        M ${outerStartX} ${outerStartY}
        A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}
        L ${innerEndX} ${innerEndY}
        A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}
        Z
      `;
    };

    // Calculate label positions for each segment
    const getLabelPosition = (startAngle, endAngle) => {
      const midAngle = (startAngle + endAngle) / 2;
      const midAngleRad = (midAngle * Math.PI) / 180;
      const labelRadius = (outerRadius + innerRadius) / 2; // Middle of donut ring
      const x = centerX + labelRadius * Math.cos(midAngleRad);
      const y = centerY + labelRadius * Math.sin(midAngleRad);
      return { x, y, angle: midAngle };
    };

    return (
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8 bg-[#F9F4EE] rounded-2xl p-6">
        <div className="relative">
          <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
            {segments.map((segment, index) => {
              const startAngle = currentAngle;
              const angle = (parseFloat(segment.percent) / 100) * 360;
              const endAngle = currentAngle + angle;
              const path = createDonutPath(startAngle, endAngle);
              const labelPos = getLabelPosition(startAngle, endAngle);
              currentAngle = endAngle;

              return (
                <g key={index}>
                  <path
                    d={path}
                    fill={segment.color}
                    stroke="#F9F4EE"
                    strokeWidth="2"
                  />
                  {/* Percentage label on segment */}
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs font-semibold fill-white"
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      fill: '#FFFFFF',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    }}
                  >
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-base font-semibold text-primary">Kg/m³</span>
          </div>
        </div>
        <div className="space-y-2">
          {/* Legend sorted by percentage value */}
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm text-primary">
                {segment.label}: {segment.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <PageHeader
          title={pageTitle}
          showBackButton
          onBack={() => navigate(-1)}
        ></PageHeader>
      </div>

      <div className="space-y-6">
        {/* Donut Chart Section */}
        <div className="">
          <DonutChart />
        </div>

        {/* Concrete Calculator Calculations */}
        <div className="rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-medium text-primary mb-4 border-b border-gray-200 pb-2">
            {t("concrete.byVolume.calculatorCalculations", {
              defaultValue: "Concrete Calculator Calculations",
            })}
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-secondary">
                {t("concrete.byVolume.concreteVolume", {
                  defaultValue: "Concrete Volume",
                })}
                :
              </span>
              <span className="ml-2 font-medium text-primary">
                {volume.toFixed(3)} m³
              </span>
            </div>
            <div>
              <span className="text-secondary">
                {t("concrete.byVolume.dryVolume", {
                  defaultValue: "Dry Volume",
                })}
                :
              </span>
              <span className="ml-2 font-medium text-primary">
                {dryVolume.toFixed(2)} m³
              </span>
            </div>
            <div className="mt-2">
              <p className="text-secondary">
                {t("concrete.byVolume.calculateInstruction", {
                  defaultValue:
                    "Calculate Cement, Sand, Coarse Aggregate and admixture.",
                })}
              </p>
              <p className="text-primary font-medium mt-2">
                {t("concrete.byVolume.selectedMixture", {
                  defaultValue: "Selected concrete mixture design is",
                })}{" "}
                {data.concreteGrade}
              </p>
              <p className="text-primary font-medium mt-2">
                {t("concrete.byVolume.mixRatio", {
                  defaultValue: "Mix ratio for",
                })}{" "}
                {data.concreteGrade}{" "}
                {t("concrete.byVolume.is", { defaultValue: "is" })} 1:{sandPart}
                :{aggregatePart}:{admixturePart}
              </p>
              <p className="text-secondary mt-2 border-b border-gray-200 pb-2">
                {t("concrete.byVolume.calculatePartsInstruction", {
                  defaultValue: "Calculate concrete parts by using the formula",
                })}
              </p>
              <p className="text-primary font-medium mt-2 border-b border-gray-200 pb-2">
                {t("concrete.byVolume.concreteParts", {
                  defaultValue: "Concrete Parts",
                })}{" "}
                ={" "}
                {t("concrete.byVolume.cementPart", {
                  defaultValue: "Cement Part",
                })}{" "}
                +{" "}
                {t("concrete.byVolume.sandPart", { defaultValue: "Sand Part" })}{" "}
                +{" "}
                {t("concrete.byVolume.aggregatePart", {
                  defaultValue: "Aggregate Part",
                })}{" "}
                +{" "}
                {t("concrete.byVolume.admixture", {
                  defaultValue: "Admixture",
                })}
              </p>
              <p className="text-primary font-medium mt-2">
                {t("concrete.byVolume.concreteParts", {
                  defaultValue: "Concrete Parts",
                })}{" "}
                = {cementPart} + {sandPart} + {aggregatePart} + {admixturePart}{" "}
                = {concreteParts.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Cement Quantity */}
        <div className="rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-medium text-primary border-b border-gray-200 pb-2 mb-4">
            {t("concrete.byVolume.cementQuantity", {
              defaultValue: "Cement Quantity",
            })}
          </h2>
          <div className="space-y-3 text-sm">
            <p className="font-normal border-b border-gray-300 pb-2">
              {t("concrete.byVolume.calculateCementInstruction", {
                defaultValue: "Calculate cement quantity by using formula",
              })}
            </p>
            <p className="text-primary font-normal border-b border-gray-300 pb-2">
              {t("concrete.byVolume.cementQuantityFormula", {
                defaultValue: "Cement Quantity",
              })}{" "}
              = (
              {t("concrete.byVolume.cementPart", {
                defaultValue: "Cement Part",
              })}
              /
              {t("concrete.byVolume.concreteParts", {
                defaultValue: "Concrete Parts",
              })}
              ) ×{" "}
              {t("concrete.byVolume.concreteVolume", {
                defaultValue: "Concrete Volume",
              })}{" "}
              ×{" "}
              {t("concrete.byVolume.dryVolume", { defaultValue: "Dry Volume" })}
            </p>
            <p className="text-primary font-normal">
              {t("concrete.byVolume.cementQuantity", {
                defaultValue: "Cement Quantity",
              })}{" "}
              = ({cementPart}/{concreteParts.toFixed(2)}) × {volume.toFixed(3)}{" "}
              × {dryVolume.toFixed(2)} = {cementVolume.toFixed(4)} m³
            </p>
            <p className="text-primary font-normal mt-2">
              {t("concrete.byVolume.densityOfCement", {
                defaultValue: "Density of Cement",
              })}{" "}
              = {cementDensity} kg/m³
            </p>
            <p className="text-primary font-normal">
              {t("concrete.byVolume.weightOfCement", {
                defaultValue: "Weight of Cement",
              })}{" "}
              = {cementVolume.toFixed(3)} × {cementDensity} ={" "}
              {cementWeight.toFixed(3)} kg
            </p>
            <p className="text-primary font-normal mt-2">
              {t("concrete.byVolume.weightOfCementBags", {
                defaultValue: "Weight of Cement Bags",
              })}{" "}
              = 50 kg
            </p>
            <p className="text-primary font-normal">
              {t("concrete.byVolume.totalBags", { defaultValue: "Total Bags" })}{" "}
              = {cementWeight.toFixed(3)}/50 = {cementBags.toFixed(3)}{" "}
              {t("concrete.byVolume.cementBagsLabel", {
                defaultValue: "Cement Bags",
              })}
            </p>
          </div>
        </div>

        {/* Sand Quantity */}
        <div className="rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-medium text-primary mb-4 border-b border-gray-200 pb-2">
            {t("concrete.byVolume.sandQuantity", {
              defaultValue: "Sand Quantity",
            })}
          </h2>
          <div className="space-y-3 text-sm">
            <p className="text-primary border-b border-gray-300 pb-2">
              {t("concrete.byVolume.calculateSandInstruction", {
                defaultValue: "Calculate sand quantity by using formula",
              })}
            </p>
            <p className="text-primary font-normal">
              {t("concrete.byVolume.sandQuantity", {
                defaultValue: "Sand Quantity",
              })}{" "}
              = ({sandPart}/{concreteParts.toFixed(2)}) × {volume.toFixed(3)} ×{" "}
              {dryVolume.toFixed(2)} = {sandVolume.toFixed(3)} m³
            </p>
          </div>
        </div>

        {/* Aggregate Quantity */}
        <div className="rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-medium text-primary mb-4 border-b border-gray-200 pb-2">
            {t("concrete.byVolume.aggregateQuantity", {
              defaultValue: "Aggregate Quantity",
            })}
          </h2>
          <div className="space-y-3 text-sm">
            <p className="text-primary border-b border-gray-300 pb-2">
              {t("concrete.byVolume.calculateAggregateInstruction", {
                defaultValue: "Calculate aggregate quantity by using formula",
              })}
            </p>
            <p className="text-primary font-normal">
              {t("concrete.byVolume.aggregateQuantity", {
                defaultValue: "Aggregate Quantity",
              })}{" "}
              = ({aggregatePart}/{concreteParts.toFixed(2)}) ×{" "}
              {volume.toFixed(3)} × {dryVolume.toFixed(2)} ={" "}
              {aggregateVolume.toFixed(3)} m³
            </p>
          </div>
        </div>

        {/* Admixture Quantity */}
        <div className="rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-medium text-primary mb-4 border-b border-gray-200 pb-2">
            {t("concrete.byVolume.admixtureQuantity", {
              defaultValue: "Admixture Quantity",
            })}
          </h2>
          <div className="space-y-3 text-sm">
            <p className="text-primary border-b border-gray-300 pb-2">
              {t("concrete.byVolume.calculateAdmixtureInstruction", {
                defaultValue: "Calculate admixture quantity by using formula",
              })}
            </p>
            <p className="text-primary font-normal border-b border-gray-300 pb-2">
              {t("concrete.byVolume.admixtureQuantity", {
                defaultValue: "Admixture Quantity",
              })}{" "}
              ={" "}
              {t("concrete.byVolume.cementQuantity", {
                defaultValue: "Cement quantity",
              })}{" "}
              ×{" "}
              {t("concrete.byVolume.admixture", { defaultValue: "Admixture" })}
            </p>
            <p className="text-primary font-normal">
              {t("concrete.byVolume.admixtureQuantity", {
                defaultValue: "Admixture Quantity",
              })}{" "}
              = {cementWeight.toFixed(3)} × {admixtureRatio.toFixed(2)} ={" "}
              {admixtureWeight.toFixed(3)} kg
            </p>
          </div>
        </div>

        {/* Water Quantity */}
        <div className="rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-medium text-primary mb-4 border-b border-gray-200 pb-2">
            {t("concrete.byVolume.waterQuantity", {
              defaultValue: "Water Quantity",
            })}
          </h2>
          <div className="space-y-3 text-sm">
            <p className="text-primary border-b border-gray-300 pb-2">
              {t("concrete.byVolume.calculateWaterInstruction", {
                defaultValue: "Calculate water quantity by using formula",
              })}
            </p>
            <p className="text-primary font-normal border-b border-gray-300 pb-2">
              {t("concrete.byVolume.waterQuantity", {
                defaultValue: "Water Quantity",
              })}{" "}
              ={" "}
              {t("concrete.byVolume.cementVolume", {
                defaultValue: "Cement volume",
              })}
              *
              {t("concrete.byVolume.waterCementRatio", {
                defaultValue: "water cement ratio",
              })}
            </p>
            <p className="text-primary font-normal">
              {t("concrete.byVolume.waterQuantity", {
                defaultValue: "Water Quantity",
              })}{" "}
              = {cementVolume.toFixed(3)} × {waterCementRatio.toFixed(2)} ={" "}
              {waterVolume.toFixed(3)} m³
            </p>
            <p className="text-primary font-normal mt-2">
              {t("concrete.byVolume.unitWeightOfWater", {
                defaultValue: "Unit weight of water",
              })}{" "}
              = 1000 Liters/m³
            </p>
            <p className="text-primary font-normal">
              {t("concrete.byVolume.requiredAmountOfWater", {
                defaultValue: "Required amount of water",
              })}{" "}
              = {waterVolume.toFixed(3)} × 1000 = {waterWeight.toFixed(3)}{" "}
              {t("concrete.byVolume.liters", { defaultValue: "Liters" })}
            </p>
          </div>
        </div>

        {/* Summary Table */}

        <div className="text-xl font-medium text-primary mb-4 ">
          {t("concrete.byVolume.requiredQuantities", {
            defaultValue: "Therefore required quantities are as follows",
          })}
        </div>
        <div className="overflow-x-auto">
  <div className="border border-gray-200 rounded-2xl overflow-hidden ">
    <table className="w-full border-collapse">
      <thead className="bg-[#F7F7F7]">
        <tr className="border-b border-gray-200">
          <th className="text-left py-3 px-4 text-sm font-semibold text-primary border-r border-gray-200">
            {t("concrete.byVolume.material", {
              defaultValue: "Material",
            })}
          </th>
          <th className="text-left py-3 px-4 text-sm font-semibold text-primary">
            {t("concrete.byVolume.quantity", {
              defaultValue: "Quantity",
            })}
          </th>
        </tr>
      </thead>

      <tbody>
        <tr className="border-b border-gray-200">
          <td className="py-3 px-4 text-secondary border-r border-gray-200">
            {t("concrete.byVolume.cement", { defaultValue: "Cement" })}
          </td>
          <td className="py-3 px-4 font-medium text-primary">
            {cementWeight.toFixed(3)} Kg
          </td>
        </tr>

        <tr className="border-b border-gray-200">
          <td className="py-3 px-4 text-secondary border-r border-gray-200">
            {t("concrete.byVolume.sand", { defaultValue: "Sand" })}
          </td>
          <td className="py-3 px-4 font-medium text-primary">
            {sandVolume.toFixed(3)} m³
          </td>
        </tr>

        <tr className="border-b border-gray-200">
          <td className="py-3 px-4 text-secondary border-r border-gray-200">
            {t("concrete.byVolume.aggregate", {
              defaultValue: "Aggregate",
            })}
          </td>
          <td className="py-3 px-4 font-medium text-primary">
            {aggregateVolume.toFixed(3)} m³
          </td>
        </tr>

        <tr className="border-b border-gray-200">
          <td className="py-3 px-4 text-secondary border-r border-gray-200">
            {t("concrete.byVolume.admixture", {
              defaultValue: "Admixture",
            })}
          </td>
          <td className="py-3 px-4 font-medium text-primary">
            {admixtureWeight.toFixed(3)} kg
          </td>
        </tr>

        <tr>
          <td className="py-3 px-4 text-secondary border-r border-gray-200">
            {t("concrete.byVolume.water", { defaultValue: "Water" })}
          </td>
          <td className="py-3 px-4 font-medium text-primary">
            {waterWeight.toFixed(3)}{" "}
            {t("concrete.byVolume.liters", { defaultValue: "Liters" })}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

      </div>

      {/* Download PDF Modal */}
      <DownloadPDFModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onDownload={handleDownload}
        defaultTitle={t("concrete.byVolume.detailedReport", { defaultValue: "Detailed Report" })}
      />
    </div>
  );
};

export default ConcreteByVolumeDetailedReport;
