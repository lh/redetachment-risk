import React from 'react';
import { getPosition, getSegmentPosition, createTearPath } from './utils/clockCalculations';
import { getStyles } from './styles/clockStyles';

const ClockFace = ({
  selectedHours,
  detachmentSegments,
  hoveredHour,
  isTouchDevice,
  handlers
}) => {
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
          onMouseLeave={handlers.handleEndDrawing}
          onTouchEnd={handlers.handleEndDrawing}
        >
          <circle cx="0" cy="0" r="100" fill="none" stroke="#e5e5e5" strokeWidth="1"/>
          <circle cx="0" cy="0" r="85" fill="none" stroke="#e5e5e5" strokeWidth="0.5"/>
          <circle cx="0" cy="0" r="70" fill="none" stroke="#e5e5e5" strokeWidth="1"/>

          <g>
            {[...Array(60)].map((_, i) => {
              const isDetachmentSelected = detachmentSegments.includes(i);
              const nextSegment = (i + 1) % 60;
              
              return (
                <path
                  key={`segment-${i}`}
                  d={`M ${getSegmentPosition(i, 70).x} ${getSegmentPosition(i, 70).y} 
                      L ${getSegmentPosition(i, 100).x} ${getSegmentPosition(i, 100).y} 
                      A 100 100 0 0 1 ${getSegmentPosition(nextSegment, 100).x} ${getSegmentPosition(nextSegment, 100).y}
                      L ${getSegmentPosition(nextSegment, 70).x} ${getSegmentPosition(nextSegment, 70).y}
                      A 70 70 0 0 0 ${getSegmentPosition(i, 70).x} ${getSegmentPosition(i, 70).y}`}
                  fill={isDetachmentSelected ? "rgba(59, 130, 246, 0.5)" : "transparent"}
                  className="cursor-pointer hover:fill-blue-200 transition-colors"
                  onMouseDown={(e) => handlers.handleMouseDown(i, e)}
                  onTouchStart={(e) => handlers.handleStartDrawing(i, e)}
                  onMouseEnter={() => handlers.handleDrawing(i)}
                  onTouchMove={(e) => {
                    const touch = e.touches[0];
                    const element = document.elementFromPoint(touch.clientX, touch.clientY);
                    const segmentId = element?.getAttribute('data-segment-id');
                    if (segmentId !== null) {
                      handlers.handleDrawing(parseInt(segmentId));
                    }
                  }}
                  data-segment-id={i}
                />
              );
            })}
          </g>

          <g>
            {[...Array(12)].map((_, i) => {
              const hour = i + 1;
              const visualPos = getPosition(hour, 75);
              const interactionPos = isTouchDevice ? getPosition(hour, 100) : visualPos;
              const isSelected = selectedHours.includes(hour);
              
              return (
                <g 
                  key={`tear-${hour}`}
                  onClick={(e) => handlers.handleTearClick(hour, e)}
                  onTouchStart={(e) => handlers.handleTearTouchStart(hour, e)}
                  onTouchMove={handlers.handleTearTouchMove}
                  onTouchEnd={handlers.handleTearTouchEnd}
                  onMouseEnter={() => handlers.setHoveredHour(hour)}
                  onMouseLeave={() => handlers.setHoveredHour(null)}
                  style={{ cursor: 'pointer' }}
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

          <line x1="0" y1="-100" x2="0" y2="-110" stroke="#666" strokeWidth="2"/>
        </svg>
      </div>
    </div>
  );
};

export default ClockFace;
