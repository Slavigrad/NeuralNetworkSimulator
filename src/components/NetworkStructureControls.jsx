import React from 'react';

function NetworkStructureControls({
    numInputs,
    setNumInputs,
    numHiddenLayers,
    onHiddenLayersChange,
    hiddenLayerNeurons,
    setHiddenLayerNeurons,
    numOutputs,
    setNumOutputs,
}) {
    return (
        <div className="control-section">
            <div className="section-header">
                <span className="section-icon">🧠</span>
                <h2>Network Structure</h2>
            </div>
            
            {/* Input Layer Controls */}
            <div className="layer-controls">
                <label>Input Neurons</label>
                <input
                    type="range"
                    min="1"
                    max="10"
                    value={numInputs}
                    onChange={(e) => setNumInputs(Number(e.target.value))}
                />
                <span className="slider-value">{numInputs}</span>
            </div>

            {/* Output Layer Controls */}
            <div className="layer-controls">
                <label>Output Neurons</label>
                <input
                    type="range"
                    min="1"
                    max="10"
                    value={numOutputs}
                    onChange={(e) => setNumOutputs(Number(e.target.value))}
                />
                <span className="slider-value">{numOutputs}</span>
            </div>

            {/* Hidden Layers Controls */}
            <div className="layer-controls">
                <label>Hidden Layers</label>
                <input
                    type="range"
                    min="0"
                    max="5"
                    value={numHiddenLayers}
                    onChange={(e) => onHiddenLayersChange(Number(e.target.value))}
                />
                <span className="slider-value">{numHiddenLayers}</span>
            </div>

            {/* Hidden Layer Neurons Controls */}
            {numHiddenLayers > 0 && (
                <div className="hidden-layers-grid">
                    {Array.from({ length: numHiddenLayers }).map((_, index) => (
                        <div key={index} className="hidden-layer-item">
                            <label>Hidden Layer {index + 1}</label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={hiddenLayerNeurons[index] || 4}
                                onChange={(e) => {
                                    const newNeurons = [...hiddenLayerNeurons];
                                    newNeurons[index] = Number(e.target.value);
                                    setHiddenLayerNeurons(newNeurons);
                                }}
                            />
                            <span className="slider-value">{hiddenLayerNeurons[index] || 4}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default NetworkStructureControls; 