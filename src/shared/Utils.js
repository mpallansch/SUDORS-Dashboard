const Utils = {
  horizontalBarPath: (rightRounded, x, y, width, height, strokeWidth, cornerWidth) => {
    const xEnd = x + width;
    const yEnd = y + height;
    
    return rightRounded ?
      `M${x} ${y} 
      L${xEnd - cornerWidth} ${y}
      C${xEnd} ${y}, ${xEnd} ${y}, ${xEnd} ${y + cornerWidth} 
      L${xEnd} ${yEnd - cornerWidth} 
      C${xEnd} ${yEnd}, ${xEnd} ${yEnd}, ${xEnd - cornerWidth} ${yEnd}
      L${x} ${y + height} 
      L${x} ${y - (strokeWidth / 2)}`
    :
      `M${x + cornerWidth} ${y} 
      L${xEnd} ${y} 
      L${xEnd} ${yEnd} 
      L${x + cornerWidth} ${yEnd} 
      C${x} ${yEnd}, ${x} ${yEnd}, ${x} ${yEnd - cornerWidth}
      L${x} ${y + cornerWidth}
      C${x} ${y}, ${x} ${y}, ${x + cornerWidth} ${y}`
  },
  verticalBarPath: (x, y, width, height, cornerWidth) => {
    const xEnd = x + width;
    const yEnd = y + height;
    
    return `M${x + cornerWidth} ${y} 
      L${xEnd - cornerWidth} ${y}
      C${xEnd} ${y}, ${xEnd} ${y}, ${xEnd} ${y + cornerWidth} 
      L${xEnd} ${yEnd} 
      L${x} ${yEnd}
      L${x} ${y + cornerWidth}
      C${x} ${y}, ${x} ${y}, ${x + cornerWidth} ${y}`;
  }
}

export default Utils;
