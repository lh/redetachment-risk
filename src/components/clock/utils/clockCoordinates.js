// clockCoordinates.js
const SEGMENTS = 60;
const DEGREES_PER_SEGMENT = 360 / SEGMENTS;

const CoordinateSystem = {
  // Helper functions to convert between different angle systems
  toRadians: (degrees) => degrees * (Math.PI / 180),
  toDegrees: (radians) => radians * (180 / Math.PI),

  // Convert from clock position (0 at 12, CW) to math angles (0 at 3, CCW)
  clockToMathAngle: (clockDegrees) => {
    return (90 - clockDegrees) % 360;  // 90° offset to align coordinate systems
  },

  // Convert from math angles to clock position
  mathToClockAngle: (mathDegrees) => {
    return (90 - mathDegrees) % 360;
  },

  // Get x,y coordinates for a given clock angle
  getPointFromClockAngle: (degrees, radius) => {
    const mathAngle = CoordinateSystem.toRadians(CoordinateSystem.clockToMathAngle(degrees));
    return {
      x: radius * Math.cos(mathAngle),
      y: radius * Math.sin(mathAngle)
    };
  },

  // Get clock angle from mouse/touch point
  getClockAngleFromPoint: (x, y) => {
    const mathAngle = CoordinateSystem.toDegrees(Math.atan2(y, x));
    return CoordinateSystem.mathToClockAngle(mathAngle);
  },

  // Convert segment number to clock angle
  segmentToAngle: (segment) => {
    return (segment * DEGREES_PER_SEGMENT) % 360;
  },

  // Convert clock angle to segment number
  angleToSegment: (angle) => {
    return Math.floor(angle / DEGREES_PER_SEGMENT);
  },

  // Direct segment to point conversion
  getPointFromSegment: (segment, radius) => {
    const clockAngle = CoordinateSystem.segmentToAngle(segment);
    return CoordinateSystem.getPointFromClockAngle(clockAngle, radius);
  },

  // Direct point to segment conversion
  getSegmentFromPoint: (x, y) => {
    const clockAngle = CoordinateSystem.getClockAngleFromPoint(x, y);
    return CoordinateSystem.angleToSegment(clockAngle);
  }
};

export default CoordinateSystem;