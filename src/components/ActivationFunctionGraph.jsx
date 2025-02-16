import React, { useEffect, useRef } from 'react';

function ActivationFunctionGraph({ activationFunction }) {
  const canvasRef = useRef(null);

  const drawFunction = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw axes
    ctx.strokeStyle = '#ccc';
    ctx.beginPath();
    ctx.moveTo(0, height/2);
    ctx.lineTo(width, height/2);
    ctx.moveTo(width/2, 0);
    ctx.lineTo(width/2, height);
    ctx.stroke();

    // Draw function
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let x = -width/2; x < width/2; x++) {
      const xVal = x * 4 / width;
      let yVal;

      switch (activationFunction) {
        case 'ReLU':
          yVal = Math.max(0, xVal);
          break;
        case 'Sigmoid':
          yVal = 1 / (1 + Math.exp(-xVal));
          break;
        case 'Tanh':
          yVal = Math.tanh(xVal);
          break;
        case 'Linear':
          yVal = xVal;
          break;
        default:
          yVal = xVal;
      }

      const canvasX = x + width/2;
      const canvasY = height/2 - yVal * height/4;

      if (x === -width/2) {
        ctx.moveTo(canvasX, canvasY);
      } else {
        ctx.lineTo(canvasX, canvasY);
      }
    }
    ctx.stroke();
  };

  useEffect(() => {
    drawFunction();
  }, [activationFunction]);

  return (
    <canvas 
      ref={canvasRef} 
      width="200" 
      height="100" 
      className="activation-function-graph"
    />
  );
}

export default ActivationFunctionGraph; 