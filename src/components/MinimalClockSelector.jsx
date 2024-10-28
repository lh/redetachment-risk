import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const DualSelectionClock = ({ onChange }) => {
  const [selectedHours, setSelectedHours] = useState([]);
  const [detachmentSegments, setDetachmentSegments] = useState([]);
  const [hoveredHour, setHoveredHour] = useState(null);
  const [isAddMode, setIsAddMode] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [pressTimer, setPressTimer] = useState(null);
  
  const drawingRef = useRef(false);
  const touchStartTime = useRef(null);
  const touchStartPosition = useRef(null);
  const longPressThreshold = 300;
  const moveThreshold = 10;

  const styles = {
    transition: 'fill 0.2s ease, stroke 0.2s ease',
    tear: {
      default: {
        fill: '#dc2626',
        stroke: '#dc2626',
        strokeWidth: '0.5'
      },
      hover: {
        fill: '#b91c1c',
        stroke: '#b91c1c',
        strokeWidth: '0.5'
      }
    },
    circle: {
      default: {
        fill: 'white',
        stroke: '#d1d5db',
        strokeWidth: '1.5'
      },
      hover: {
        fill: '#fee2e2',
        stroke: '#d1d5db',
        strokeWidth: '1.5'
      }
    }
  };

  const getStyles = (hour, isSelected) => {
    const isHovered = hoveredHour === hour;
    if (isSelected) {
      return {
        ...styles.tear.default,
        ...(isHovered ? styles.tear.hover : {}),
        transition: styles.transition
      };
    }
    return {
      ...styles.circle.default,
      ...(isHovered ? styles.circle.hover : {}),
      transition: styles.transition
    };
  };

  const handleTearTouchMove = (event) => {
    if (touchStartPosition.current) {
      const moveX = Math.abs(event.touches[0].clientX - touchStartPosition.current.x);
      const moveY = Math.abs(event.touches[0].clientY - touchStartPosition.current.y);
      
      if (moveX > moveThreshold || moveY > moveThreshold) {
        clearTimeout(pressTimer);
        setPressTimer(null);
      }
    }
  };

  const handleTearTouchEnd = () => {
    clearTimeout(pressTimer);
    setPressTimer(null);
    touchStartTime.current = null;
    touchStartPosition.current = null;
  };

  // Detect touch device
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Prevent scrolling on touch devices when interacting with the clock
  useEffect(() => {
    const preventDefault = (e) => {
      if (drawingRef.current) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventDefault, { passive: false });
    return () => {
      document.removeEventListener('touchmove', preventDefault);
    };
  }, []);

  // Clean up timer when component unmounts
  useEffect(() => {
    return () => {
      if (pressTimer) {
        clearTimeout(pressTimer);
      }
    };
  }, [pressTimer]);

  const segmentToHour = (segment) => Math.floor(segment / 5) + 1;
  
  const getPosition = (hour, radius) => {
    const angle = (hour * 30 - 90) * (Math.PI / 180);
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
      angle: (hour * 30)
    };
  };

  const getSegmentPosition = (segment, radius) => {
    const angle = (segment * 6 - 75) * (Math.PI / 180);
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle)
    };
  };

  const createTearPath = (x, y, angle) => {
    const tearPath = `
      M -4 -8
      c -0.091 -0.936 0.333 -1.232 0.777 0.658
      c 0.389 1.655 1.060 3.281 1.060 3.281
      s 0 0.254 1.022 0.617
      c 0.793 0.282 2.183 -2.882 2.183 -2.882
      s 1.953 -4.433 1.437 -1.294
      c -1.217 7.410 -1.640 6.716 -1.664 6.897
      c -0.024 0.181 -0.510 0.596 -0.510 0.596
      s -0.178 0.183 -0.585 0.327
      c -3.121 1.110 -3.163 -3.001 -3.163 -3.001
      L -4 -8
    `;
    return {
      d: tearPath,
      transform: `translate(${x}, ${y}) scale(1.5) rotate(${angle})`
    };
  };

  const handleTearTouchStart = (hour, event) => {
    if (!isTouchDevice) return;
    event.preventDefault();
    
    // Only allow add/remove based on current mode
    if (isAddMode && selectedHours.includes(hour)) return;
    if (!isAddMode && !selectedHours.includes(hour)) return;

    touchStartTime.current = Date.now();
    touchStartPosition.current = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };

    const timer = setTimeout(() => {
      const newSelection = isAddMode
        ? [...selectedHours, hour]
        : selectedHours.filter(h => h !== hour);
      setSelectedHours(newSelection);
      onChange?.({ 
        tears: newSelection, 
        detachment: Array.from(new Set(detachmentSegments.map(segmentToHour))) 
      });
    }, longPressThreshold);

    setPressTimer(timer);
  };

  const handleSegmentInteraction = (segment, isRightClick = false) => {
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
    handleSegmentInteraction(segment, event.button === 2);
  };

  const handleDrawing = (segment) => {
    if (drawingRef.current) {
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

  const handleTearClick = (hour, event) => {
    if (!isTouchDevice) {
      event.stopPropagation();
      const newSelection = selectedHours.includes(hour)
        ? selectedHours.filter(h => h !== hour)
        : [...selectedHours, hour];
      setSelectedHours(newSelection);
      onChange?.({ 
        tears: newSelection, 
        detachment: Array.from(new Set(detachmentSegments.map(segmentToHour))) 
      });
    }
  };

  const handleEndDrawing = () => {
    drawingRef.current = false;
    setIsDrawing(false);
  };

  useEffect(() => {
    const cleanUp = () => {
      handleEndDrawing();
    };
    
    window.addEventListener('mouseup', cleanUp);
    window.addEventListener('touchend', cleanUp);
    
    return () => {
      window.removeEventListener('mouseup', cleanUp);
      window.removeEventListener('touchend', cleanUp);
    };
  }, []);  
  const clockSize = isTouchDevice ? 288 : 192; // 288px = w-72, 192px = w-48

  return (
    <div className="p-2 md:p-4 w-full">
      {/* Instructions and controls container */}
      <div className="max-w-sm mx-auto mb-4">
                {/* Instructions dropdown for mobile */}
                {isTouchDevice && (
          <div className="mb-2 md:mb-4">
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
          </div>
        )}

        {/* Desktop instructions */}
        {!isTouchDevice && (
          <div className="mb-2 md:mb-4 text-xs md:text-sm">
            <p className="font-medium mb-1 md:mb-2">Instructions:</p>
            <ul className="list-disc pl-4 space-y-0.5 text-gray-600">
              <li>Click and drag to paint areas</li>
              <li>Right-click and drag to erase</li>
              <li>Click circles to mark tears</li>
            </ul>
          </div>
        )}

        {/* Mode switch button for mobile */}
        {isTouchDevice && (
          <div className="mb-2 md:mb-4">
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
        )}
      </div>

      {/* Clock container with inline sizing */}
      <div className="flex justify-center items-center">
        <div 
          className="relative touch-none select-none"
          style={{
            width: `${clockSize}px`,
            height: `${clockSize}px`
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <svg 
            viewBox="-110 -110 220 220" 
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
            onMouseLeave={handleEndDrawing}
            onTouchEnd={handleEndDrawing}
          >
            {/* ... SVG content remains the same ... */}
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

            <g>
              {/* Hour markers and tears */}
              <g>
                {[...Array(12)].map((_, i) => {
                  const hour = i + 1;
                  const visualPos = getPosition(hour, 75);
                  const interactionPos = isTouchDevice ? getPosition(hour, 100) : visualPos;
                  const isSelected = selectedHours.includes(hour);
                  
                  return (
                    <g 
                      key={`tear-${hour}`}
                      onClick={(e) => handleTearClick(hour, e)}
                      onTouchStart={(e) => handleTearTouchStart(hour, e)}
                      onTouchMove={handleTearTouchMove}
                      onTouchEnd={handleTearTouchEnd}
                      onMouseEnter={() => setHoveredHour(hour)}
                      onMouseLeave={() => setHoveredHour(null)}
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
                          style={getStyles(hour, true)}
                        />
                      ) : (
                        <circle
                          cx={visualPos.x}
                          cy={visualPos.y}
                          r="12"
                          style={getStyles(hour, false)}
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            </g>

            {/* North marker */}
            <line x1="0" y1="-100" x2="0" y2="-110" stroke="#666" strokeWidth="2"/>          </svg>            
        </div>
      </div>

      {/* Controls container */}
      <div className="max-w-sm mx-auto">
      <div className="mt-2 md:mt-4 flex justify-center">
          <button 
            onClick={() => {
              setSelectedHours([]);
              setDetachmentSegments([]);
              onChange?.({ tears: [], detachment: [] });
            }}
            className="px-3 py-1.5 text-xs md:text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            Clear All
          </button>
        </div>

        <div className="mt-1 md:mt-2 text-xs md:text-sm text-center text-gray-500">
          {isDrawing && (isAddMode ? "Adding..." : "Removing...")}
        </div>        
      </div>
    </div>
  );
};

export default DualSelectionClock;
