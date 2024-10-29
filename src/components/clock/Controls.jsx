import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Controls = ({ 
  isTouchDevice, 
  isAddMode, 
  setIsAddMode, 
  isDrawing, 
  handleClearAll,
  expandDirection = "up"  // New prop to control expansion direction
}) => {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className="md:w-64 bg-white rounded-lg shadow-sm">
      {isTouchDevice ? (
        <div className="relative">
          {/* Instructions panel - positioned absolutely when expanding up */}
          {showInstructions && (
            <div className={`absolute w-full bg-white rounded-lg shadow-sm ${
              expandDirection === "up" ? "bottom-full mb-2" : "top-full mt-2"
            }`}>
              <div className="p-3 bg-gray-50 rounded-lg">
                <ul className="list-disc pl-4 space-y-0.5 text-gray-600 text-xs md:text-sm">
                  <li>Use the Add/Remove button to switch modes</li>
                  <li>Touch and drag to add or remove areas</li>
                  <li>Long press circles to add or remove tears</li>
                </ul>
              </div>
            </div>
          )}

          {/* Main controls */}
          <div className="p-3 space-y-3">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 rounded"
            >
              <span className="text-sm font-medium">Instructions</span>
              {showInstructions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddMode(!isAddMode)}
                className={`min-w-[5rem] px-3 py-1.5 rounded text-xs md:text-sm font-medium transition-colors ${
                  isAddMode 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {isAddMode ? 'Add' : 'Remove'}
              </button>

              <button 
                onClick={handleClearAll}
                className="px-3 py-1.5 text-xs md:text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 space-y-3">
          <div className="text-xs md:text-sm">
            <p className="font-medium mb-2">Instructions:</p>
            <ul className="list-disc pl-4 space-y-0.5 text-gray-600">
              <li>Click and drag to paint areas</li>
              <li>Right-click and drag to erase</li>
              <li>Click circles to mark tears</li>
            </ul>
          </div>

          <button 
            onClick={handleClearAll}
            className="px-3 py-1.5 text-xs md:text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export default Controls;