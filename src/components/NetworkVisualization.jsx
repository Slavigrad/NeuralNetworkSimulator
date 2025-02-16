import React, { useRef, useState, useEffect } from 'react';
import { activationFunctionInfo } from '../utils/activationFunctions';
import { lossFunctionInfo } from '../utils/lossFunctions';

// Add a new DraggablePopup component
const DraggablePopup = ({ children, position, onClose, onPositionChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentPosition, setCurrentPosition] = useState(position);
  const popupRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.target.closest('.close-button') || e.target.closest('input')) {
      return;
    }
    e.stopPropagation();
    setIsDragging(true);
    
    setDragOffset({
      x: e.clientX - currentPosition.x,
      y: e.clientY - currentPosition.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      e.stopPropagation();
      const newPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      };
      setCurrentPosition(newPosition);
      onPositionChange?.(newPosition);
    }
  };

  return (
    <div
      ref={popupRef}
      className={`draggable-popup ${isDragging ? 'dragging' : ''}`}
      style={{
        left: `${currentPosition.x}px`,
        top: `${currentPosition.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={(e) => {
        if (isDragging) {
          e.stopPropagation();
          setIsDragging(false);
        }
      }}
      onMouseLeave={() => setIsDragging(false)}
      onClick={e => e.stopPropagation()}
    >
      {children}
    </div>
  );
};

const InputNodePopup = ({ value, onChange, position, onClose }) => {
  const inputRef = useRef(null);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    inputRef.current?.focus();
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = Number(e.target.value);
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <DraggablePopup position={position} onClose={onClose}>
      <div className="input-node-popup">
        <input
          ref={inputRef}
          type="number"
          value={localValue}
          onChange={handleChange}
          step="0.1"
          min="-10"
          max="10"
        />
        <button className="close-button" onClick={onClose}>×</button>
      </div>
    </DraggablePopup>
  );
};

const WeightPopup = ({ value, onChange, position, onClose }) => {
  const inputRef = useRef(null);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    inputRef.current?.focus();
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = Number(e.target.value);
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <DraggablePopup position={position} onClose={onClose}>
      <div className="weight-popup">
        <div className="input-group">
          <input
            ref={inputRef}
            type="number"
            value={localValue}
            onChange={handleChange}
            step="0.1"
            min="-10"
            max="10"
          />
          <div className="weight-popup-tooltip">
            Connection strength
          </div>
        </div>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
    </DraggablePopup>
  );
};

// Add a new ExpectedOutputPopup component
const ExpectedOutputPopup = ({ value, onChange, position, onClose }) => {
  const inputRef = useRef(null);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    inputRef.current?.focus();
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = Number(e.target.value);
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <DraggablePopup position={position} onClose={onClose}>
      <div className="expected-output-popup">
        <input
          ref={inputRef}
          type="number"
          value={localValue}
          onChange={handleChange}
          step="0.1"
          min="0"
          max="1"
        />
        <div className="popup-tooltip">Expected Value</div>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
    </DraggablePopup>
  );
};

function NetworkVisualization({
  numInputs,
  numHiddenLayers,
  hiddenLayerNeurons,
  numOutputs,
  weights,
  activationFunction,
  inputValues,
  nodeActivations,
  handleInputChange,
  setWeights,
  expectedOutputs,
  outputErrors,
  totalError,
  handleExpectedOutputChange,
  lossFunction,
  previousGradients,
  layerErrors,
}) {
  // Add safety checks
  if (numHiddenLayers > 0 && (!hiddenLayerNeurons || hiddenLayerNeurons.length !== numHiddenLayers)) {
    return <div className="network-visualization">Loading...</div>;
  }

  if (!weights || weights.length === 0) {
    return <div className="network-visualization">Initializing weights...</div>;
  }

  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState(null);

  // Add state for popup
  const [activeInputNode, setActiveInputNode] = useState(null);

  // Add new state for weight editing
  const [activeWeight, setActiveWeight] = useState(null);

  // Add zoom state
  const [zoomLevel, setZoomLevel] = useState(1);

  // Add state for expected output popup
  const [activeExpectedOutput, setActiveExpectedOutput] = useState(null);

  // Add state to track weight changes
  const [weightChanges, setWeightChanges] = useState({});

  // Add this line near other state declarations
  const previousWeights = useRef(null);

  // Update the useEffect to detect weight changes
  useEffect(() => {
    if (!previousWeights.current) {
      previousWeights.current = weights;
      return;
    }

    const changes = {};
    weights.forEach((layer, layerIdx) => {
      layer.forEach((neuronWeights, fromNeuron) => {
        neuronWeights.forEach((weight, toNeuron) => {
          const key = `${layerIdx}-${fromNeuron}-${toNeuron}`;
          const oldWeight = previousWeights.current?.[layerIdx]?.[fromNeuron]?.[toNeuron];
          if (oldWeight !== undefined && weight !== oldWeight) {
            changes[key] = {
              increased: weight > oldWeight,
              decreased: weight < oldWeight,
              value: weight - oldWeight
            };
          }
        });
      });
    });
    setWeightChanges(changes);
    previousWeights.current = JSON.parse(JSON.stringify(weights)); // Deep copy to prevent reference issues
  }, [weights]);

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        // Add extra padding to prevent clipping
        setDimensions({
          width: Math.max(width + 500, 1200), // Add extra space for expected outputs and total error
          height: height
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Pan handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('.draggable-popup')) {
      return;
    }
    const startPoint = { x: e.clientX, y: e.clientY };
    setDragStart(startPoint);
    setStartPan({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    });
  };

  const handleMouseMove = (e) => {
    if (e.target.closest('.draggable-popup')) {
      return;
    }
    if (dragStart) {
      const dx = Math.abs(e.clientX - dragStart.x);
      const dy = Math.abs(e.clientY - dragStart.y);
      
      if (dx > 3 || dy > 3) {
        setIsDragging(true);
        const newPan = {
          x: e.clientX - startPan.x,
          y: e.clientY - startPan.y
        };
        setPan(newPan);
      }
    }
  };

  const handleMouseUp = (e) => {
    if (!isDragging && dragStart) {
      const clickTarget = e.target;
      const inputNode = clickTarget.closest('.input-node');
      if (inputNode) {
        const nodeData = inputNode.dataset;
        handleNodeClick(
          parseInt(nodeData.layerIndex),
          parseInt(nodeData.nodeIndex),
          { 
            x: parseInt(nodeData.x),
            y: parseInt(nodeData.y)
          }
        );
      }
    }
    setIsDragging(false);
    setDragStart(null);
  };

  // Add click handler for input nodes
  const handleNodeClick = (layerIndex, nodeIndex, position) => {
    if (layerIndex === 0) {
      const popupPosition = {
        x: position.x,
        y: position.y - 100
      };
      setActiveInputNode({
        index: nodeIndex,
        position: popupPosition,
        value: inputValues[nodeIndex]
      });
    }
  };

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.input-node-popup') && 
          !e.target.closest('.input-node')) {
        setActiveInputNode(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add click outside handler for weight popup (in the NetworkVisualization component)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.weight-popup') && 
          !e.target.closest('.connection-group')) {
        setActiveWeight(null);
      }
      if (!e.target.closest('.input-node-popup') && 
          !e.target.closest('.input-node')) {
        setActiveInputNode(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Rest of the visualization logic remains the same, but use dimensions.width and dimensions.height
  const neuronRadius = Math.min(dimensions.width, dimensions.height) * 0.025;

  // Helper function to get node color based on layer type
  const getNodeColor = (layerIndex, totalLayers) => {
    if (layerIndex === 0) return '#4CAF50'; // Input nodes - green
    if (layerIndex === totalLayers - 1) return '#FF9800'; // Output nodes - orange
    return '#2196F3'; // Hidden nodes - blue
  };

  // Build an array representing each layer with its neuron count and a label.
  const layersInfo = [];
  layersInfo.push({ count: Math.max(1, numInputs), label: 'Input' });
  for (let i = 0; i < numHiddenLayers; i++) {
    layersInfo.push({ 
      count: Math.max(1, hiddenLayerNeurons[i] || 4), 
      label: `Hidden ${i + 1}` 
    });
  }
  layersInfo.push({ count: Math.max(1, numOutputs), label: 'Output' });

  const totalLayers = layersInfo.length;

  // Compute (x,y) positions for each neuron in every layer.
  const layersPositions = layersInfo.map((layer, layerIndex) => {
    const x = (dimensions.width / (totalLayers + 1)) * (layerIndex + 1);
    const positions = [];
    const verticalSpacing = dimensions.height / (layer.count + 1);
    for (let i = 0; i < layer.count; i++) {
      const y = verticalSpacing * (i + 1);
      positions.push({ x, y });
    }
    return positions;
  });

  // Helper function to safely get weight value
  const getWeight = (layerIndex, fromNeuron, toNeuron) => {
    try {
      if (weights[layerIndex] && 
          weights[layerIndex][fromNeuron] && 
          typeof weights[layerIndex][fromNeuron][toNeuron] === 'number') {
        return weights[layerIndex][fromNeuron][toNeuron];
      }
      return 0;
    } catch (e) {
      console.warn('Error accessing weight:', e);
      return 0;
    }
  };

  // Replace the existing calculateLabelOffset function with this new one
  const calculateLabelPosition = (fromPos, toPos, layerIndex, i, j, totalConnections) => {
    // Calculate the line's midpoint
    const midX = (fromPos.x + toPos.x) / 2;
    const midY = (fromPos.y + toPos.y) / 2;

    // Calculate the line's angle and length
    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    const angle = Math.atan2(dy, dx);
    const length = Math.sqrt(dx * dx + dy * dy);

    // Stagger the labels along the line
    const position = (i * totalConnections + j) / (totalConnections * totalConnections);
    const offset = (position - 0.5) * length * 0.4; // Distribute labels along 40% of the line

    // Calculate the final position
    return {
      x: midX + offset * Math.cos(angle),
      y: midY + offset * Math.sin(angle) - 10 // Lift labels slightly above the line
    };
  };

  // Calculate net inputs for visualization
  const calculateNetInputs = () => {
    if (!weights.length) return [];

    let netInputs = [inputValues]; // Input layer has no net input
    let currentActivations = inputValues;

    // Calculate net input for each layer
    for (let layerIdx = 0; layerIdx < weights.length; layerIdx++) {
      const currentLayer = weights[layerIdx];
      const layerNetInputs = [];

      for (let neuronIdx = 0; neuronIdx < currentLayer[0].length; neuronIdx++) {
        let sum = 0;
        for (let prevNeuronIdx = 0; prevNeuronIdx < currentActivations.length; prevNeuronIdx++) {
          sum += currentActivations[prevNeuronIdx] * currentLayer[prevNeuronIdx][neuronIdx];
        }
        layerNetInputs.push(sum);
      }

      netInputs.push(layerNetInputs);
      currentActivations = layerNetInputs;
    }

    return netInputs;
  };

  const netInputs = calculateNetInputs();

  // Add weight click handler
  const handleWeightClick = (layerIndex, fromNeuron, toNeuron, position) => {
    const popupPosition = {
      x: position.x - 40,
      y: position.y - 50
    };
    setActiveWeight({
      layerIndex,
      fromNeuron,
      toNeuron,
      position: popupPosition,
      value: getWeight(layerIndex, fromNeuron, toNeuron)
    });
  };

  // Add weight update handler
  const handleWeightChange = (layerIndex, fromNeuron, toNeuron, newValue) => {
    const newWeights = [...weights];
    newWeights[layerIndex][fromNeuron][toNeuron] = newValue;
    setWeights(newWeights);
  };

  // Add zoom handlers
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2)); // Max zoom 2x
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5)); // Min zoom 0.5x
  };

  // Update the renderExpectedOutputNode function
  const renderExpectedOutputNode = (outputIndex, position) => {
    const expectedValue = expectedOutputs[outputIndex] || 0;
    const error = outputErrors[outputIndex] || 0;
    const actualValue = nodeActivations[nodeActivations.length - 1]?.[outputIndex] || 0;
    
    return (
      <g key={`expected-${outputIndex}`}>
        {/* Error display - removed (SE) */}
        <text
          x={position.x}
          y={position.y - neuronRadius - 40}
          textAnchor="middle"
          fill="#666"
          fontSize="12"
          className="error-display"
        >
          Error for Output Neuron {outputIndex + 1} = {error.toFixed(5)}
        </text>

        {/* Connection line between actual and expected */}
        <line
          x1={position.x}
          y1={position.y}
          x2={position.x + 100}
          y2={position.y}
          stroke="#FBC02D"
          strokeWidth="2"
          strokeDasharray="4"
        />

        {/* Expected output node */}
        <g 
          className="expected-output-node"
          onClick={(e) => {
            e.stopPropagation();
            setActiveExpectedOutput({
              index: outputIndex,
              position: {
                x: position.x + 100,
                y: position.y
              },
              value: expectedValue
            });
          }}
        >
          <circle
            cx={position.x + 100}
            cy={position.y}
            r={neuronRadius}
            fill="#FFEB3B"
            stroke="#FBC02D"
            strokeWidth="2"
            cursor="pointer"
          />
          <text
            x={position.x + 100}
            y={position.y}
            textAnchor="middle"
            alignmentBaseline="middle"
            fill="#000"
            fontSize="12"
            fontWeight="bold"
          >
            {expectedValue.toFixed(3)}
          </text>
          <text
            x={position.x + 100}
            y={position.y - neuronRadius - 10}
            textAnchor="middle"
            fontSize="10"
            fill="#666"
          >
            Expected
          </text>
        </g>
      </g>
    );
  };

  // Update the renderTotalErrorNode function
  const renderTotalErrorNode = () => {
    // Get the rightmost output node position
    const outputLayerPositions = layersPositions[layersPositions.length - 1];
    const lastOutputY = outputLayerPositions[outputLayerPositions.length - 1].y;
    const firstOutputY = outputLayerPositions[0].y;
    const outputLayerX = outputLayerPositions[0].x;

    // Position the total error node below the last output node with some padding
    const position = {
      x: outputLayerX + 250, // Place it further right of the expected output nodes
      y: lastOutputY + 100 // Place it below the last output node
    };

    // If there are many output nodes, center it vertically
    if (outputLayerPositions.length > 2) {
      position.y = (firstOutputY + lastOutputY) / 2 + 100;
    }

    return (
      <g className="total-error-node">
        <circle
          cx={position.x}
          cy={position.y}
          r={neuronRadius * 1.4}
          fill="#9C27B0"
          stroke="#7B1FA2"
          strokeWidth="2"
        />
        <text
          x={position.x}
          y={position.y - 8}
          textAnchor="middle"
          fill="white"
          fontSize="14"
          fontWeight="bold"
        >
          Total Error
        </text>
        <text
          x={position.x}
          y={position.y + 12}
          textAnchor="middle"
          fill="white"
          fontSize="12"
        >
          {totalError.toFixed(5)}
        </text>
      </g>
    );
  };

  // Update the getWeightColor function to have better visibility
  const getWeightColor = (weight) => {
    // Normalize weight to a color
    const normalizedWeight = Math.max(-1, Math.min(1, weight)); // Clamp between -1 and 1
    if (normalizedWeight > 0) {
        // Green for positive weights
        const intensity = Math.floor(normalizedWeight * 255);
        return `rgba(0, ${intensity}, 0, 0.8)`; // Increased opacity to 0.8
    } else {
        // Red for negative weights
        const intensity = Math.floor(-normalizedWeight * 255);
        return `rgba(${intensity}, 0, 0, 0.8)`; // Increased opacity to 0.8
    }
  };

  // Add this helper function to calculate curved paths
  const createCurvedPath = (startX, startY, endX, endY, curvature = 0.5) => {
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const controlX1 = startX + (midX - startX) * curvature;
    const controlY1 = startY;
    const controlX2 = endX - (endX - midX) * curvature;
    const controlY2 = endY;
    
    return `M ${startX} ${startY} 
            C ${controlX1} ${controlY1},
              ${controlX2} ${controlY2},
              ${endX} ${endY}`;
  };

  // Update the renderWeightLine function
  const renderWeightLine = (startX, startY, endX, endY, weight, layerIndex, fromNeuron, toNeuron) => {
    const key = `${layerIndex}-${fromNeuron}-${toNeuron}`;
    const change = weightChanges[key];
    const weightColor = getWeightColor(weight);
    
    // Get gradient information
    const gradient = previousGradients?.[layerIndex]?.[fromNeuron]?.[toNeuron] || 0;
    const gradientMagnitude = Math.abs(gradient);
    const gradientOpacity = Math.min(gradientMagnitude * 5, 1);
    
    // Calculate label position with offset to prevent overlap
    const midX = startX + (endX - startX) / 2;
    const midY = startY + (endY - startY) / 2;
    
    // Calculate vertical offset based on neuron indices and layer position
    const verticalOffset = (fromNeuron - toNeuron) * 20; // Increased spacing
    const horizontalOffset = (layerIndex % 2) * 20; // Alternate horizontal position
    
    // Add a unique animation key based on the weight value
    const animationKey = `${key}-${weight}`;
    
    return (
        <g 
            key={animationKey}
            className={`weight-connection ${change ? 'weight-flash' : ''}`}
        >
            {/* Gradient flow indicator */}
            <path
                d={createCurvedPath(startX, startY, endX, endY)}
                stroke={gradient > 0 ? '#4CAF50' : '#f44336'}
                strokeWidth={(Math.abs(weight) * 3 + 3)}
                strokeDasharray="4,4"
                fill="none"
                opacity={gradientOpacity}
                className="gradient-flow"
            >
                <title>Gradient: {gradient.toFixed(4)}</title>
            </path>

            {/* Regular weight line */}
            <path
                d={createCurvedPath(startX, startY, endX, endY)}
                stroke={weightColor}
                strokeWidth={Math.abs(weight) * 3 + 1}
                fill="none"
                className="weight-line"
                style={{ '--original-color': weightColor }}
            />

            {/* Weight and gradient label */}
            <g transform={`translate(${midX + horizontalOffset}, ${midY + verticalOffset})`}>
                <rect
                    x="-20"
                    y="-15"
                    width="40"
                    height="30"
                    fill="rgba(255, 255, 255, 0.9)"
                    rx="4"
                />
                <text
                    textAnchor="middle"
                    className="weight-label"
                    fill="#333"
                    fontSize="10"
                >
                    {weight.toFixed(2)}
                    <tspan x="0" dy="12" fontSize="8" fill={gradient > 0 ? '#4CAF50' : '#f44336'}>
                        ∇ {gradient.toFixed(3)}
                    </tspan>
                </text>
            </g>
        </g>
    );
  };

  // Add this helper function to get error color
  const getErrorColor = (error) => {
    if (error === undefined || error === null) return 'rgba(128, 128, 128, 0.3)';
    
    // Normalize error to 0-1 range
    const normalizedError = Math.min(Math.abs(error), 1);
    
    // Red for high error, green for low error
    const red = Math.round(255 * normalizedError);
    const green = Math.round(255 * (1 - normalizedError));
    
    return `rgba(${red}, ${green}, 0, 0.8)`;
  };

  // Add this function near other handlers
  const handleInputClick = (neuronIndex, position) => {
    const popupPosition = {
        x: position.x,
        y: position.y - 50  // Position above the neuron
    };
    setActiveInputNode({
        index: neuronIndex,
        position: popupPosition,
        value: inputValues[neuronIndex]
    });
  };

  // Update the renderNeuron function's click handler
  const renderNeuron = (x, y, layerIndex, neuronIndex, activationValue = null, isOutput = false) => {
    const isInput = layerIndex === 0;
    
    // Add safety checks for errors
    let error;
    if (isOutput && outputErrors) {
        error = outputErrors[neuronIndex];
    } else if (layerIndex > 0 && layerErrors && layerErrors[layerIndex - 1]) {
        error = layerErrors[layerIndex - 1][neuronIndex];
    } else {
        error = 0;
    }
    
    return (
        <g 
            key={`n-${layerIndex}-${neuronIndex}`}
            className={isInput ? 'input-node' : 'neuron-container'}
            onClick={isInput ? (e) => {
                e.stopPropagation();
                handleInputClick(neuronIndex, { x, y });
            } : undefined}
            style={isInput ? { cursor: 'pointer' } : {}}
            onMouseEnter={(e) => {
                if (!isInput) {
                    const tooltip = document.createElement('div');
                    tooltip.className = 'error-tooltip';
                    tooltip.textContent = `Error: ${error?.toFixed(4) || '0.0000'}`;
                    tooltip.style.left = `${e.clientX + 10}px`;
                    tooltip.style.top = `${e.clientY + 10}px`;
                    document.body.appendChild(tooltip);
                }
            }}
            onMouseLeave={() => {
                if (!isInput) {
                    const tooltips = document.getElementsByClassName('error-tooltip');
                    Array.from(tooltips).forEach(t => t.remove());
                }
            }}
        >
            {/* Error ring - only for non-input neurons */}
            {!isInput && (
                <circle
                    cx={x}
                    cy={y}
                    r={neuronRadius + 3}
                    fill="none"
                    stroke={getErrorColor(error)}
                    strokeWidth="2"
                    className="error-ring"
                />
            )}
            
            {/* Rest of the neuron rendering remains the same */}
            <circle
                cx={x}
                cy={y}
                r={neuronRadius}
                fill={getNodeColor(layerIndex, totalLayers)}
                stroke="#333"
                strokeWidth="2"
            />
            
            <text
                x={x}
                y={y - 5}
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize="12"
                fill="white"
                fontWeight="bold"
            >
                {neuronIndex + 1}
            </text>

            <text
                x={x}
                y={y + 5}
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize="10"
                fill="white"
            >
                {activationValue !== null ? activationValue.toFixed(3) : ''}
            </text>
        </g>
    );
  };

  return (
    <div 
      className={`visualization-container ${isDragging ? 'dragging' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div 
        ref={containerRef}
        className="network-visualization"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
          transformOrigin: 'center center'
        }}>
        <svg width={dimensions.width} height={dimensions.height}>
          {layersPositions.slice(0, -1).map((layer, layerIndex) => {
            const nextLayer = layersPositions[layerIndex + 1];
            const totalConnections = Math.max(layer.length, nextLayer.length);
            
            return layer.map((fromPos, i) => {
              return nextLayer.map((toPos, j) => {
                const weight = getWeight(layerIndex, i, j);
                const strokeWidth = Math.max(1, Math.abs(weight) * 2);
                const strokeColor = weight >= 0 ? '#28a745' : '#dc3545';
                
                // Get label position
                const labelPos = calculateLabelPosition(fromPos, toPos, layerIndex, i, j, totalConnections);
                
                return (
                  <g 
                    key={`l-${layerIndex}-${i}-${j}`}
                    className="connection-group"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWeightClick(layerIndex, i, j, {
                        x: labelPos.x,
                        y: labelPos.y
                      });
                    }}
                  >
                    {renderWeightLine(fromPos.x, fromPos.y, toPos.x, toPos.y, weight, layerIndex, i, j)}
                  </g>
                );
              });
            });
          })}

          {layersPositions.map((layer, layerIndex) =>
            layer.map((pos, i) => {
                const activationValue = nodeActivations[layerIndex]?.[i];
                const isOutput = layerIndex === layersPositions.length - 1;
                
                // Use the renderNeuron function instead of inline JSX
                return renderNeuron(
                    pos.x,
                    pos.y,
                    layerIndex,
                    i,
                    activationValue,
                    isOutput
                );
            })
          )}

          {/* Add Expected Output Nodes and Error Display */}
          {layersPositions[layersPositions.length - 1].map((outputPos, outputIndex) => 
            renderExpectedOutputNode(outputIndex, outputPos)
          )}

          {/* Add Total Error Node */}
          {renderTotalErrorNode()}
        </svg>
        
        {activeInputNode && (
          <InputNodePopup
            value={inputValues[activeInputNode.index]}
            onChange={(newValue) => {
              handleInputChange(activeInputNode.index, newValue);
            }}
            position={activeInputNode.position}
            onClose={() => setActiveInputNode(null)}
          />
        )}

        {activeWeight && (
          <WeightPopup
            value={activeWeight.value}
            onChange={(newValue) => {
              handleWeightChange(
                activeWeight.layerIndex,
                activeWeight.fromNeuron,
                activeWeight.toNeuron,
                newValue
              );
            }}
            position={activeWeight.position}
            onClose={() => setActiveWeight(null)}
          />
        )}

        {activeExpectedOutput && (
          <ExpectedOutputPopup
            value={expectedOutputs[activeExpectedOutput.index]}
            onChange={(newValue) => {
              handleExpectedOutputChange(activeExpectedOutput.index, newValue);
            }}
            position={activeExpectedOutput.position}
            onClose={() => setActiveExpectedOutput(null)}
          />
        )}
      </div>

      {/* Add zoom controls */}
      <div className="zoom-controls">
        <button className="zoom-button" onClick={handleZoomOut}>−</button>
        <div className="zoom-level">{Math.round(zoomLevel * 100)}%</div>
        <button className="zoom-button" onClick={handleZoomIn}>+</button>
      </div>

      <div className="activation-function-overlay">
        <div className="activation-overlay-content">
          <h3>{activationFunction} Function</h3>
          <div className="formula">
            {activationFunctionInfo[activationFunction].formula}
          </div>
          <div className="description">
            {activationFunctionInfo[activationFunction].description}
          </div>
        </div>
      </div>

      {/* Add loss function overlay */}
      <div className="loss-function-overlay">
        <div className="loss-overlay-content">
          <h3>{lossFunction}</h3>
          <div className="formula">
            {lossFunctionInfo[lossFunction].formula}
          </div>
          <div className="description">
            {lossFunctionInfo[lossFunction].description}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NetworkVisualization; 