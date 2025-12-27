/**
 * EditInvoiceModal Component
 * Modal for editing an existing invoice
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Button from "./Button";
import Input from "./Input";
import NumberInput from "./NumberInput";
import Radio from "./Radio";
import Textarea from "./Textarea";
import FileUpload from "./FileUpload";
import pdfIcon from "../../assets/icons/Pdf.svg";
import { X } from "lucide-react";

export default function EditInvoiceModal({
  isOpen,
  onClose,
  onUpdate,
  invoice,
  isLoading = false,
}) {
  const { t } = useTranslation("finance");
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [percentage, setPercentage] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("pending");
  const [description, setDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [existingDocument, setExistingDocument] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && invoice) {
      setMilestoneTitle(invoice.milestoneTitle || "");
      setPercentage(invoice.percentage || "");
      setAmount(invoice.amount || "");
      setStatus(invoice.status || "pending");
      setDescription(invoice.description || "");
      setExistingDocument(invoice.document || null);
      setUploadedFiles([]);
      setErrors({});
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, invoice]);

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

  const handleFileSelect = (files) => {
    // When new files are selected, replace existing files
    const newFiles = Array.from(files);
    setUploadedFiles(newFiles);
    // Clear existing document when new file is uploaded (new file will replace it)
    setExistingDocument(null);
  };

  const handleRemoveExistingDocument = () => {
    setExistingDocument(null);
  };

  const handleUpdate = async () => {
    if (isLoading) {
      return; // Prevent multiple calls
    }

    const newErrors = {};

    if (!milestoneTitle.trim()) {
      newErrors.milestoneTitle = "Milestone title is required";
    }
    if (!percentage.trim()) {
      newErrors.percentage = "Percentage is required";
    }
    if (!amount.trim()) {
      newErrors.amount = "Amount is required";
    }
    if (!status) {
      newErrors.status = "Status is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updatedData = {
      id: invoice.id,
      milestoneTitle: milestoneTitle.trim(),
      percentage: percentage.trim(),
      amount: amount.trim(),
      status,
      description: description.trim(),
      files: uploadedFiles,
      document:
        uploadedFiles.length > 0 ? uploadedFiles[0].name : existingDocument,
    };

    const result = await onUpdate(updatedData);

    // Only close if onUpdate returns true (indicating success)
    if (result === true) {
      onClose();
    }
  };

  if (!isOpen || !invoice) return null;

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl my-auto overflow-y-auto">
         <div className="max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 sticky top-0 bg-white border-b border-gray-100">
          <h3 className="text-2xl font-semibold text-primary">
            {t("editInvoice", { defaultValue: "Edit Invoice" })}
          </h3>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4">
          <Input
            label={t("milestoneTitle", { defaultValue: "Milestone Title" })}
            placeholder={t("enterTitle", { defaultValue: "Enter title" })}
            value={milestoneTitle}
            onChange={(e) => {
              setMilestoneTitle(e.target.value);
              if (errors.milestoneTitle) {
                setErrors({ ...errors, milestoneTitle: "" });
              }
            }}
            error={errors.milestoneTitle}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NumberInput
              label={t("percentageOfTotalEstBudget", {
                defaultValue: "% of Total Est. Budget",
              })}
              placeholder="0"
              value={percentage}
              onChange={(e) => {
                setPercentage(e.target.value);
                if (errors.percentage) {
                  setErrors({ ...errors, percentage: "" });
                }
              }}
              error={errors.percentage}
              unit=""
              required
            />

            <NumberInput
              label={t("amount", { defaultValue: "Amount" })}
              placeholder="00,00,000"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (errors.amount) {
                  setErrors({ ...errors, amount: "" });
                }
              }}
              error={errors.amount}
              showCurrency
              required
            />
          </div>

          <div>
            <label className="block text-sm font-normal text-black mb-2">
              {t("status", { defaultValue: "Status" })}
              <span>*</span>
            </label>
            <div className="flex items-center gap-6">
              <Radio
                name="status"
                label={t("pending", { defaultValue: "Pending" })}
                value="pending"
                checked={status === "pending"}
                onChange={() => {
                  setStatus("pending");
                  if (errors.status) {
                    setErrors({ ...errors, status: "" });
                  }
                }}
              />
              <Radio
                name="status"
                label={t("paid", { defaultValue: "Paid" })}
                value="paid"
                checked={status === "paid"}
                onChange={() => {
                  setStatus("paid");
                  if (errors.status) {
                    setErrors({ ...errors, status: "" });
                  }
                }}
              />
            </div>
            {errors.status && (
              <p className="mt-1 text-sm text-accent">{errors.status}</p>
            )}
          </div>

          <Textarea
            label={t("milestoneDescription", {
              defaultValue: "Milestone Description",
            })}
            placeholder={t("writeDescription", {
              defaultValue: "Write description",
            })}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />

          <div>
            <label className="block text-sm font-normal text-black mb-2">
              {t("supportingDocument", { defaultValue: "Supporting Document" })}
            </label>

            {/* Show existing document if available */}
            {existingDocument && !uploadedFiles.length && (
              <div className="mb-4 p-3 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img
                    src={pdfIcon}
                    alt="PDF"
                    className="w-8 h-8 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-primary truncate">
                      {existingDocument}
                    </p>
                    <p className="text-xs text-secondary">
                      4.7 MB • 26 Sep 2024 3:20 PM
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveExistingDocument}
                  className="w-9 h-9 rounded-lg bg-white  flex items-center justify-center flex-shrink-0 cursor-pointer"
                >
                  <X className="w-5 h-5 text-primary font-bold rounded-full border p-1" />
                </button>
              </div>
            )}

            {/* File upload area - always show to allow adding/replacing files */}
            <FileUpload
              title={t("uploadDocument", { defaultValue: "Upload Document" })}
              supportedFormats="PDF, JPG, PNG"
              maxSize={10}
              maxSizeUnit="MB"
              onFileSelect={handleFileSelect}
              uploadButtonText={t("upload", { defaultValue: "Upload" })}
              supportedFormatLabel={t("supportedFormat", {
                defaultValue: "Supported Format:",
              })}
            />
            
            {/* Show message if existing document will be replaced */}
            {existingDocument && uploadedFiles.length > 0 && (
              <p className="text-xs text-secondary mt-1">
                {t("existingDocumentWillBeReplaced", { 
                  defaultValue: "Existing document will be replaced with new file(s)" 
                })}
              </p>
            )}

            {/* Show selected files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-2 space-y-2">
                <p className="text-sm text-secondary">
                  {t("selectedFiles", { defaultValue: "Selected files:" })}
                </p>
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-primary truncate flex-1">
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
                      }}
                      className="ml-2 w-6 h-6 rounded bg-white hover:bg-gray-100 flex items-center justify-center border border-gray-200 transition-colors"
                      title={t("remove", { defaultValue: "Remove" })}
                    >
                      <div className="w-4 h-4 rounded-full border border-black flex items-center justify-center">
                        <X className="w-2.5 h-2.5 text-black" strokeWidth={2.5} />
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 sticky bottom-0 bg-white border-t border-gray-100">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {t("cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button variant="primary" onClick={handleUpdate} disabled={isLoading}>
            {isLoading
              ? t("updating", { defaultValue: "Updating..." })
              : t("update", { defaultValue: "Update" })}
          </Button>
        </div>
      </div></div>
    </div>
  );
}
