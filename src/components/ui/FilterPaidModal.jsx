/**
 * FilterPaidModal Component
 * Modal for filtering payment entries - matches design with custom dropdowns
 */

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { X, Plus, ChevronDown, Search } from "lucide-react";
import Button from "./Button";
import DatePicker from "./DatePicker";
import Input from "./Input";
import Dropdown from "./Dropdown";
import PhoneInput from "./PhoneInput";
import AddVendorModal from "./AddVendorModal";
import AddCategoryModal from "./AddCategoryModal";
import AddPaymentModeModal from "./AddPaymentModeModal";

export default function FilterPaidModal({
  isOpen,
  onClose,
  onApply,
  onReset,
  initialFilters = {},
  vendors = [],
  categories = [],
  modules = [],
  paymentModes = [],
  onAddVendor,
  onAddCategory,
}) {
  const { t } = useTranslation("finance");
  const [filters, setFilters] = useState({
    paidDate: null,
    paidTo: "",
    category: "",
    module: "",
    paymentMode: "",
  });

  // Dropdown open states
  const [isPaidToOpen, setIsPaidToOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isModuleOpen, setIsModuleOpen] = useState(false);
  const [isPaymentModeOpen, setIsPaymentModeOpen] = useState(false);

  // Vendor selection states
  const [vendorSearchQuery, setVendorSearchQuery] = useState("");
  const [showAddVendorForm, setShowAddVendorForm] = useState(false);
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);
  const [vendorName, setVendorName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [contactNumber, setContactNumber] = useState("");
  const [vendorErrors, setVendorErrors] = useState({});

  // Category selection states
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddPaymentModeModalOpen, setIsAddPaymentModeModalOpen] =
    useState(false);

  // Refs for dropdowns
  const paidToRef = useRef(null);
  const categoryRef = useRef(null);
  const moduleRef = useRef(null);
  const paymentModeRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setFilters({
        paidDate: initialFilters.paidDate || new Date(),
        paidTo: initialFilters.paidTo || "",
        category: initialFilters.category || "",
        module: initialFilters.module || "",
        paymentMode: initialFilters.paymentMode || "",
      });
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setIsPaidToOpen(false);
      setIsCategoryOpen(false);
      setIsModuleOpen(false);
      setIsPaymentModeOpen(false);
      setVendorSearchQuery("");
      setShowAddVendorForm(false);
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, initialFilters]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (paidToRef.current && !paidToRef.current.contains(event.target)) {
        setIsPaidToOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
      if (moduleRef.current && !moduleRef.current.contains(event.target)) {
        setIsModuleOpen(false);
      }
      if (
        paymentModeRef.current &&
        !paymentModeRef.current.contains(event.target)
      ) {
        setIsPaymentModeOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleKeyPress = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyPress);
      return () => document.removeEventListener("keydown", handleKeyPress);
    }
  }, [isOpen]);

  // Convert arrays to options
  const vendorOptions = vendors.map((vendor) => ({
    value:
      typeof vendor === "string"
        ? vendor
        : vendor.value || vendor.name || vendor,
    label:
      typeof vendor === "string"
        ? vendor
        : vendor.label || vendor.name || vendor,
  }));

  const categoryOptions = categories.map((category) => ({
    value:
      typeof category === "string"
        ? category
        : category.value || category.name || category,
    label:
      typeof category === "string"
        ? category
        : category.label || category.name || category,
  }));

  const moduleOptions = modules.map((module) => ({
    value:
      typeof module === "string"
        ? module
        : module.value || module.name || module,
    label:
      typeof module === "string"
        ? module
        : module.label || module.name || module,
  }));

  const paymentModeOptions = paymentModes.map((mode) => ({
    value: typeof mode === "object" ? mode.value : mode,
    label: typeof mode === "object" ? mode.label : mode,
  }));

  const handleAddPaymentModeSave = async (modeData) => {
    if (modeData?.name) {
      const modeValue = modeData.name.toLowerCase().replace(/\s+/g, "_");

      setFilters((prev) => ({
        ...prev,
        paymentMode: modeValue,
      }));
    }
    setIsAddPaymentModeModalOpen(false);
  };

  // Filter vendors based on search
  const filteredVendors = vendorOptions.filter((vendor) =>
    vendor.label.toLowerCase().includes(vendorSearchQuery.toLowerCase())
  );

  const selectedVendor = vendorOptions.find((v) => v.value === filters.paidTo);
  const selectedCategory = categoryOptions.find(
    (c) => c.value === filters.category
  );
  const selectedModule = moduleOptions.find((m) => m.value === filters.module);
  const selectedPaymentMode = paymentModeOptions.find(
    (p) => p.value === filters.paymentMode
  );

  const handleVendorSelect = (vendorValue) => {
    setFilters((prev) => ({ ...prev, paidTo: vendorValue }));
    setIsPaidToOpen(false);
    setVendorSearchQuery("");
  };

  const handleCategorySelect = (categoryValue) => {
    setFilters((prev) => ({ ...prev, category: categoryValue }));
    setIsCategoryOpen(false);
  };

  const handleAddVendorInline = async () => {
    const newErrors = {};
    if (!vendorName.trim()) {
      newErrors.vendorName = t("vendorNameRequired", {
        defaultValue: "Vendor name is required",
      });
    }
    const cleanedNumber = contactNumber.replace(/\s/g, "");
    if (!cleanedNumber) {
      newErrors.contactNumber = t("contactNumberRequired", {
        defaultValue: "Contact number is required",
      });
    } else if (!/^\d{10}$/.test(cleanedNumber)) {
      newErrors.contactNumber = t("invalidContactNumber", {
        defaultValue: "Please enter a valid 10-digit contact number",
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setVendorErrors(newErrors);
      return;
    }

    if (onAddVendor) {
      await onAddVendor({
        name: vendorName.trim(),
        countryCode,
        contactNumber: contactNumber.trim(),
      });
    }
    setVendorName("");
    setContactNumber("");
    setCountryCode("+91");
    setVendorErrors({});
    setShowAddVendorForm(false);
  };

  const handleAddVendorModalSave = async (vendorData) => {
    if (onAddVendor) {
      await onAddVendor(vendorData);
    }
    setIsAddVendorModalOpen(false);
  };

  const handleAddCategorySave = async (categoryData) => {
    if (onAddCategory) {
      await onAddCategory(categoryData);
    }
    setIsAddCategoryModalOpen(false);
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      paidDate: null,
      paidTo: "",
      category: "",
      module: "",
      paymentMode: "",
    };
    setFilters(resetFilters);
    setVendorSearchQuery("");
    setShowAddVendorForm(false);
    onReset(resetFilters);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end justify-end bg-black/50
             p-3 sm:p-4 overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl w-full max-w-md my-auto max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 bg-white z-10 border-b border-gray-100">
            <h3 className="text-base sm:text-lg font-medium text-primary">
              {t("filter", { defaultValue: "Filter" })}
            </h3>
            <button
              onClick={onClose}
              className="p-1 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-primary" />
            </button>
          </div>

          {/* Body */}
          <div className="px-4 sm:px-6 py-4 space-y-4">
            {/* Paid Date */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                {t("paidDate", { defaultValue: "Paid Date" })}<span>*</span>
              </label>
              <DatePicker
                value={filters.paidDate}
                onChange={(date) =>
                  setFilters((prev) => ({ ...prev, paidDate: date }))
                }
                placeholder="dd/mm/yyyy"
              />
            </div>

            {/* Paid To - Custom Dropdown */}
            <div ref={paidToRef} className="relative">
              <label className="block text-sm font-medium text-primary mb-2">
                {t("paidTo", { defaultValue: "Paid To" })}<span>*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsPaidToOpen(!isPaidToOpen)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-left flex items-center justify-between hover:border-gray-400 transition-colors cursor-pointer"
              >
                <span
                  className={selectedVendor ? "text-primary" : "text-secondary"}
                >
                  {selectedVendor
                    ? selectedVendor.label
                    : t("enterOrSelectName", {
                        defaultValue: "Enter or select name",
                      })}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    isPaidToOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isPaidToOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-96 overflow-hidden">
                  {/* Vendor Search */}
                  <div className="p-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer" />
                      <input
                        type="text"
                        value={vendorSearchQuery}
                        onChange={(e) => setVendorSearchQuery(e.target.value)}
                        placeholder={t("searchVendor", {
                          defaultValue: "Search vendor",
                        })}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 "
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  {/* Vendor List */}
                  <div className="max-h-48 overflow-y-auto">
                    {filteredVendors.map((vendor) => (
                      <button
                        key={vendor.value}
                        type="button"
                        onClick={() => handleVendorSelect(vendor.value)}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors cursor-pointer ${
                          filters.paidTo === vendor.value
                            ? "bg-gray-100 text-primary"
                            : "hover:bg-gray-50 text-primary"
                        }`}
                      >
                        {vendor.label}
                      </button>
                    ))}
                  </div>

                  {/* ✅ Add New Button (Modal open like Payment Mode) */}
                  <div className="border-t border-gray-200 p-2 ">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPaidToOpen(false);
                        setIsAddVendorModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 text-sm text-accent font-medium hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                        <Plus className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                      <span>{t("addNew", { defaultValue: "Add New" })}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Categories for Payment - Custom Dropdown */}
            <div ref={categoryRef} className="relative">
              <label className="block text-sm font-medium text-primary mb-2">
                {t("categoriesForPayment", {
                  defaultValue: "Categories for Payment",
                })}<span>*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-left flex items-center justify-between hover:border-gray-400 transition-colors cursor-pointer"
              >
                <span
                  className={
                    selectedCategory ? "text-primary" : "text-secondary"
                  }
                >
                  {selectedCategory
                    ? selectedCategory.label
                    : t("selectCategories", {
                        defaultValue: "Select Categories",
                      })}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    isCategoryOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isCategoryOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-96 overflow-hidden">
                  {/* Category List */}
                  <div className="max-h-64 overflow-y-auto">
                    {categoryOptions.map((category) => (
                      <button
                        key={category.value}
                        type="button"
                        onClick={() => handleCategorySelect(category.value)}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors cursor-pointer ${
                          filters.category === category.value
                            ? "bg-gray-100 text-primary"
                            : "hover:bg-gray-50 text-primary"
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>

                  {/* Add New Button */}
                  <div className="border-t border-gray-200 p-2">
                    <button
                      type="button"
                      onClick={() => setIsAddCategoryModalOpen(true)}
                      className="w-full flex items-center gap-2 text-sm text-accent font-medium hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                        <Plus className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                      <span>{t("addNew", { defaultValue: "Add New" })}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Select Module */}
            <div ref={moduleRef} className="relative">
              <label className="block text-sm font-medium text-primary mb-2">
                {t("selectModule", { defaultValue: "Select Module" })}<span>*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsModuleOpen(!isModuleOpen)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-left flex items-center justify-between hover:border-gray-400 transition-colors cursor-pointer"
              >
                <span
                  className={selectedModule ? "text-primary" : "text-secondary"}
                >
                  {selectedModule
                    ? selectedModule.label
                    : t("selectModule", { defaultValue: "Select Module" })}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    isModuleOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isModuleOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                  {moduleOptions.map((module) => (
                    <button
                      key={module.value}
                      type="button"
                      onClick={() => {
                        setFilters((prev) => ({
                          ...prev,
                          module: module.value,
                        }));
                        setIsModuleOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors cursor-pointer ${
                        filters.module === module.value
                          ? "bg-gray-100 text-primary"
                          : "hover:bg-gray-50 text-primary"
                      }`}
                    >
                      {module.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Mode */}
            <div ref={paymentModeRef} className="relative pb-10">
              <label className="block text-sm font-medium text-primary mb-2">
                {t("paymentMode", { defaultValue: "Payment Mode" })}<span>*</span>
              </label>

              <button
                type="button"
                onClick={() => setIsPaymentModeOpen(!isPaymentModeOpen)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-left flex items-center justify-between hover:border-gray-400 transition-colors cursor-pointer"
              >
                <span
                  className={
                    selectedPaymentMode ? "text-primary" : "text-secondary"
                  }
                >
                  {selectedPaymentMode
                    ? selectedPaymentMode.label
                    : t("selectPaymentMode", {
                        defaultValue: "Select Payment Mode",
                      })}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    isPaymentModeOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isPaymentModeOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-hidden">
                  {/* Mode List */}
                  <div className="max-h-48 overflow-y-auto">
                    {paymentModeOptions.map((mode) => (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => {
                          setFilters((prev) => ({
                            ...prev,
                            paymentMode: mode.value,
                          }));
                          setIsPaymentModeOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors cursor-pointer ${
                          filters.paymentMode === mode.value
                            ? "bg-gray-100 text-primary"
                            : "hover:bg-gray-50 text-primary"
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>

                  {/* ✅ Add New Button (same as Create Payment Entry) */}
                  <div className="border-t border-gray-200 p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPaymentModeOpen(false);
                        setIsAddPaymentModeModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 text-sm text-accent font-medium hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                        <Plus className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                      <span>{t("addNew", { defaultValue: "Add New" })}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-4 sm:px-6 pb-4 sm:pb-6 sticky bottom-0 bg-white pt-4">
            <Button variant="secondary" onClick={handleReset}>
              {t("reset", { defaultValue: "Reset" })}
            </Button>
            <Button variant="primary" onClick={handleApply}>
              {t("apply", { defaultValue: "Apply" })}
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddVendorModal
        isOpen={isAddVendorModalOpen}
        onClose={() => setIsAddVendorModalOpen(false)}
        onSave={handleAddVendorModalSave}
      />

      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onSave={handleAddCategorySave}
      />

      <AddPaymentModeModal
        isOpen={isAddPaymentModeModalOpen}
        onClose={() => setIsAddPaymentModeModalOpen(false)}
        onSave={handleAddPaymentModeSave}
      />
    </>
  );
}
