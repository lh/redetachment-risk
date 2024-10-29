import React from 'react';
import Controls from './Controls';
import ClockFace from './ClockFace';
import { useClockInteractions } from './hooks/useClockInteractions';

const containerStyles = {
  width: '100%',
  padding: '1rem'
};

const layoutStyles = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: '2rem',
  maxWidth: '1200px',
  margin: '0 auto'
};

const controlStyles = {
  width: '300px',
  flexShrink: 0
};

const clockContainerStyles = {
  flex: '1 1 auto',
  display: 'flex',
  justifyContent: 'center'
};

// Media query styles will be added via CSS
const responsiveStyles = `
  @media (max-width: 768px) {
    .layout-container {
      flex-direction: column;
    }
    .controls-container {
      width: 100%;
      margin-bottom: 1rem;
    }
  }
`;

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

  // Add the responsive styles to the document
  React.useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.innerText = responsiveStyles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  return (
    <div style={containerStyles}>
      <div style={layoutStyles} className="layout-container">
        <div style={controlStyles} className="controls-container">
          <Controls
            isTouchDevice={isTouchDevice}
            isAddMode={isAddMode}
            setIsAddMode={setIsAddMode}
            isDrawing={isDrawing}
            handleClearAll={handleClearAll}
          />
        </div>
        
        <div style={clockContainerStyles}>
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