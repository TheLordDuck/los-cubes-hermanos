import React from "react";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	content: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, content }) => {
	if (!isOpen) return null;

	return (
		<div className="fixed top-0 left-0 w-full h-full flex justify-center items-center">
			<div
				className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50"
				onClick={onClose}
			></div>
			<div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-50">
				<div className="bg-white rounded-lg p-4 max-w-xl w-3/4">
					<button onClick={onClose} className="absolute top-2 right-2">
						&times;
					</button>
					<div className="text-lg font-semibold">{content}</div>
					<button
						onClick={onClose}
						className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
};

export default Modal;
