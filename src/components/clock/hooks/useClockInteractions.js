import { useState, useRef, useEffect } from 'react';
import { segmentToHour } from '../utils/clockCalculations';

export const useClockInteractions = (onChange) => {
  const [selectedHours, setSelectedHours] = useState([]);
  const [detachmentSegments, setDetachmentSegments] = useState([]);
  const [hoveredHour, setHoveredHour] = useState(null);
  const [isAddMode, setIsAddMode] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [pressTimer, setPressTimer] = useState(null);

  const drawingRef = useRef(false);
  const touchStartTime = useRef(null);
  const touchStartPosition = useRef(null);
  const longPressThreshold = 300;
  const moveThreshold = 10;

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

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

  const handleSegmentInteraction = (segment, isRightClick = false) => {
    let newSelection;
    
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

  const handleTearTouchStart = (hour, event) => {
    if (!isTouchDevice) return;
    event.preventDefault();
    
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

  const handleEndDrawing = () => {
    drawingRef.current = false;
    setIsDrawing(false);
  };

  const handleClearAll = () => {
    setSelectedHours([]);
    setDetachmentSegments([]);
    onChange?.({ tears: [], detachment: [] });
  };

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

  return {
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
  };
};
