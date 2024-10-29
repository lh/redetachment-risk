import React, { useState, useRef, useCallback } from "react";
import {
  segmentToClockHour,
  clockHourToSegmentsMap
} from "./utils/clockMapping";

const ClockFace = ({
  selectedHours,
  detachmentSegments,
  hoveredHour,
  isTouchDevice,
  onSegmentToggle,
  onTearToggle,
  onHoverChange,
}) => {
  // Constants
  const outerRadius = 110;
  const innerRadius = 60;
  const middleRadius = Math.floor((outerRadius + innerRadius) / 2);
  const tearRadius = middleRadius + 14;
  const indicatorExtension = 1;

  // State
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState(null);
  const svgRef = useRef(null);

  // Utility functions
  const polarToCartesian = (angle, r) => {
    const radian = (angle - 90) * (Math.PI / 180);
    return {
      x: r * Math.cos(radian),
      y: r * Math.sin(radian)
    };
  };

  const cartesianToPolar = (x, y) => {
    const angle = Math.atan2(y, x) * (180 / Math.PI);
    return (90 - angle + 360) % 360;
  };

  const degreeToSegment = (degree) => {
    return Math.floor(degree / 6) % 60;
  };

  const segmentToDegree = (segment) => {
    return (segment * 6) % 360;
  };

  const formatHourRange = (range) => {
    if (!Array.isArray(range)) return '';
    if (range.length === 0) return '';
    if (range.length === 1) return `${range[0]}`;
    return `${range[0]}-${range[range.length - 1]}`;
  };

  // Style constants for tears
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

  // Style helper for tears
  const getStyles = (hour, hoveredHour, isSelected) => {
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

  // Tear path creation
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

  // Position calculation for hours
  const getPosition = (hour, radius) => {
    const angle = hour * 30; // 360/12 = 30 degrees per hour
    const point = polarToCartesian(angle, radius);
    return {
      ...point,
      angle,
      debug: {
        hour,
        clockAngle: angle
      }
    };
  };

  // Long press handler for tears
  const handleTearLongPress = useCallback((hour) => {
    let timeout;
    const start = () => {
      timeout = setTimeout(() => {
        onTearToggle(hour);
      }, 500);
    };
    const cancel = () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
    return {
      onMouseDown: start,
      onTouchStart: (e) => {
        e.preventDefault();
        start();
      },
      onMouseUp: cancel,
      onMouseLeave: cancel,
      onTouchEnd: cancel,
      onTouchCancel: cancel,
    };
  }, [onTearToggle]);

  // Event handlers
  const getSegmentFromPoint = useCallback((clientX, clientY) => {
    const svgRect = svgRef.current.getBoundingClientRect();
    const centerX = svgRect.left + svgRect.width / 2;
    const centerY = svgRect.top + svgRect.height / 2;
    const relX = clientX - centerX;
    const relY = -(clientY - centerY);
    const angle = cartesianToPolar(relX, relY);
    return degreeToSegment(angle);
  }, []);

  const handleDrawingStart = useCallback((e) => {
    e.preventDefault();
    setIsDrawing(true);
    const touch = e.touches?.[0] || e;
    const segment = getSegmentFromPoint(touch.clientX, touch.clientY);
    setLastPosition(segment);
    onSegmentToggle(segment);
  }, [getSegmentFromPoint, onSegmentToggle]);

  const handleDrawing = useCallback((e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const touch = e.touches?.[0] || e;
    const currentSegment = getSegmentFromPoint(touch.clientX, touch.clientY);
    if (currentSegment !== lastPosition) {
      onSegmentToggle(currentSegment);
      setLastPosition(currentSegment);
    }
  }, [isDrawing, lastPosition, getSegmentFromPoint, onSegmentToggle]);

  const handleDrawingEnd = useCallback((e) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);
    setLastPosition(null);
  }, [isDrawing]);

  // Selection description logic
  // Updated grouping function for detachment ranges
  const groupConsecutive = (numbers) => {
    if (numbers.length === 0) return [];
    const sorted = [...new Set(numbers)].sort((a, b) => a - b);
    const ranges = [];
    let range = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const curr = sorted[i];
      const prev = sorted[i - 1];
      const currSegments = clockHourToSegmentsMap.get(curr) || [];
      const prevSegments = clockHourToSegmentsMap.get(prev) || [];

      // Check if hours are consecutive, including 12-1 transition
      const isConsecutive = curr === prev + 1 || (prev === 12 && curr === 1);

      // Check for segments presence
      const hasPrevSegments = prevSegments.some(seg => detachmentSegments.includes(seg));
      const hasCurrSegments = currSegments.some(seg => detachmentSegments.includes(seg));

      // Hours are connected if they're consecutive and both have segments
      const isConnected = isConsecutive && hasPrevSegments && hasCurrSegments;

      if (isConnected) {
        range.push(curr);
      } else {
        // Only add the range if it has any segments
        if (hasPrevSegments) {
          ranges.push(range);
        }
        // Start new range if current hour has segments
        if (hasCurrSegments) {
          range = [curr];
        } else {
          range = [];
        }
      }
    }

    // Special handling for last range - check if it connects back to the beginning
    if (range.length > 0) {
      const lastHour = range[range.length - 1];
      const firstHour = sorted[0];
      const lastHourSegments = clockHourToSegmentsMap.get(lastHour) || [];
      const firstHourSegments = clockHourToSegmentsMap.get(firstHour) || [];

      // If the last hour is 12 and first is 1, and both have segments, merge them
      if (lastHour === 12 && firstHour === 1 &&
        lastHourSegments.some(seg => detachmentSegments.includes(seg)) &&
        firstHourSegments.some(seg => detachmentSegments.includes(seg))) {
        // Remove the first range if it exists and merge with last range
        if (ranges.length > 0) {
          const firstRange = ranges[0];
          ranges[0] = [...range, ...firstRange];
        } else {
          ranges.push(range);
        }
      } else if (lastHourSegments.some(seg => detachmentSegments.includes(seg))) {
        ranges.push(range);
      }
    }

    return ranges.filter(range => range.length > 0);
  };


  const createSelectionDescription = () => {
    // Handle tears (remains unchanged)
    const tearRanges = groupConsecutive(selectedHours);
    const tearDescription = tearRanges.length > 0
      ? `Breaks at ${tearRanges.map(formatHourRange).join(', ')} o'clock`
      : 'No breaks marked';

    // Handle detachment with updated logic
    const affectedHours = Array.from(clockHourToSegmentsMap.entries())
      .filter(([_, segments]) => segments.some(seg => detachmentSegments.includes(seg)))
      .map(([hour]) => hour);

    const detachmentRanges = groupConsecutive(affectedHours);
    const detachmentDescription = detachmentRanges.length > 0
      ? `Detachment from ${detachmentRanges.map(formatHourRange).join(', ')} o'clock`
      : 'No detachment marked';

    return { tearDescription, detachmentDescription };
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative touch-none select-none"
        style={{
          width: "min(80vw, min(80vh, 500px))",
          aspectRatio: "1",
          minWidth: "200px",
          maxWidth: "500px",
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <svg
          ref={svgRef}
          viewBox="-110 -110 220 220"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          onMouseDown={handleDrawingStart}
          onMouseMove={handleDrawing}
          onMouseUp={handleDrawingEnd}
          onMouseLeave={handleDrawingEnd}
          onTouchStart={handleDrawingStart}
          onTouchMove={handleDrawing}
          onTouchEnd={handleDrawingEnd}
        >
          {/* Background and grid circles */}
          <g className="pointer-events-none">
            <circle cx="0" cy="0" r={outerRadius} fill="none" stroke="#e5e5e5" strokeWidth="1" />
            <circle cx="0" cy="0" r={middleRadius} fill="none" stroke="#e5e5e5" strokeWidth="0.5" />
            <circle cx="0" cy="0" r={innerRadius} fill="none" stroke="#e5e5e5" strokeWidth="1" />
          </g>

          {/* Detachment segments layer */}
          <g
            className="pointer-events-auto"
            style={{ pointerEvents: selectedHours.length > 0 ? 'none' : 'auto' }}
          >
            {[...Array(60)].map((_, i) => {
              const degree = segmentToDegree(i);
              const pos = polarToCartesian(degree, innerRadius);
              const posOuter = polarToCartesian(degree, outerRadius);
              const nextDegree = segmentToDegree(i + 1);
              const nextPos = polarToCartesian(nextDegree, innerRadius);
              const nextPosOuter = polarToCartesian(nextDegree, outerRadius);

              return (
                <path
                  key={`segment-${i}`}
                  d={`M ${pos.x} ${pos.y} 
            L ${posOuter.x} ${posOuter.y} 
            A ${outerRadius} ${outerRadius} 0 0 1 ${nextPosOuter.x} ${nextPosOuter.y}
            L ${nextPos.x} ${nextPos.y}
            A ${innerRadius} ${innerRadius} 0 0 0 ${pos.x} ${pos.y}`}
                  fill={detachmentSegments.includes(i) ? "rgba(59, 130, 246, 0.5)" : "transparent"}
                  className="cursor-pointer hover:fill-blue-200 transition-colors"
                  style={{ pointerEvents: selectedHours.length > 0 ? 'none' : 'auto' }}
                />
              );
            })}
          </g>

          {/* Tear markers layer with enhanced event control */}
          <g className="pointer-events-auto" style={{ pointerEvents: 'auto' }}>
            {[...Array(12)].map((_, i) => {
              const hour = i === 0 ? 12 : i;
              const visualPos = getPosition(hour, tearRadius);
              const interactionPos = isTouchDevice ? getPosition(hour, outerRadius) : visualPos;
              const isSelected = selectedHours.includes(hour);

              return (
                <g
                  key={`tear-${hour}`}
                  {...(isTouchDevice
                    ? handleTearLongPress(hour)
                    : {
                      onClick: (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onTearToggle(hour);
                      },
                      onMouseDown: (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      },
                      onMouseUp: (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }
                  )}
                  onMouseEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onHoverChange(hour);
                  }}
                  onMouseLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onHoverChange(null);
                  }}
                  style={{
                    cursor: "pointer",
                    pointerEvents: 'auto'
                  }}
                  className="pointer-events-auto"
                >
                  {isTouchDevice && (
                    <circle
                      cx={interactionPos.x}
                      cy={interactionPos.y}
                      r="12"
                      fill="transparent"
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

                  {/* Hour label 
                  <text
                    x={visualPos.x}
                    y={visualPos.y}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fontSize="8"
                    fill="black"
                  >
                    {hour}
                  </text>
                  */}
                </g>
              );
            })}
          </g>

          {/* 12 o'clock indicator */}
          <line
            className="pointer-events-none"
            x1="0"
            y1={-outerRadius}
            x2="0"
            y2={-(outerRadius + indicatorExtension)}
            stroke="#666"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Description panel */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Current Selection:</h3>
          <div className="space-y-1">
            {(() => {
              // Get affected hours for detachment
              const affectedHours = Array.from(clockHourToSegmentsMap.entries())
                .filter(([_, segments]) => segments.some(seg => detachmentSegments.includes(seg)))
                .map(([hour]) => hour)
                .sort((a, b) => a - b);

              return (
                <>
                  <p className="text-sm text-gray-600">
                    {selectedHours.length > 0
                      ? `Breaks at ${selectedHours.sort((a, b) => a - b).join(', ')} o'clock`
                      : 'No breaks marked'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {affectedHours.length > 0
                      ? `Detachment at ${affectedHours.join(', ')} o'clock`
                      : 'No detachment marked'}
                  </p>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClockFace;
