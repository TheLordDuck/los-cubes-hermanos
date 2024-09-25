import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}

const MechanicsModal: React.FC<ModalProps> = ({ isOpen, onClose, content }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center">
      {/* Background overlay */}
      <div
        className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal content */}
      <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-xl w-3/4 relative shadow-lg">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 text-2xl font-bold"
          >
            &times;
          </button>

          {/* Modal content */}
          <div className="text-lg font-semibold text-gray-900">{content}</div>

          {/* Close button at the bottom */}
          <button
            onClick={onClose}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MechanicsModal;
