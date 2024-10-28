import React, { useState } from 'react';
import PropTypes from 'prop-types';

const MinimalClockSelector = ({ 
  onChange,
  size = 256,
  initialSelection = [],
  disabledHours = []
}) => {
  const [selectedHours, setSelectedHours] = useState(initialSelection);
  const [hoveredHour, setHoveredHour] = useState(null);

  const getPosition = (hour, radius) => {
    const angle = (hour * 30 - 90) * (Math.PI / 180);
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
      angle: (hour * 30)
    };
  };

  // Adjusted tear path to be centered on (0,0)
  const createTearPath = (x, y, angle) => {
    // Shifted the path coordinates to center the U shape
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
      // The transform now properly centers the tear
      transform: `translate(${x}, ${y}) scale(2) rotate(${angle})`
    };
  };

  const handleClick = (hour) => {
    const newSelection = selectedHours.includes(hour)
      ? selectedHours.filter(h => h !== hour)
      : [...selectedHours, hour];
    
    setSelectedHours(newSelection);
    
    if (onChange) {
      onChange(newSelection);
    }
  };

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

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ width: size, height: size }}>
        <svg viewBox="-110 -110 220 220" style={{ width: '100%', height: '100%' }}>
          {/* Grid circles */}
          <circle cx="0" cy="0" r="100" fill="none" stroke="#e5e5e5" strokeWidth="1"/>
          <circle cx="0" cy="0" r="85" fill="none" stroke="#e5e5e5" strokeWidth="0.5"/>
          <circle cx="0" cy="0" r="70" fill="none" stroke="#e5e5e5" strokeWidth="1"/>
          
          {/* Grid lines */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const outerX = 100 * Math.cos(angle);
            const outerY = 100 * Math.sin(angle);
            return (
              <line
                key={i}
                x1={0}
                y1={0}
                x2={outerX}
                y2={outerY}
                stroke="#e5e5e5"
                strokeWidth="0.5"
              />
            );
          })}

          {/* Interactive positions */}
          {[...Array(12)].map((_, i) => {
            const hour = i + 1;
            const pos = getPosition(hour, 85);
            const isSelected = selectedHours.includes(hour);
            
            return (
              <g 
                key={hour} 
                onClick={() => handleClick(hour)} 
                onMouseEnter={() => setHoveredHour(hour)}
                onMouseLeave={() => setHoveredHour(null)}
                style={{ cursor: 'pointer' }}
              >
                {isSelected ? (
                  <path
                    {...createTearPath(pos.x, pos.y, pos.angle)}
                    style={getStyles(hour, true)}
                  />
                ) : (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="12"
                    style={getStyles(hour, false)}
                  />
                )}
              </g>
            );
          })}

          {/* 12 o'clock indicator */}
          <line x1="0" y1="-100" x2="0" y2="-110" stroke="#666" strokeWidth="2"/>
        </svg>
      </div>

      <div style={{ marginTop: '10px', fontSize: '14px' }}>
        Selected: {selectedHours.length > 0 
          ? selectedHours.sort((a, b) => a - b).map(h => `${h}:00`).join(', ')
          : 'None'}
      </div>
    </div>
  );
};

export default MinimalClockSelector;