import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Controls = ({ 
  isTouchDevice, 
  handleClearAll,
  expandDirection = "up"
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
                  <li>Touch and drag to mark or unmark detached areas</li>
                  <li>Long press the numbered circles to add or remove tear marks</li>
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

            <button 
              onClick={handleClearAll}
              className="w-full px-3 py-1.5 text-xs md:text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 space-y-3">
          <div className="text-xs md:text-sm">
            <p className="font-medium mb-2">Instructions:</p>
            <ul className="list-disc pl-4 space-y-0.5 text-gray-600">
              <li>Click and drag to toggle detached areas</li>
              <li>Click the numbered circles to toggle tear marks</li>
            </ul>
          </div>

          <button 
            onClick={handleClearAll}
            className="w-full px-3 py-1.5 text-xs md:text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export default Controls;