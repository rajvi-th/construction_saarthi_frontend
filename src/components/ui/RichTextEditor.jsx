/**
 * RichTextEditor Component
 * A rich text editor with formatting toolbar
 */

import { useRef, useEffect, useState } from 'react';
import {
  Undo2,
  Redo2,
  List,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Quote,
  Minus,
  ChevronDown,
  X,
} from 'lucide-react';
import Input from './Input';
import Button from './Button';

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Enter text here',
  className = '',
  disabled = false,
}) {
  const editorRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [showAlignmentMenu, setShowAlignmentMenu] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const alignmentMenuRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        alignmentMenuRef.current &&
        !alignmentMenuRef.current.contains(event.target)
      ) {
        setShowAlignmentMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateEditor();
  };

  const updateEditor = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const handleKeyDown = (e) => {
    // Handle shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        default:
          break;
      }
    }
  };

  const handleImageClick = () => {
    setShowImageModal(true);
  };

  const handleLinkClick = () => {
    setShowLinkModal(true);
  };

  const handleInsertImage = () => {
    if (imageUrl.trim()) {
      execCommand('insertImage', imageUrl.trim());
      setImageUrl('');
      setShowImageModal(false);
    }
  };

  const handleInsertLink = () => {
    if (linkUrl.trim()) {
      execCommand('createLink', linkUrl.trim());
      setLinkUrl('');
      setShowLinkModal(false);
    }
  };

  const ToolbarButton = ({ icon: Icon, onClick, isActive = false, hasDropdown = false, title }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`
        p-1.5 sm:p-2 rounded hover:bg-gray-100 transition-colors relative
        ${isActive ? 'bg-gray-200' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      disabled={disabled}
    >
      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
      {hasDropdown && (
        <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary absolute -bottom-0.5 -right-0.5" />
      )}
    </button>
  );

  return (
    <div className={`border border-black-soft rounded-lg overflow-hidden bg-white ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-black-soft p-1.5 sm:p-2 flex items-center justify-center gap-0.5 sm:gap-1 flex-wrap">
        {/* Undo */}
        <ToolbarButton
          icon={Undo2}
          onClick={() => execCommand('undo')}
          disabled={!canUndo || disabled}
          title="Undo (Ctrl+Z)"
        />

        {/* Redo */}
        <ToolbarButton
          icon={Redo2}
          onClick={() => execCommand('redo')}
          disabled={!canRedo || disabled}
          title="Redo (Ctrl+Y)"
        />

        {/* Divider */}
        <div className="w-px h-5 sm:h-6 bg-gray-300 mx-0.5 sm:mx-1" />

        {/* Bullet List */}
        <ToolbarButton
          icon={List}
          onClick={() => execCommand('insertUnorderedList')}
          title="Bullet List"
        />

        {/* Numbered List */}
        <ToolbarButton
          icon={ListOrdered}
          onClick={() => execCommand('insertOrderedList')}
          title="Numbered List"
        />

        {/* Bold */}
        <ToolbarButton
          icon={Bold}
          onClick={() => execCommand('bold')}
          title="Bold (Ctrl+B)"
        />

        {/* Italic */}
        <ToolbarButton
          icon={Italic}
          onClick={() => execCommand('italic')}
          title="Italic (Ctrl+I)"
        />

        {/* Underline */}
        <ToolbarButton
          icon={Underline}
          onClick={() => execCommand('underline')}
          title="Underline (Ctrl+U)"
        />

        {/* Divider */}
        <div className="w-px h-5 sm:h-6 bg-gray-300 mx-0.5 sm:mx-1" />

        {/* Alignment Options */}
        <div className="relative" ref={alignmentMenuRef}>
          <ToolbarButton
            icon={AlignLeft}
            onClick={() => setShowAlignmentMenu(!showAlignmentMenu)}
            hasDropdown
            title="Alignment"
          />
          {showAlignmentMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px] sm:min-w-[150px]">
              <button
                type="button"
                onClick={() => {
                  execCommand('justifyLeft');
                  setShowAlignmentMenu(false);
                }}
                className="w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <AlignLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Align Left
              </button>
              <button
                type="button"
                onClick={() => {
                  execCommand('justifyCenter');
                  setShowAlignmentMenu(false);
                }}
                className="w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <AlignCenter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Align Center
              </button>
              <button
                type="button"
                onClick={() => {
                  execCommand('justifyRight');
                  setShowAlignmentMenu(false);
                }}
                className="w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <AlignRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Align Right
              </button>
              <button
                type="button"
                onClick={() => {
                  execCommand('justifyFull');
                  setShowAlignmentMenu(false);
                }}
                className="w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <AlignJustify className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Justify
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 sm:h-6 bg-gray-300 mx-0.5 sm:mx-1" />

        {/* Link */}
        <ToolbarButton
          icon={LinkIcon}
          onClick={handleLinkClick}
          title="Insert Link"
        />

        {/* Image */}
        <ToolbarButton
          icon={ImageIcon}
          onClick={handleImageClick}
          title="Insert Image"
        />

        {/* Divider */}
        <div className="w-px h-5 sm:h-6 bg-gray-300 mx-0.5 sm:mx-1" />

        {/* Code Block */}
        <ToolbarButton
          icon={Code}
          onClick={() => execCommand('formatBlock', '<pre>')}
          title="Code Block"
        />

        {/* Quote */}
        <ToolbarButton
          icon={Quote}
          onClick={() => execCommand('formatBlock', '<blockquote>')}
          title="Quote"
        />

        {/* Horizontal Rule */}
        <ToolbarButton
          icon={Minus}
          onClick={() => execCommand('insertHorizontalRule')}
          title="Horizontal Rule"
        />
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={updateEditor}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        className={`
          min-h-[150px] sm:min-h-[200px] max-h-[400px] sm:max-h-[500px] overflow-y-auto p-3 sm:p-4
          focus:outline-none text-primary text-sm sm:text-base
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white cursor-text'}
          [&:empty:before]:content-[attr(data-placeholder)]
          [&:empty:before]:text-secondary
          [&:empty:before]:cursor-text
        `}
        suppressContentEditableWarning
      />

      {/* Link Modal */}
      {showLinkModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowLinkModal(false);
              setLinkUrl('');
            }
          }}
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl w-full max-w-md mx-4">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-semibold text-primary">Insert Link</h3>
              <button
                type="button"
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkUrl('');
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
              </button>
            </div>
            <div className="px-4 sm:px-6 py-4 sm:py-6">
              <Input
                label="Link URL"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleInsertLink();
                  }
                }}
                autoFocus
              />
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-end px-4 sm:px-6 pb-4 sm:pb-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkUrl('');
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleInsertLink}
                disabled={!linkUrl.trim()}
                className="w-full sm:w-auto"
              >
                Insert
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowImageModal(false);
              setImageUrl('');
            }
          }}
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl w-full max-w-md mx-4">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-semibold text-primary">Insert Image</h3>
              <button
                type="button"
                onClick={() => {
                  setShowImageModal(false);
                  setImageUrl('');
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
              </button>
            </div>
            <div className="px-4 sm:px-6 py-4 sm:py-6">
              <Input
                label="Image URL"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleInsertImage();
                  }
                }}
                autoFocus
              />
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-end px-4 sm:px-6 pb-4 sm:pb-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowImageModal(false);
                  setImageUrl('');
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleInsertImage}
                disabled={!imageUrl.trim()}
                className="w-full sm:w-auto"
              >
                Insert
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

