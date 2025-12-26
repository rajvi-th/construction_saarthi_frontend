/**
 * LabourMoveProjectModal
 * Modal to move a labour to another project
 */

import { useEffect, useMemo, useState } from 'react';
import Button from './Button';
import Dropdown from './Dropdown';

export default function LabourMoveProjectModal({
  isOpen,
  onClose,
  onMove,
  projects = [],
  title = 'Move To Another Project',
  isSubmitting = false,
}) {
  const [projectId, setProjectId] = useState('');

  const projectOptions = useMemo(
    () => projects.map((p) => ({ label: p.label || p.name, value: p.value || p.id })),
    [projects]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setProjectId('');
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMove = () => {
    if (isSubmitting) return;
    onMove?.(projectId);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose?.();
      }}
    >
      <div className="bg-white rounded-[24px] shadow-xl w-full max-w-2xl my-auto px-6 py-4">
        <h2 className="text-[20px] font-semibold text-primary mb-2">
          {title}
        </h2>

        <div className="space-y-6">
          <Dropdown
            label="Project"
            value={projectId}
            onChange={setProjectId}
            options={projectOptions}
            placeholder="Enter contract type"
            className="w-full"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 mt-6">
          <Button
            variant="secondary"
            size="md"
            className="w-full sm:w-[140px]"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            className="w-full sm:w-[160px]"
            onClick={handleMove}
            disabled={!projectId || isSubmitting}
          >
            {isSubmitting ? 'Moving…' : 'Move'}
          </Button>
        </div>
      </div>
    </div>
  );
}


