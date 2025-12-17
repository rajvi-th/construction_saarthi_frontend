/**
 * TimeInput Component
 * Input field for time selection with clock icon
 */

import dayjs from 'dayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export default function TimeInput({
  label,
  value,
  onChange,
  placeholder = '00:00',
  required = false,
  error,
  disabled = false,
  className = '',
  ...props
}) {
  const toDayjsValue = (v) => {
    if (!v) return null;
    if (typeof v !== 'string') return null;

    const match = v.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    if (hours < 0 || hours > 23) return null;
    if (minutes < 0 || minutes > 59) return null;

    return dayjs().hour(hours).minute(minutes).second(0).millisecond(0);
  };

  const emitStringValue = (newValue) => {
    const next = newValue ? dayjs(newValue).format('HH:mm') : '';
    // Keep backward-compat with existing usage: onChange(event)
    onChange?.({ target: { value: next } });
  };

  return (
    <div className={`w-full ${className}`}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <TimePicker
          label={label}
          value={toDayjsValue(value)}
          onChange={emitStringValue}
          ampm={false}
          slotProps={{
            textField: {
              fullWidth: true,
              required,
              disabled,
              error: Boolean(error),
              helperText: '',
              placeholder,
              sx: {
                '& .MuiOutlinedInput-root': {
                  borderRadius: '0.5rem',
                  backgroundColor: disabled ? 'rgba(0,0,0,0.02)' : '#fff',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderRadius: '0.5rem',
                  borderColor: error ? 'var(--color-accent, #ef4444)' : 'rgba(6,12,18,0.12)',
                },
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: error ? 'var(--color-accent, #ef4444)' : 'rgba(6,12,18,0.3)',
                },
                '& .MuiInputBase-input': {
                  paddingTop: '0.625rem',
                  paddingBottom: '0.625rem',
                },
              },
            },
          }}
          {...props}
        />
      </LocalizationProvider>
      
      {error && (
        <p className="mt-1 text-sm text-accent">{error}</p>
      )}
    </div>
  );
}

