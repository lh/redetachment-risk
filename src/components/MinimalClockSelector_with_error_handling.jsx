import React, { useState } from 'react';
import PropTypes from 'prop-types';

// First, let's create the Error Boundary component
const ClockSelectorErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const handleError = (error) => {
      setHasError(true);
      setError(error);
      // Log the error to your error reporting service
      console.error('Clock Selector Error:', error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div style={{
        padding: '20px',
        border: '1px solid #fee2e2',
        borderRadius: '8px',
        backgroundColor: '#fef2f2',
        color: '#dc2626'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Something went wrong with the clock selector</h3>
        <p style={{ margin: '0', fontSize: '14px' }}>
          Please try refreshing the page. If the problem persists, contact support.
        </p>
        <button 
          onClick={() => {
            setHasError(false);
            setError(null);
          }}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return children;
};

// Now update the main component to use the error boundary and add error checking
const MinimalClockSelector = ({ 
  onChange,
  size = 256,
  initialSelection = [],
  disabledHours = []
}) => {
  const [selectedHours, setSelectedHours] = useState(initialSelection);
  const [hoveredHour, setHoveredHour] = useState(null);
  const [error, setError] = useState(null);

  // Validate props
  React.useEffect(() => {
    try {
      // Check for valid hours in initialSelection
      if (initialSelection.some(hour => hour < 1 || hour > 12)) {
        throw new Error('Initial selection contains invalid hours');
      }

      // Check for valid hours in disabledHours
      if (disabledHours.some(hour => hour < 1 || hour > 12)) {
        throw new Error('Disabled hours contains invalid hours');
      }

      // Check for valid size
      if (size < 100 || size > 1000) {
        throw new Error('Size must be between 100 and 1000 pixels');
      }

      setError(null);
    } catch (err) {
      setError(err);
      console.error('Validation Error:', err);
    }
  }, [initialSelection, disabledHours, size]);

  const getPosition = (hour, radius) => {
    try {
      const angle = (hour * 30 - 90) * (Math.PI / 180);
      return {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
        angle: (hour * 30)
      };
    } catch (err) {
      console.error('Position calculation error:', err);
      throw err;
    }
  };

  const createTearPath = (x, y, angle) => {
    try {
      const tearPath = `
        M 0 -8
        c -0.091 -0.936 0.333 -1.232 0.777 0.658
        c 0.389 1.655 1.060 3.281 1.060 3.281
        s 0 0.254 1.022 0.617
        c 0.793 0.282 2.183 -2.882 2.183 -2.882
        s 1.953 -4.433 1.437 -1.294
        c -1.217 7.410 -1.640 6.716 -1.664 6.897
        c -0.024 0.181 -0.510 0.596 -0.510 0.596
        s -0.178 0.183 -0.585 0.327
        c -3.121 1.110 -3.163 -3.001 -3.163 -3.001
        l -0.541 -5.144
      `;

      return {
        d: tearPath,
        transform: `translate(${x}, ${y}) scale(2) rotate(${angle})`
      };
    } catch (err) {
      console.error('Path creation error:', err);
      throw err;
    }
  };

  // If there's a validation error, show it
  if (error) {
    return (
      <div style={{
        padding: '20px',
        border: '1px solid #fee2e2',
        borderRadius: '8px',
        backgroundColor: '#fef2f2',
        color: '#dc2626'
      }}>
        <p>Configuration Error: {error.message}</p>
      </div>
    );
  }

  const handleClick = (hour) => {
    if (disabledHours.includes(hour)) return;

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
      },
      disabled: {
        fill: '#f3f4f6',
        stroke: '#d1d5db',
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
      },
      disabled: {
        fill: '#f3f4f6',
        stroke: '#e5e7eb',
        strokeWidth: '1.5',
        cursor: 'not-allowed'
      }
    }
  };

  const getStyles = (hour, isSelected) => {
    const isHovered = hoveredHour === hour;
    const isDisabled = disabledHours.includes(hour);

    if (isDisabled) {
      return {
        ...(isSelected ? styles.tear.disabled : styles.circle.disabled),
        transition: styles.transition
      };
    }

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
            const isDisabled = disabledHours.includes(hour);
            
            return (
              <g 
                key={hour} 
                onClick={() => handleClick(hour)} 
                onMouseEnter={() => !isDisabled && setHoveredHour(hour)}
                onMouseLeave={() => setHoveredHour(null)}
                style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
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

MinimalClockSelector.propTypes = {
  // Callback function when selection changes
  onChange: PropTypes.func,
  
  // Size of the component in pixels
  size: PropTypes.number,
  
  // Initially selected hours
  initialSelection: PropTypes.arrayOf(
    PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  ),
  
  // Hours that cannot be selected
  disabledHours: PropTypes.arrayOf(
    PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  )
};

MinimalClockSelector.defaultProps = {
  size: 256,
  initialSelection: [],
  disabledHours: [],
  onChange: () => {}
};

// Wrap the component with the error boundary for export
const ClockSelectorWithErrorBoundary = (props) => (
  <ClockSelectorErrorBoundary>
    <MinimalClockSelector {...props} />
  </ClockSelectorErrorBoundary>
);

export default ClockSelectorWithErrorBoundary;