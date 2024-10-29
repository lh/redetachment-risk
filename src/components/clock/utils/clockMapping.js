// clockMapping.js

// Create a mapping table where the index is the segment number and the value is the clock hour
export const segmentToClockHourMap = Array(60).fill(0).map((_, segment) => {
    if ([0,1,2,3,56,57,58,59].includes(segment)) return 12;
    if ([4,5,6,7,8].includes(segment)) return 1;
    if ([9,10,11,12,13].includes(segment)) return 2;
    if ([14,15,16,17,18].includes(segment)) return 3;
    if ([19,20,21,22,23].includes(segment)) return 4;
    if ([24,25,26].includes(segment)) return 5;
    if ([27,28,29,30,31,32].includes(segment)) return 6;
    if ([33,34,35].includes(segment)) return 7;
    if ([36,37,38,39,40].includes(segment)) return 8;
    if ([41,42,43,44,45].includes(segment)) return 9;
    if ([46,47,48,49,50].includes(segment)) return 10;
    if ([51,52,53,54,55].includes(segment)) return 11;
    return 0; // Should never happen with 0-59 segments
  });
  
  // Utility function to convert a segment to its clock hour
  export const segmentToClockHour = (segment) => {
    return segmentToClockHourMap[segment];
  };
  
  // For debugging: Create a reverse mapping showing which segments correspond to each hour
  export const clockHourToSegmentsMap = new Map([
    [12, [0,1,2,3,56,57,58,59]],
    [1, [4,5,6,7,8]],
    [2, [9,10,11,12,13]],
    [3, [14,15,16,17,18]],
    [4, [19,20,21,22,23]],
    [5, [24,25,26]],
    [6, [27,28,29,30,31,32]],
    [7, [33,34,35]],
    [8, [36,37,38,39,40]],
    [9, [41,42,43,44,45]],
    [10, [46,47,48,49,50]],
    [11, [51,52,53,54,55]]
  ]);
  
  // Utility function to get all segments for a given clock hour
  export const getSegmentsForClockHour = (hour) => {
    return clockHourToSegmentsMap.get(hour) || [];
  };