import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                variant === 'danger'
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : variant === 'warning'
                  ? 'bg-yellow-100 dark:bg-yellow-900/30'
                  : 'bg-blue-100 dark:bg-blue-900/30'
              }`}
            >
              <AlertTriangle
                size={24}
                className={
                  variant === 'danger'
                    ? 'text-red-600 dark:text-red-400'
                    : variant === 'warning'
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-blue-600 dark:text-blue-400'
                }
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {title}
              </h3>
              {message && (
                <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              variant={variant === 'danger' ? 'danger' : 'primary'}
              onClick={handleConfirm}
              isLoading={isLoading}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
