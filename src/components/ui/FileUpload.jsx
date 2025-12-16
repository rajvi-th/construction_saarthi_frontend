/**
 * FileUpload Component
 * Upload documents component with drag and drop support
 */

import { useState, useRef } from 'react';
import UploadIcon from '../../assets/icons/Upload.svg?url';
import Button from './Button';

export default function FileUpload({
  title = 'Upload Relevant Documents',
  supportedFormats = 'PDF, JPG, PNG',
  maxSize = 10,
  maxSizeUnit = 'MB',
  maxSizeText = '',
  onFileSelect,
  className = '',
  accept = '.pdf,.jpg,.jpeg,.png',
  uploadButtonText = 'Upload',
  supportedFormatLabel = 'Supported Format:',
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    if (files.length > 0 && onFileSelect) {
      onFileSelect(files);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`${className}`}>
      <div
        className={`
          border-2 border-dotted rounded-xl p-4 sm:p-6 md:p-8 text-center transition-colors cursor-pointer
          ${isDragging ? 'border-accent bg-accent' : 'border-[rgba(176,46,12,0.22)]'}
        `}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Upload Icon */}
        <div className="flex justify-center mb-3 sm:mb-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[rgba(176,46,12,0.04)] flex items-center justify-center">
            <img
              src={UploadIcon}
              alt="Upload"
              className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
            />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold text-primary mb-2">
          {title}
        </h3>

        {/* Supported Formats */}
        <p className="text-xs sm:text-sm text-secondary mb-4 sm:mb-6">
          {supportedFormatLabel}{' '}
          {supportedFormats}{' '}
          ({maxSizeText || `${maxSize}${maxSizeUnit} EACH`})
        </p>

        {/* Upload Button */}
        <div className="flex justify-center">
          <Button
            variant="primary"
            onClick={handleButtonClick}
          >
            {uploadButtonText}
          </Button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    </div>
  );
}

