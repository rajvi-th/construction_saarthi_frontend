/**
 * DatePicker Component
 * Reusable date picker component using MUI
 */

import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import dayjs from 'dayjs';

// Custom theme to override MUI's default blue colors
const datePickerTheme = createTheme({
  palette: {
    primary: {
      main: '#060C12',
    },
    error: {
      main: '#B02E0C',
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused fieldset': {
            borderColor: '#060C12 !important',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            color: '#060C12 !important',
          },
        },
      },
    },
    // Override calendar popup colors
    MuiPickersDay: {
      styleOverrides: {
        root: {
          display: 'flex',
          alignItems: 'center!important',
          justifyContent: 'center!important',
          textAlign: 'center!important',
          '&.Mui-selected': {
            backgroundColor: '#B02E0C !important',
            color: '#fff !important',
            display: 'flex',
            alignItems: 'center!important',
            justifyContent: 'center!important',
            '&:hover': {
              backgroundColor: '#B02E0C !important',
            },
            '&:focus': {
              backgroundColor: '#B02E0C !important',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(176, 46, 12, 0.1) !important',
          },
          '&:focus': {
            backgroundColor: 'rgba(176, 46, 12, 0.1) !important',
          },
        },
      },
    },
    MuiDayCalendar: {
      styleOverrides: {
        header: {
          color: '#060C12',
        },
      },
    },
    MuiPickersCalendarHeader: {
      styleOverrides: {
        root: {
          color: '#060C12',
        },
      },
    },
  },
});

export default function DatePicker({
  label,
  value,
  onChange,
  required = false,
  error,
  disabled = false,
  className = '',
  placeholder = 'Select date',
  minDate,
  maxDate,
  ...props
}) {
  return (
    <div className={`w-full ${className}`}>
      <ThemeProvider theme={datePickerTheme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MuiDatePicker
          label={label}
          value={value ? dayjs(value) : null}
          onChange={(newValue) => {
            if (onChange) {
              onChange(newValue ? newValue.toDate() : null);
            }
          }}
          disabled={disabled}
          minDate={minDate ? dayjs(minDate) : undefined}
          maxDate={maxDate ? dayjs(maxDate) : undefined}
          slotProps={{
            textField: {
              placeholder: placeholder,
              required: required,
              error: !!error,
              helperText: error,
              fullWidth: true,
              size: 'small',
              sx: {
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  backgroundColor: disabled ? '#F9FAFB' : '#FFFFFF',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: error ? '#B02E0C' : 'rgba(6, 12, 18, 0.3)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: error ? '#B02E0C' : 'rgba(6, 12, 18, 0.3)',
                    borderWidth: '1px',
                  },
                  '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#B02E0C',
                    borderWidth: '1px',
                  },
                  '&.Mui-disabled': {
                    opacity: 0.5,
                    cursor: 'not-allowed',
                    backgroundColor: '#F9FAFB',
                  },
                  '& fieldset': {
                    borderColor: error ? '#B02E0C' : '#E5E5E5',
                    borderWidth: '1px',
                  },
                },
                '& .MuiInputLabel-root': {
                  fontFamily: 'inherit',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#060C12',
                  '&.Mui-focused': {
                    color: error ? '#B02E0C' : '#060C12',
                  },
                  '&.Mui-error': {
                    color: '#B02E0C',
                  },
                  '&.Mui-disabled': {
                    color: '#060C12',
                    opacity: 0.5,
                  },
                },
                '& .MuiInputBase-input': {
                  fontFamily: 'inherit',
                  fontSize: '0.875rem',
                  padding: '10px 16px',
                  color: '#060C12',
                  cursor: disabled ? 'not-allowed' : 'text',
                  '&::placeholder': {
                    color: '#6B6B6B',
                    opacity: 1,
                  },
                  '&:focus': {
                    outline: 'none',
                  },
                },
                '& .MuiFormHelperText-root': {
                  fontFamily: 'inherit',
                  fontSize: '0.875rem',
                  marginTop: '4px',
                  marginLeft: '0px',
                  color: '#B02E0C',
                },
                '& .MuiIconButton-root': {
                  color: '#6B6B6B',
                  padding: '8px',
                  '&:hover': {
                    backgroundColor: 'rgba(6, 12, 18, 0.04)',
                  },
                  '&:focus': {
                    outline: 'none',
                  },
                  '&.Mui-disabled': {
                    opacity: 0.5,
                  },
                },
              },
            },
          }}
          {...props}
        />
        </LocalizationProvider>
      </ThemeProvider>
    </div>
  );
}

