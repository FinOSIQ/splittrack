import React, { useState, useEffect } from 'react';

const ConfirmationModal = ({
  isOpen,
  title,
  message,
  details,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  onConfirm,
  onCancel,
  requiresTyping = false,
  requiredText = '',
  isLoading = false
}) => {
  const [userInput, setUserInput] = useState('');
  const [isConfirmEnabled, setIsConfirmEnabled] = useState(false);

  // Reset input when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setUserInput('');
      setIsConfirmEnabled(!requiresTyping);
    }
  }, [isOpen, requiresTyping]);

  // Check if user input matches required text
  useEffect(() => {
    if (requiresTyping) {
      setIsConfirmEnabled(userInput === requiredText);
    }
  }, [userInput, requiredText, requiresTyping]);

  const handleConfirm = () => {
    if (isConfirmEnabled && !isLoading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onCancel();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && isConfirmEnabled && !isLoading) {
      handleConfirm();
    } else if (e.key === 'Escape' && !isLoading) {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-gray-600">
            {message}
          </p>
          {details && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {details}
              </p>
            </div>
          )}
        </div>

        {/* Type to confirm input */}
        {requiresTyping && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type "{requiredText}" to confirm:
            </label>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Type "${requiredText}"`}
              disabled={isLoading}
              autoFocus
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelButtonText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isConfirmEnabled || isLoading}
            className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
              isConfirmEnabled && !isLoading
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              confirmButtonText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
