import toast from "react-hot-toast";
import {
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

const DEFAULT_POSITION = "bottom-right";

const baseClass =
  "flex items-center gap-3 px-5 py-6 rounded-xl shadow-lg backdrop-blur-sm border text-lg font-medium";

// Reusable Toast UI Component
const ToastBox = ({ icon, classes, message }) => (
  <div className={`${baseClass} ${classes}`}>
    {icon}
    <span>{message}</span>
  </div>
);

// SUCCESS 
export const showSuccess = (msg, position = DEFAULT_POSITION) =>
  toast.custom(
    () => (
      <ToastBox
        icon={<CheckCircle className="w-5 h-5 text-green-700" />}
        message={msg}
        classes="bg-white border-green-300 text-green-700"
      />
    ),
    { 
      position, 
      duration: 2400,
      style: {
        bottom: '40px',
        right: '20px',
      }
    }
  );

// ERROR 
export const showError = (msg, position = DEFAULT_POSITION) =>
  toast.custom(
    () => (
      <ToastBox
        icon={<XCircle className="w-5 h-5 text-red-700" />}
        message={msg}
        classes="bg-white border-red-300 text-red-700"
      />
    ),
    { 
      position, 
      duration: 3000,
      style: {
        bottom: '20px',
        right: '20px',
      }
    }
  );

// WARNING 
export const showWarning = (msg, position = DEFAULT_POSITION) =>
  toast.custom(
    () => (
      <ToastBox
        icon={<AlertTriangle className="w-5 h-5 text-yellow-700" />}
        message={msg}
        classes="bg-white border-yellow-300 text-yellow-700"
      />
    ),
    { 
      position, 
      duration: 2600,
      style: {
        bottom: '40px',
        right: '20px',
      }
    }
  );

// INFO 
export const showInfo = (msg, position = DEFAULT_POSITION) =>
  toast.custom(
    () => (
      <ToastBox
        icon={<Info className="w-5 h-5 text-blue-700" />}
        message={msg}
        classes="bg-white border-blue-300 text-blue-700"
      />
    ),
    { 
      position, 
      duration: 2600,
      style: {
        bottom: '20px',
        right: '20px',
      }
    }
  );

// LOADING 
export const showLoading = (msg = "Loading…", position = DEFAULT_POSITION) =>
  toast.custom(
    () => (
      <ToastBox
        icon={<Loader2 className="animate-spin w-5 h-5 text-green-700" />}
        message={msg}
        classes="bg-white border-green-300 text-green-700"
      />
    ),
    { 
      position, 
      duration: Infinity,
      style: {
        bottom: '40px',
        right: '20px',
      }
    }
  );

// DISMISS
export const dismissToast = (id) => toast.dismiss(id);

// UPDATE (convert loading → success/error)
export const updateToast = (id, { type, message }) => {
  dismissToast(id);
  if (type === "success") showSuccess(message);
  else if (type === "error") showError(message);
};

