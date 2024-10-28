export const styles = {
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

export const getStyles = (hour, hoveredHour, isSelected) => {
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
