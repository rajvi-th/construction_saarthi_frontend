/**
 * Reusable Form Input Component
 * Works with React Hook Form
 */

function FormInput({
  label,
  name,
  register,
  errors,
  type = 'text',
  placeholder = '',
  required = false,
  className = '',
  ...props
}) {
  const errorMessage = errors[name]?.message;

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-primary mb-2">
          {label}
          {required && <span className="text-accent ml-1">*</span>}
        </label>
      )}
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className={`
          w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors
          ${errorMessage 
            ? 'border-accent focus:ring-accent' 
            : 'border-gray-300 focus:ring-primary focus:border-primary'
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

export default FormInput;

