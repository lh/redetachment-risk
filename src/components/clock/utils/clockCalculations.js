import React, { useState, useRef, useCallback } from "react";

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
  const innerRadius = 65;
  const middleRadius = Math.floor((outerRadius + innerRadius) / 2);
  const tearRadius = middleRadius + 12;
  const indicatorExtension = 10;

  // Style constants
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

  // State
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState(null);
  const svgRef = useRef(null);

  // Utility functions
  const polarToCartesian = (angle, r) => {
    const radian = (angle - 90) * (Math.PI / 180); // -90 to start at top
    return {
      x: r * Math.cos(radian),
      y: r * Math.sin(radian)
    };
  };

  const cartesianToPolar = (x, y) => {
    const angle = Math.atan2(y, x) * (180 / Math.PI);
    return (90 - angle + 360) % 360; // Convert to clockwise from top
  };

  const degreeToSegment = (degree) => {
    return Math.floor(degree / 6) % 60;
  };

  const segmentToDegree = (segment) => {
    return (segment * 6) % 360;
  };

  const hourToDegree = (hour) => {
    return ((hour - 1) * 30) % 360;
  };

  const getPosition = (hour, radius) => {
    const degree = hourToDegree(hour);
    const point = polarToCartesian(degree, radius);
    return {
      ...point,
      angle: degree,
      debug: {
        hour,
        clockAngle: degree
      }
    };
  };

  // Style helper
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

  // Create tear path for selected hours
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

  // Get segment from mouse/touch position
  const getSegmentFromPoint = useCallback((clientX, clientY) => {
    const svgRect = svgRef.current.getBoundingClientRect();
    const centerX = svgRect.left + svgRect.width / 2;
    const centerY = svgRect.top + svgRect.height / 2;

    // Get coordinates relative to center
    const relX = clientX - centerX;
    const relY = -(clientY - centerY); // Flip Y for SVG coordinate system

    const angle = cartesianToPolar(relX, relY);
    return degreeToSegment(angle);
  }, []);

  // Event handlers
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

  return (
    <div className="flex justify-center">
      <div
        className="relative touch-none select-none"
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
          {/* Grid circles */}
          <circle cx="0" cy="0" r={outerRadius} fill="none" stroke="#e5e5e5" strokeWidth="1" />
          <circle cx="0" cy="0" r={middleRadius} fill="none" stroke="#e5e5e5" strokeWidth="0.5" />
          <circle cx="0" cy="0" r={innerRadius} fill="none" stroke="#e5e5e5" strokeWidth="1" />

          {/* Detachment segments */}
          <g>
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
                />
              );
            })}
          </g>

          {/* Hour markers and tears */}
          <g>
            {[...Array(12)].map((_, i) => {
              const hour = i === 0 ? 12 : i;
              const visualPos = getPosition(hour, tearRadius);
              const interactionPos = isTouchDevice
                ? getPosition(hour, outerRadius)
                : visualPos;
              const isSelected = selectedHours.includes(hour);

              return (
                <g
                  key={`tear-${hour}`}
                  {...(isTouchDevice
                    ? handleTearLongPress(hour)
                    : { onClick: () => onTearToggle(hour) })}
                  onMouseEnter={() => onHoverChange(hour)}
                  onMouseLeave={() => onHoverChange(null)}
                  style={{ cursor: "pointer" }}
                  data-hour={hour}
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

                  {/* Hour label */}
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
