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
    <div className="w-full p-4">
      <div className="@container">
        <div className="flex flex-col @[640px]:flex-row @[640px]:items-start @[640px]:justify-center @[640px]:gap-8 @[640px]:max-w-6xl @[640px]:mx-auto">
          <Controls
            isTouchDevice={isTouchDevice}
            isAddMode={isAddMode}
            setIsAddMode={setIsAddMode}
            isDrawing={isDrawing}
            handleClearAll={handleClearAll}
          />
          
          <ClockFace
            selectedHours={selectedHours}
            detachmentSegments={detachmentSegments}
            hoveredHour={hoveredHour}
            isTouchDevice={isTouchDevice}
            handlers={handlers}
          />
        </div>
      </div>
    </div>
  );
};

export default MinimalClockSelector;
