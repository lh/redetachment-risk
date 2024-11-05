import React, { useState, useCallback, useEffect } from 'react';
import Controls from './Controls';
import ClockFace from './ClockFace';

const MinimalClockSelector = ({ onChange }) => {
  const [selectedHours, setSelectedHours] = useState([]);
  const [detachmentSegments, setDetachmentSegments] = useState([]);
  const [hoveredHour, setHoveredHour] = useState(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch device
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Handle tear marker toggles
  const handleTearToggle = useCallback((hour) => {
    setSelectedHours(prev => 
      prev.includes(hour) 
        ? prev.filter(h => h !== hour)
        : [...prev, hour]
    );
  }, []);

  // Handle detachment segment toggles
  const handleSegmentToggle = useCallback((segmentId) => {
    setDetachmentSegments(prev => 
      prev.includes(segmentId)
        ? prev.filter(id => id !== segmentId)
        : [...prev, segmentId]
    );
  }, []);

  // Clear all selections
  const handleClearAll = useCallback(() => {
    setSelectedHours([]);
    setDetachmentSegments([]);
  }, []);

  // Notify parent of changes
  useEffect(() => {
    if (onChange) {
      onChange({
        tears: selectedHours,
        detachment: detachmentSegments
      });
    }
  }, [selectedHours, detachmentSegments, onChange]);

  return (
    <div className="w-full p-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start gap-4">
          {/* Clock section */}
          <div className="w-full max-w-2xl md:flex-1">
            <ClockFace
              selectedHours={selectedHours}
              detachmentSegments={detachmentSegments}
              hoveredHour={hoveredHour}
              isTouchDevice={isTouchDevice}
              onSegmentToggle={handleSegmentToggle}
              onTearToggle={handleTearToggle}
              onHoverChange={setHoveredHour}
            />
          </div>

          {/* Controls section */}
          <div className="fixed md:static bottom-4 left-1/2 landscape:left-auto landscape:right-4 transform -translate-x-1/2 md:translate-x-0 landscape:translate-x-0 md:ml-8">
            <div className="relative">
              <Controls
                isTouchDevice={isTouchDevice}
                handleClearAll={handleClearAll}
                expandDirection="up"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimalClockSelector;
