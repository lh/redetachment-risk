import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const DualSelectionClock = ({ onChange }) => {
  // ... previous state declarations remain the same ...

  const handleSegmentInteraction = (segment, isRightClick = false) => {
    // Remove the touch device check
    let newSelection;
    
    // For desktop, use right click as remove mode
    const shouldRemove = (isTouchDevice && !isAddMode) || (!isTouchDevice && isRightClick);
    
    if (shouldRemove) {
      newSelection = detachmentSegments.filter(s => s !== segment);
    } else {
      newSelection = detachmentSegments.includes(segment) 
        ? detachmentSegments 
        : [...detachmentSegments, segment];
    }
    
    setDetachmentSegments(newSelection);
    onChange?.({ 
      tears: selectedHours, 
      detachment: Array.from(new Set(newSelection.map(segmentToHour))) 
    });
  };

  const handleStartDrawing = (segment, event) => {
    event.preventDefault();
    drawingRef.current = true;
    setIsDrawing(true);
    // Pass right-click status for desktop
    handleSegmentInteraction(segment, event.button === 2);
  };

  const handleDrawing = (segment) => {
    if (drawingRef.current) {
      // Pass the same right-click status that was used to start drawing
      handleSegmentInteraction(segment, drawingRef.current === 'right');
    }
  };

  const handleMouseDown = (segment, event) => {
    event.preventDefault();
    // Store whether this is a right-click drag
    drawingRef.current = event.button === 2 ? 'right' : 'left';
    setIsDrawing(true);
    handleSegmentInteraction(segment, event.button === 2);
  };

  return (
    <div className="p-2 md:p-4 max-w-sm mx-auto">
      {/* ... previous JSX remains the same until the segments mapping ... */}
      
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
              onMouseDown={(e) => handleMouseDown(i, e)}
              onTouchStart={(e) => handleStartDrawing(i, e)}
              onMouseEnter={() => handleDrawing(i)}
              onTouchMove={(e) => {
                const touch = e.touches[0];
                const element = document.elementFromPoint(touch.clientX, touch.clientY);
                const segmentId = element?.getAttribute('data-segment-id');
                if (segmentId !== null) {
                  handleDrawing(parseInt(segmentId));
                }
              }}
              data-segment-id={i}
            />
          );
        })}
      </g>
      
      {/* ... rest of the component remains the same ... */}
    </div>
  );
};

export default DualSelectionClock;