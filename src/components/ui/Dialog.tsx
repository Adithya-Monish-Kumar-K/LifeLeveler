// components/ui/Dialog.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';

interface DialogProps {
  title: string;
  description?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function Dialog({ title, description, onClose, onConfirm }: DialogProps) {
  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 space-y-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && <p className="text-sm text-gray-600">{description}</p>}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Confirm</Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
