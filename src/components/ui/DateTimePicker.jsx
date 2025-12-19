/**
 * DateTimePicker Component
 * Reusable date and time picker component using MUI
 */

import { DateTimePicker as MuiDateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useEffect } from 'react';

dayjs.extend(customParseFormat);

// Custom theme to override MUI's default blue colors
const dateTimePickerTheme = createTheme({
  palette: {
    primary: {
      main: '#B02E0C', // Use accent color for primary (affects time picker)
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
    // Override time picker colors - replace blue with accent color
    MuiTimePickerToolbar: {
      styleOverrides: {
        root: {
          '& .MuiPickersToolbarButton-root': {
            borderRadius: '50% !important',
            minWidth: '48px !important',
            width: '48px !important',
            height: '48px !important',
            '&.Mui-selected': {
              backgroundColor: '#B02E0C !important',
              color: '#fff !important',
              borderRadius: '50% !important',
              '&:hover': {
                backgroundColor: '#B02E0C !important',
              },
            },
          },
        },
      },
    },
    MuiPickersToolbarButton: {
      styleOverrides: {
        root: {
          display: 'flex',
          alignItems: 'center !important',
          justifyContent: 'center !important',
          textAlign: 'center !important',
          borderRadius: '50% !important',
          minWidth: '48px !important',
          width: '48px !important',
          height: '48px !important',
          padding: '0 !important',
          '&.Mui-selected': {
            backgroundColor: '#B02E0C !important',
            color: '#fff !important',
            borderRadius: '50% !important',
            display: 'flex',
            alignItems: 'center !important',
            justifyContent: 'center !important',
            textAlign: 'center !important',
            minWidth: '48px !important',
            width: '48px !important',
            height: '48px !important',
            padding: '0 !important',
            '&:hover': {
              backgroundColor: '#B02E0C !important',
            },
            '&:focus': {
              backgroundColor: '#B02E0C !important',
            },
          },
        },
      },
    },
    MuiClockNumber: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: '#B02E0C !important',
            color: '#fff !important',
            '&:hover': {
              backgroundColor: '#B02E0C !important',
            },
          },
        },
      },
    },
    MuiClockPointer: {
      styleOverrides: {
        root: {
          backgroundColor: '#B02E0C !important',
          '& .MuiClockPointer-thumb': {
            backgroundColor: '#B02E0C !important',
            borderColor: '#B02E0C !important',
          },
        },
      },
    },
    MuiTimeClock: {
      styleOverrides: {
        root: {
          '& .MuiClock-meridiemText': {
            '&.Mui-selected': {
              backgroundColor: '#B02E0C !important',
              color: '#fff !important',
            },
          },
        },
      },
    },
  },
});

export default function DateTimePicker({
  label,
  value,
  onChange,
  required = false,
  error,
  disabled = false,
  className = '',
  placeholder = 'DD/MM/YYYY HH:MM',
  minDate,
  maxDate,
  ...props
}) {
  // Add global styles for time picker buttons to be round
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'datetime-picker-round-buttons';
    style.textContent = `
      /* Target all time picker buttons - very aggressive selectors */
      .MuiPickersToolbarButton-root,
      .MuiPickersToolbarButton-root.Mui-selected,
      .MuiTimePickerToolbar-root .MuiPickersToolbarButton-root,
      .MuiTimePickerToolbar-root .MuiPickersToolbarButton-root.Mui-selected,
      button.MuiPickersToolbarButton-root,
      button.MuiPickersToolbarButton-root.Mui-selected,
      [class*="MuiPickersToolbarButton"],
      [class*="MuiTimePickerToolbar"] button,
      [class*="MuiTimePickerToolbar"] [class*="MuiPickersToolbarButton"],
      /* Target by background color */
      [style*="background-color: rgb(176, 46, 12)"],
      [style*="background-color:#B02E0C"],
      [style*="background-color: #B02E0C"] {
        border-radius: 50% !important;
        -webkit-border-radius: 50% !important;
        -moz-border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        text-align: center !important;
        min-width: 48px !important;
        max-width: 48px !important;
        width: 48px !important;
        min-height: 48px !important;
        max-height: 48px !important;
        height: 48px !important;
        padding: 0 !important;
        aspect-ratio: 1 !important;
        box-sizing: border-box !important;
      }
      /* Target selected state specifically */
      .MuiPickersToolbarButton-root.Mui-selected,
      [class*="MuiPickersToolbarButton"].Mui-selected,
      [class*="MuiTimePickerToolbar"] button.Mui-selected {
        border-radius: 50% !important;
        -webkit-border-radius: 50% !important;
        -moz-border-radius: 50% !important;
        background-color: #B02E0C !important;
        color: #fff !important;
        min-width: 48px !important;
        max-width: 48px !important;
        width: 48px !important;
        min-height: 48px !important;
        max-height: 48px !important;
        height: 48px !important;
        padding: 0 !important;
        aspect-ratio: 1 !important;
      }
      /* Target inner elements */
      .MuiPickersToolbarButton-root > span,
      .MuiPickersToolbarButton-root.Mui-selected > span,
      [class*="MuiPickersToolbarButton"] > span,
      [class*="MuiPickersToolbarButton"] > * {
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 100% !important;
        height: 100% !important;
        text-align: center !important;
      }
      /* Force round shape on all child elements */
      .MuiPickersToolbarButton-root *,
      .MuiPickersToolbarButton-root.Mui-selected *,
      [class*="MuiPickersToolbarButton"] * {
        border-radius: 50% !important;
      }
    `;
    // Remove existing style if present
    const existingStyle = document.getElementById('datetime-picker-round-buttons');
    if (existingStyle) {
      document.head.removeChild(existingStyle);
    }
    document.head.appendChild(style);

    // Use MutationObserver to apply styles when popup appears
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const element = node;
            // Find all time picker buttons
            const buttons = element.querySelectorAll?.(
              '.MuiPickersToolbarButton-root, [class*="MuiPickersToolbarButton"], [class*="MuiTimePickerToolbar"] button'
            );
            buttons?.forEach((button) => {
              if (button instanceof HTMLElement) {
                // Force rounded shape
                button.style.borderRadius = '50%';
                button.style.setProperty('border-radius', '50%', 'important');
                button.style.setProperty('-webkit-border-radius', '50%', 'important');
                button.style.setProperty('-moz-border-radius', '50%', 'important');
                
                // Set equal dimensions for perfect circle
                button.style.minWidth = '48px';
                button.style.width = '48px';
                button.style.height = '48px';
                button.style.maxWidth = '48px';
                button.style.maxHeight = '48px';
                button.style.setProperty('min-width', '48px', 'important');
                button.style.setProperty('width', '48px', 'important');
                button.style.setProperty('height', '48px', 'important');
                button.style.setProperty('max-width', '48px', 'important');
                button.style.setProperty('max-height', '48px', 'important');
                
                button.style.padding = '0';
                button.style.display = 'flex';
                button.style.alignItems = 'center';
                button.style.justifyContent = 'center';
                button.style.boxSizing = 'border-box';
                button.style.aspectRatio = '1';
                
                // Remove any individual corner radius that might override
                button.style.borderTopLeftRadius = '';
                button.style.borderTopRightRadius = '';
                button.style.borderBottomLeftRadius = '';
                button.style.borderBottomRightRadius = '';
                
                if (button.classList.contains('Mui-selected')) {
                  button.style.backgroundColor = '#B02E0C';
                  button.style.color = '#fff';
                  button.style.borderRadius = '50%';
                  button.style.setProperty('border-radius', '50%', 'important');
                }
                
                // Style child elements too
                const span = button.querySelector('span');
                if (span) {
                  span.style.borderRadius = '50%';
                  span.style.display = 'flex';
                  span.style.alignItems = 'center';
                  span.style.justifyContent = 'center';
                  span.style.width = '100%';
                  span.style.height = '100%';
                }
              }
            });
            
            // Also apply to any buttons that might be added later
            setTimeout(() => {
              const allButtons = document.querySelectorAll?.(
                '.MuiPickersToolbarButton-root, [class*="MuiPickersToolbarButton"], [class*="MuiTimePickerToolbar"] button'
              );
              allButtons?.forEach((button) => {
                if (button instanceof HTMLElement) {
                  button.style.setProperty('border-radius', '50%', 'important');
                  button.style.setProperty('width', '48px', 'important');
                  button.style.setProperty('height', '48px', 'important');
                  button.style.setProperty('min-width', '48px', 'important');
                  button.style.setProperty('min-height', '48px', 'important');
                }
              });
            }, 50);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      const styleToRemove = document.getElementById('datetime-picker-round-buttons');
      if (styleToRemove) {
        document.head.removeChild(styleToRemove);
      }
    };
  }, []);

  return (
    <div className={`w-full ${className}`}>
      {/* Label above input */}
      {label && (
        <label className="block text-sm font-medium text-primary mb-2">
          {label}
          {required && <span className="text-accent ml-1">*</span>}
        </label>
      )}
      
      <ThemeProvider theme={dateTimePickerTheme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MuiDateTimePicker
            value={value ? dayjs(value) : null}
            onChange={(newValue) => {
              if (onChange) {
                onChange(newValue ? newValue.toDate() : null);
              }
            }}
            disabled={disabled}
            minDate={minDate ? dayjs(minDate) : undefined}
            maxDate={maxDate ? dayjs(maxDate) : undefined}
            format="DD/MM/YYYY HH:mm"
            ampm={false}
            slotProps={{
              popper: {
                sx: {
                  '& .MuiPickersToolbarButton-root': {
                    borderRadius: '50% !important',
                    minWidth: '48px !important',
                    width: '48px !important',
                    height: '48px !important',
                    display: 'flex !important',
                    alignItems: 'center !important',
                    justifyContent: 'center !important',
                    padding: '0 !important',
                    '&.Mui-selected': {
                      backgroundColor: '#B02E0C !important',
                      color: '#fff !important',
                      borderRadius: '50% !important',
                      minWidth: '48px !important',
                      width: '48px !important',
                      height: '48px !important',
                    },
                  },
                  '& .MuiPickersToolbar-root': {
                    '& .MuiPickersToolbarButton-root': {
                      borderRadius: '50% !important',
                      minWidth: '48px !important',
                      width: '48px !important',
                      height: '48px !important',
                      display: 'flex !important',
                      alignItems: 'center !important',
                      justifyContent: 'center !important',
                      padding: '0 !important',
                      '&.Mui-selected': {
                        backgroundColor: '#B02E0C !important',
                        color: '#fff !important',
                        borderRadius: '50% !important',
                        minWidth: '48px !important',
                        width: '48px !important',
                        height: '48px !important',
                      },
                    },
                  },
                  '& .MuiTimePickerToolbar-root': {
                    '& .MuiPickersToolbarButton-root': {
                      borderRadius: '50% !important',
                      minWidth: '48px !important',
                      width: '48px !important',
                      height: '48px !important',
                      display: 'flex !important',
                      alignItems: 'center !important',
                      justifyContent: 'center !important',
                      padding: '0 !important',
                      '&.Mui-selected': {
                        backgroundColor: '#B02E0C !important',
                        color: '#fff !important',
                        borderRadius: '50% !important',
                        minWidth: '48px !important',
                        width: '48px !important',
                        height: '48px !important',
                      },
                    },
                  },
                  // Target all possible time picker button variations
                  '& [role="button"]': {
                    '&.Mui-selected': {
                      borderRadius: '50% !important',
                    },
                  },
                  '& .MuiClockNumber-root.Mui-selected': {
                    backgroundColor: '#B02E0C !important',
                    color: '#fff !important',
                  },
                  '& .MuiClockPointer-root': {
                    backgroundColor: '#B02E0C !important',
                    '& .MuiClockPointer-thumb': {
                      backgroundColor: '#B02E0C !important',
                      borderColor: '#B02E0C !important',
                    },
                  },
                },
              },
              textField: {
                placeholder: placeholder,
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
                      borderColor: error ? '#EF4444' : '#9CA3AF !important',
                      borderWidth: '1px !important',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: error ? '#EF4444 !important' : 'rgba(0, 0, 0, 0.3) !important',
                      borderWidth: '1px !important',
                    },
                    '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#EF4444 !important',
                      borderWidth: '1px !important',
                    },
                    '&.Mui-disabled': {
                      opacity: 0.5,
                      cursor: 'not-allowed',
                      backgroundColor: '#F9FAFB',
                    },
                    '& fieldset': {
                      borderColor: error ? '#EF4444' : '#D1D5DB',
                      borderWidth: '1px',
                      transition: 'border-color 0.2s ease',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: error ? '#EF4444 !important' : 'rgba(0, 0, 0, 0.3) !important',
                      borderWidth: '1px !important',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    display: 'none',
                  },
                  '& .MuiInputBase-input': {
                    fontFamily: 'inherit',
                    fontSize: '0.875rem',
                    padding: '10px 16px',
                    color: '#060C12',
                    cursor: disabled ? 'not-allowed' : 'text',
                    '&::placeholder': {
                      color: '#060C1280',
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
                    color: '#EF4444',
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
      
      {error && (
        <p className="mt-1 text-sm text-accent">{error}</p>
      )}
    </div>
  );
}

