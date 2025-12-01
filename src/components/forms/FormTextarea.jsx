/**
 * Reusable Form Textarea Component
 * Works with React Hook Form
 */

function FormTextarea({
  label,
  name,
  register,
  errors,
  placeholder = '',
  required = false,
  rows = 4,
  className = '',
  labelClassName = '',
  ...props
}) {
  const errorMessage = errors[name]?.message;

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className={`block text-sm font-medium text-primary mb-2 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-accent ml-1">*</span>}
        </label>
      )}
      <textarea
        id={name}
        rows={rows}
        placeholder={placeholder}
        {...register(name)}
        className={`
          w-full px-4 py-2 border rounded-lg focus:outline-none transition-colors resize-none
          placeholder:text-primary-light
          ${errorMessage 
            ? 'border-red-500 focus:border-red-500' 
            : 'border-gray-300 focus:border-black/30 hover:border-gray-400'
          }
        `}
        {...props}
      />
      {errorMessage && (
        <p className="mt-1 text-sm text-accent">{errorMessage}</p>
      )}
    </div>
  );
}

export default FormTextarea;

