import React from 'react';
import { getPosition, getSegmentPosition, createTearPath } from './utils/clockCalculations';
import { getStyles } from './styles/clockStyles';

const useLongPress = (onLongPress, onClick, { shouldPreventDefault = true, delay = 500 } = {}) => {
  const [longPressTriggered, setLongPressTriggered] = React.useState(false);
  const timeout = React.useRef();
  const target = React.useRef();

  const preventDefault = React.useCallback((event) => {
    if (!longPressTriggered) {
      event.preventDefault();
    }
  }, [longPressTriggered]);

  const start = React.useCallback(
    (event) => {
      // For touch events, we need to get the element differently
      const element = event.type.includes('touch') 
        ? document.elementFromPoint(
            event.touches[0].clientX,
            event.touches[0].clientY
          )
        : event.currentTarget;

      if (shouldPreventDefault && element) {
        element.addEventListener('touchend', preventDefault, {
          passive: false
        });
        target.current = element;
      }

      timeout.current = setTimeout(() => {
        onLongPress(element);
        setLongPressTriggered(true);
      }, delay);
    },
    [onLongPress, delay, shouldPreventDefault, preventDefault]
  );

  const clear = React.useCallback(
    (event, shouldTriggerClick = true) => {
      timeout.current && clearTimeout(timeout.current);
      shouldTriggerClick && !longPressTriggered && onClick?.(event);
      setLongPressTriggered(false);
      if (shouldPreventDefault && target.current) {
        target.current.removeEventListener('touchend', preventDefault);
      }
    },
    [shouldPreventDefault, onClick, longPressTriggered, preventDefault]
  );

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: clear,
    onMouseLeave: (e) => clear(e, false),
    onTouchEnd: clear
  };
};

const ClockFace = ({
  selectedHours,
  detachmentSegments,
  hoveredHour,
  isTouchDevice,
  onSegmentToggle,
  onTearToggle,
  onHoverChange
}) => {
  // Define radius parameters
  const outerRadius = 110;
  const innerRadius = 65;
  const middleRadius = Math.floor((outerRadius + innerRadius) / 2);
  const tearRadius = middleRadius + 12;
  const indicatorExtension = 10;

  const [isDrawing, setIsDrawing] = React.useState(false);
  const [lastDrawnSegment, setLastDrawnSegment] = React.useState(null);

  // Handle segment drawing/erasing
  const handleSegmentInteraction = (segmentId) => {
    if (lastDrawnSegment !== segmentId) {
      onSegmentToggle(segmentId);
      setLastDrawnSegment(segmentId);
    }
  };

  const handleDrawingStart = (segmentId) => {
    setIsDrawing(true);
    handleSegmentInteraction(segmentId);
  };

  const handleDrawingEnd = () => {
    setIsDrawing(false);
    setLastDrawnSegment(null);
  };

  // Long press handlers for tear markers
  const longPressHandlers = useLongPress(
    (element) => {
      // Safely get the hour from the element or its parent
      const hourElement = element?.closest('[data-hour]');
      const hour = hourElement ? parseInt(hourElement.dataset.hour) : null;
      if (hour) {
        onTearToggle(hour);
      }
    },
    null,
    { delay: 500 }
  );

  return (
    <div className="flex justify-center">
      <div 
        className="relative touch-none select-none"
        style={{
          width: 'min(80vw, min(80vh, 500px))',
          aspectRatio: '1',
          minWidth: '200px',
          maxWidth: '500px'
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <svg 
          viewBox="-110 -110 220 220" 
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          onMouseUp={handleDrawingEnd}
          onTouchEnd={handleDrawingEnd}
          onMouseLeave={handleDrawingEnd}
        >
          {/* Grid circles */}
          <circle cx="0" cy="0" r={outerRadius} fill="none" stroke="#e5e5e5" strokeWidth="1"/>
          <circle cx="0" cy="0" r={middleRadius} fill="none" stroke="#e5e5e5" strokeWidth="0.5"/>
          <circle cx="0" cy="0" r={innerRadius} fill="none" stroke="#e5e5e5" strokeWidth="1"/>

          {/* Detachment segments */}
          <g>
            {[...Array(60)].map((_, i) => {
              const isDetachmentSelected = detachmentSegments.includes(i);
              const nextSegment = (i + 1) % 60;
              
              return (
                <path
                  key={`segment-${i}`}
                  d={`M ${getSegmentPosition(i, innerRadius).x} ${getSegmentPosition(i, innerRadius).y} 
                      L ${getSegmentPosition(i, outerRadius).x} ${getSegmentPosition(i, outerRadius).y} 
                      A ${outerRadius} ${outerRadius} 0 0 1 ${getSegmentPosition(nextSegment, outerRadius).x} ${getSegmentPosition(nextSegment, outerRadius).y}
                      L ${getSegmentPosition(nextSegment, innerRadius).x} ${getSegmentPosition(nextSegment, innerRadius).y}
                      A ${innerRadius} ${innerRadius} 0 0 0 ${getSegmentPosition(i, innerRadius).x} ${getSegmentPosition(i, innerRadius).y}`}
                  fill={isDetachmentSelected ? "rgba(59, 130, 246, 0.5)" : "transparent"}
                  className="cursor-pointer hover:fill-blue-200 transition-colors"
                  onMouseDown={() => handleDrawingStart(i)}
                  onTouchStart={() => handleDrawingStart(i)}
                  onMouseEnter={() => isDrawing && handleSegmentInteraction(i)}
                  onTouchMove={(e) => {
                    if (isDrawing) {
                      const touch = e.touches[0];
                      const element = document.elementFromPoint(touch.clientX, touch.clientY);
                      const segmentId = element?.getAttribute('data-segment-id');
                      if (segmentId !== null) {
                        handleSegmentInteraction(parseInt(segmentId));
                      }
                    }
                  }}
                  data-segment-id={i}
                />
              );
            })}
          </g>

          {/* Tear markers */}
          <g>
            {[...Array(12)].map((_, i) => {
              const hour = i + 1;
              const visualPos = getPosition(hour, tearRadius);
              const interactionPos = isTouchDevice ? getPosition(hour, outerRadius) : visualPos;
              const isSelected = selectedHours.includes(hour);
              
              return (
                <g 
                  key={`tear-${hour}`}
                  {...(isTouchDevice ? longPressHandlers : { onClick: () => onTearToggle(hour) })}
                  onMouseEnter={() => onHoverChange(hour)}
                  onMouseLeave={() => onHoverChange(null)}
                  style={{ cursor: 'pointer' }}
                  data-hour={hour}
                >
                  {isTouchDevice && (
                    <circle
                      cx={interactionPos.x}
                      cy={interactionPos.y}
                      r="12"
                      fill="transparent"
                      className="touch-target"
                    />
                  )}
                  
                  {isSelected ? (
                    <path
                      {...createTearPath(visualPos.x, visualPos.y, visualPos.angle)}
                      style={getStyles(hour, hoveredHour, true)}
                    />
                  ) : (
                    <circle
                      cx={visualPos.x}
                      cy={visualPos.y}
                      r="12"
                      style={getStyles(hour, hoveredHour, false)}
                    />
                  )}
                </g>
              );
            })}
          </g>

          {/* 12 o'clock indicator */}
          <line 
            x1="0" 
            y1={-outerRadius} 
            x2="0" 
            y2={-(outerRadius + indicatorExtension)} 
            stroke="#666" 
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
};

export default ClockFace;