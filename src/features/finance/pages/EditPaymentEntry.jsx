/**
 * Edit Payment Entry Page
 * Page for editing an existing payment entry
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ROUTES_FLAT, getRoute } from "../../../constants/routes";
import PageHeader from "../../../components/layout/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Dropdown from "../../../components/ui/Dropdown";
import DatePicker from "../../../components/ui/DatePicker";
import Textarea from "../../../components/ui/Textarea";
import FileUpload from "../../../components/ui/FileUpload";
import AddVendorModal from "../../../components/ui/AddVendorModal";
import AddCategoryModal from "../../../components/ui/AddCategoryModal";
import AddPaymentModeModal from "../../../components/ui/AddPaymentModeModal";

export default function EditPaymentEntry() {
  const { t } = useTranslation("finance");
  const navigate = useNavigate();
  const { projectId, entryId } = useParams();
  const location = useLocation();

  // Get entry data from location state (passed from ExpensesPaid page)
  const paymentEntry = location.state?.entry;

  const [formData, setFormData] = useState({
    paidDate: new Date(),
    paidBy: "",
    amount: "",
    description: "",
    paidTo: "",
    category: "",
    mode: "",
    paymentProof: null,
  });

  const [errors, setErrors] = useState({});

  // Static data
  const [vendors, setVendors] = useState([
    "Arvind Sharma",
    "Bipin Shah",
    "Shantilal Patel",
    "Rohan Sharma",
    "Anurag Shah",
    "Ganesh Traders",
    "Vishal Steel Works",
  ]);

  const [categories, setCategories] = useState([
    "Labour",
    "Centring",
    "Cement",
    "Steel",
    "Materials",
  ]);

  const [paymentModes, setPaymentModes] = useState([
    { value: "cash", label: t("cash", { defaultValue: "Cash" }) },
    { value: "cheque", label: t("cheque", { defaultValue: "Cheque" }) },
    {
      value: "bank_transfer",
      label: t("bankTransfer", { defaultValue: "Bank Transfer" }),
    },
    { value: "upi", label: t("upi", { defaultValue: "UPI" }) },
    { value: "other", label: t("other", { defaultValue: "Other" }) },
  ]);

  const paidByOptions = ["Mahesh (Site Manager)", "Anurag Sharma", "Admin"];

  // Populate form data when entry is available
  useEffect(() => {
    if (paymentEntry) {
      const modeMap = {
        Cash: "cash",
        Cheque: "cheque",
        "Bank Transfer": "bank_transfer",
        BankTransfer: "bank_transfer",
        UPI: "upi",
        Other: "other",
        cash: "cash",
        cheque: "cheque",
        bank_transfer: "bank_transfer",
        upi: "upi",
        other: "other",
      };

      const amountValue = paymentEntry.amount
        ? paymentEntry.amount.replace(/[₹,]/g, "")
        : "";

      let parsedDate = new Date();
      if (paymentEntry.paidDate) {
        if (typeof paymentEntry.paidDate === "string") {
          const d = new Date(paymentEntry.paidDate);
          parsedDate = isNaN(d.getTime()) ? new Date() : d;
        } else {
          parsedDate = paymentEntry.paidDate;
        }
      } else if (paymentEntry.date) {
        const d = new Date(paymentEntry.date);
        parsedDate = isNaN(d.getTime()) ? new Date() : d;
      }

      const modeValue =
        modeMap[paymentEntry.paidVia] ||
        modeMap[paymentEntry.mode] ||
        paymentEntry.mode ||
        "";

      setFormData({
        paidDate: parsedDate,
        paidBy: paymentEntry.paidBy || paymentEntry.from || "",
        amount: amountValue,
        description: paymentEntry.description || "",
        paidTo:
          paymentEntry.paidTo ||
          paymentEntry.to ||
          paymentEntry.vendorName ||
          "",
        category: paymentEntry.category || "",
        mode: modeValue,
        paymentProof: paymentEntry.paymentProof || null,
      });
    }
  }, [paymentEntry]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileSelect = (files) => {
    if (files && files.length > 0) {
      handleChange("paymentProof", files[0]);
    }
  };

  const handleUpdate = () => {
    const newErrors = {};

    if (!formData.paidDate) {
      newErrors.paidDate = t("paidDateRequired", {
        defaultValue: "Paid date is required",
      });
    }

    if (!formData.paidTo) {
      newErrors.paidTo = t("paidToRequired", {
        defaultValue: "Paid to is required",
      });
    }

    if (!formData.category) {
      newErrors.category = t("categoryRequired", {
        defaultValue: "Category is required",
      });
    }

    const amountValue = formData.amount
      ? parseFloat(formData.amount.replace(/[^\d.]/g, ""))
      : 0;

    if (!formData.amount || isNaN(amountValue) || amountValue <= 0) {
      newErrors.amount = t("amountRequired", {
        defaultValue: "Amount is required",
      });
    }

    if (!formData.mode) {
      newErrors.mode = t("modeRequired", {
        defaultValue: "Payment mode is required",
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // TODO: Update payment entry via API
    console.log("Update payment entry:", formData);

    // Navigate back to expenses paid page
    navigate(getRoute(ROUTES_FLAT.FINANCE_EXPENSES_PAID, { projectId }));
  };

  const handleVendorAdd = async (vendorData) => {
    // vendorData comes from AddVendorModal's onSave callback
    const vendorName = vendorData.name || vendorData;
    if (!vendors.includes(vendorName)) {
      setVendors([...vendors, vendorName]);
    }
    handleChange("paidTo", vendorName);
  };

  const handleCategoryAdd = async (categoryData) => {
    // categoryData comes from AddCategoryModal's onSave callback
    const categoryName = categoryData.name || categoryData;
    if (!categories.includes(categoryName)) {
      setCategories([...categories, categoryName]);
    }
    handleChange("category", categoryName);
  };

  const handlePaymentModeAdd = async (modeData) => {
    // modeData comes from AddPaymentModeModal's onSave callback
    const modeName = modeData.name || modeData;
    const modeValue = modeName.toLowerCase().replace(/\s+/g, "_");

    // Check if mode already exists
    const exists = paymentModes.some(
      (m) =>
        m.value === modeValue ||
        m.label.toLowerCase() === modeName.toLowerCase()
    );
    if (!exists) {
      const newMode = { value: modeValue, label: modeName };
      setPaymentModes([...paymentModes, newMode]);
    }
    handleChange("mode", modeValue);
  };

  const vendorOptions = vendors.map((v) => ({
    value: v,
    label: v,
  }));

  const categoryOptions = categories.map((c) => ({
    value: c,
    label: c,
  }));

  const paymentModeOptions = paymentModes.map((m) => ({
    value: typeof m === "string" ? m : m.value || m,
    label: typeof m === "object" ? m.label : t(m, { defaultValue: m }),
  }));

  const entryTitle =
    paymentEntry?.paidTo ||
    paymentEntry?.to ||
    paymentEntry?.vendorName ||
    t("editPaymentEntry", { defaultValue: "Edit Payment Entry" });

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title={entryTitle}
        onBack={() =>
          navigate(getRoute(ROUTES_FLAT.FINANCE_EXPENSES_PAID, { projectId }))
        }
      />

      <div className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Paid Date */}
            <div>
              <label className="block text-sm font-medium text-primary mb-3">
                {t("paidDate", { defaultValue: "Paid Date" })} <span>*</span>
              </label>
              <DatePicker
                value={formData.paidDate}
                onChange={(date) => handleChange("paidDate", date)}
                error={errors.paidDate}
              />
            </div>

            {/* Paid By */}
            <Input
              label={t("paidBy", { defaultValue: "Paid By" })}
              placeholder={t("enterPaidBy", { defaultValue: "Enter paid by" })}
              value={formData.paidBy}
              onChange={(e) => handleChange("paidBy", e.target.value)}
            />

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                {t("amount", { defaultValue: "Amount" })} <span>*</span>
              </label>
              <Input
                placeholder="₹.00"
                value={formData.amount}
                error={errors.amount}
                onChange={(e) =>
                  handleChange("amount", e.target.value.replace(/[^\d.]/g, ""))
                }
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Paid To */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                {t("paidTo", { defaultValue: "Paid To" })} <span>*</span>
              </label>
              <Dropdown
                value={formData.paidTo}
                options={vendorOptions}
                placeholder={t("enterOrSelectName", {
                  defaultValue: "Enter or select name",
                })}
                error={errors.paidTo}
                onChange={(value) => handleChange("paidTo", value)}
                searchable
                searchPlaceholder={t("searchVendor", {
                  defaultValue: "Search vendor",
                })}
                showSeparator={true}
                onAddNew={handleVendorAdd}
                addButtonLabel={t("addNewVendor", {
                  defaultValue: "Add New Vendor",
                })}
                customModal={AddVendorModal}
              />
            </div>

            {/* Categories for Payment */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                {t("categoriesForPayment", {
                  defaultValue: "Categories for Payment",
                })}{" "}
                <span>*</span>
              </label>
              <Dropdown
                value={formData.category}
                options={categoryOptions}
                placeholder={t("selectCategory", {
                  defaultValue: "Select category",
                })}
                error={errors.category}
                onChange={(value) => handleChange("category", value)}
                showSeparator={true}
                onAddNew={handleCategoryAdd}
                addButtonLabel={t("addNewCategory", {
                  defaultValue: "Add New Category",
                })}
                customModal={AddCategoryModal}
              />
            </div>

            {/* Mode */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                {t("mode", { defaultValue: "Mode" })} <span>*</span>
              </label>
              <Dropdown
                value={formData.mode}
                options={paymentModeOptions}
                placeholder={t("selectMode", { defaultValue: "Select Mode" })}
                error={errors.mode}
                onChange={(value) => handleChange("mode", value)}
                showSeparator={true}
                onAddNew={handlePaymentModeAdd}
                addButtonLabel={t("addNew", { defaultValue: "Add New" })}
                customModal={AddPaymentModeModal}
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            {t("description", { defaultValue: "Description" })}
          </label>
          <Textarea
            placeholder={t("writeDescription", {
              defaultValue: "Write description",
            })}
            rows={4}
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </div>

        {/* Payment Proof */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-primary mb-2">
            {t("paymentProof", { defaultValue: "Payment Proof" })}
          </label>
          <FileUpload
            title={t("uploadPaymentProof", {
              defaultValue: "Upload Payment Proof",
            })}
            supportedFormats="PDF, JPG, PNG"
            maxSize={10}
            maxSizeUnit="MB"
            onFileSelect={handleFileSelect}
            uploadButtonText={t("upload", { defaultValue: "Upload" })}
            supportedFormatLabel={t("supportedFormat", {
              defaultValue: "Supported Format:",
            })}
          />
        </div>

        {/* Footer Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mt-6 pt-6 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={() =>
              navigate(
                getRoute(ROUTES_FLAT.FINANCE_EXPENSES_PAID, { projectId })
              )
            }
            className="w-full sm:w-auto"
          >
            {t("cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdate}
            className="w-full sm:w-auto"
          >
            {t("update", { defaultValue: "Update" })}
          </Button>
        </div>
      </div>
    </div>
  );
}
