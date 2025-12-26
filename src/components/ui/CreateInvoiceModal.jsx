/**
 * CreateInvoiceModal Component
 * Modal for creating a new invoice
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Button from "./Button";
import Input from "./Input";
import NumberInput from "./NumberInput";
import Radio from "./Radio";
import Textarea from "./Textarea";
import FileUpload from "./FileUpload";

export default function CreateInvoiceModal({ isOpen, onClose, onCreate }) {
  const { t } = useTranslation("finance");
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [percentage, setPercentage] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("pending");
  const [description, setDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setMilestoneTitle("");
      setPercentage("");
      setAmount("");
      setStatus("pending");
      setDescription("");
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

  const handleFileSelect = (files) => {
    setUploadedFiles(Array.from(files));
  };

  const handleCreate = () => {
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

    onCreate({
      milestoneTitle: milestoneTitle.trim(),
      percentage: percentage.trim(),
      amount: amount.trim(),
      status,
      description: description.trim(),
      files: uploadedFiles,
    });

    // Reset form
    setMilestoneTitle("");
    setPercentage("");
    setAmount("");
    setStatus("pending");
    setDescription("");
    setUploadedFiles([]);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

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
            {t("createInvoice", { defaultValue: "Create Invoice" })}
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
              placeholder="%"
              value={percentage}
              onChange={(e) => {
                setPercentage(e.target.value);
                if (errors.percentage) {
                  setErrors({ ...errors, percentage: "" });
                }
              }}
              error={errors.percentage}
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
                label={t("completed", { defaultValue: "Completed" })}
                value="completed"
                checked={status === "completed"}
                onChange={() => {
                  setStatus("completed");
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
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 sticky bottom-0 bg-white border-t border-gray-100">
          <Button variant="secondary" onClick={onClose}>
            {t("cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            {t("create", { defaultValue: "Create" })}
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
}
