import React from 'react';
import Controls from './Controls';
import ClockFace from './ClockFace';
import { useClockInteractions } from './hooks/useClockInteractions';

const MinimalClockSelector = ({ onChange }) => {
  const {
    selectedHours,
    detachmentSegments,
    hoveredHour,
    setHoveredHour,
    isAddMode,
    setIsAddMode,
    isDrawing,
    isTouchDevice,
    handleTearTouchMove,
    handleTearTouchEnd,
    handleSegmentInteraction,
    handleStartDrawing,
    handleDrawing,
    handleMouseDown,
    handleTearClick,
    handleTearTouchStart,
    handleEndDrawing,
    handleClearAll
  } = useClockInteractions(onChange);

  const handlers = {
    setHoveredHour,
    handleTearTouchMove,
    handleTearTouchEnd,
    handleSegmentInteraction,
    handleStartDrawing,
    handleDrawing,
    handleMouseDown,
    handleTearClick,
    handleTearTouchStart,
    handleEndDrawing
  };

  return (
    <div className="w-full min-h-screen p-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Main content wrapper */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
          {/* Clock section */}
          <div className="w-full max-w-2xl md:flex-1">
            <ClockFace
              selectedHours={selectedHours}
              detachmentSegments={detachmentSegments}
              hoveredHour={hoveredHour}
              isTouchDevice={isTouchDevice}
              handlers={handlers}
            />
          </div>

          {/* Controls section */}
          <div className="fixed md:static bottom-4 left-1/2 landscape:left-auto landscape:right-4 transform -translate-x-1/2 md:translate-x-0 landscape:translate-x-0 md:ml-8">
            <div className="relative">
              <Controls
                isTouchDevice={isTouchDevice}
                isAddMode={isAddMode}
                setIsAddMode={setIsAddMode}
                isDrawing={false}
                handleClearAll={handleClearAll}
                expandDirection="up"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimalClockSelector;