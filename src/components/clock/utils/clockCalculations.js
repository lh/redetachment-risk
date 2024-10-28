export const segmentToHour = (segment) => Math.floor(segment / 5) + 1;

export const getPosition = (hour, radius) => {
  const angle = (hour * 30 - 90) * (Math.PI / 180);
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
    angle: (hour * 30)
  };
};

export const getSegmentPosition = (segment, radius) => {
  const angle = (segment * 6 - 75) * (Math.PI / 180);
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle)
  };
};

export const createTearPath = (x, y, angle) => {
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
