import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Controls = ({ isTouchDevice, isAddMode, setIsAddMode, isDrawing, handleClearAll }) => {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className="@[640px]:w-64 mb-4 @[640px]:mb-0">
      {isTouchDevice ? (
        <div className="mb-4">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 rounded"
          >
            <span className="text-sm font-medium">Instructions</span>
            {showInstructions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {showInstructions && (
            <div className="mt-2 text-xs md:text-sm bg-gray-50 p-3 rounded">
              <ul className="list-disc pl-4 space-y-0.5 text-gray-600">
                <li>Use the Add/Remove button to switch modes</li>
                <li>Touch and drag to add or remove areas</li>
                <li>Long press circles to add or remove tears</li>
              </ul>
            </div>
          )}

          <div className="mt-4">
            <button
              onClick={() => setIsAddMode(!isAddMode)}
              className={`px-3 py-1.5 rounded text-xs md:text-sm font-medium transition-colors ${
                isAddMode 
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              Mode: {isAddMode ? 'Add' : 'Remove'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-4 text-xs md:text-sm">
          <p className="font-medium mb-2">Instructions:</p>
          <ul className="list-disc pl-4 space-y-0.5 text-gray-600">
            <li>Click and drag to paint areas</li>
            <li>Right-click and drag to erase</li>
            <li>Click circles to mark tears</li>
          </ul>
        </div>
      )}

      <div className="flex justify-center @[640px]:justify-start">
        <button 
          onClick={handleClearAll}
          className="px-3 py-1.5 text-xs md:text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="mt-2 text-xs md:text-sm text-center @[640px]:text-left text-gray-500">
        {isDrawing && (isAddMode ? "Adding..." : "Removing...")}
      </div>
    </div>
  );
};

export default Controls;
