import React, { useState, useEffect } from 'react';
import ControlsPanel from './components/ControlsPanel.jsx';
import NetworkVisualization from './components/NetworkVisualization.jsx';
import ErrorBoundary from './components/ErrorBoundary';
import TopPanel from './components/TopPanel.jsx';
import { lossFunctionInfo } from './utils/lossFunctions';
import LossHistoryPanel from './components/LossHistoryPanel.jsx';
import LearningProgressPanel from './components/LearningProgressPanel';
import './App.css';

function App() {
    // State for network structure parameters.
    const [numInputs, setNumInputs] = useState(3);
    const [numHiddenLayers, setNumHiddenLayers] = useState(1);
    // Default each hidden layer with 4 neurons.
    const [hiddenLayerNeurons, setHiddenLayerNeurons] = useState([4]);
    const [numOutputs, setNumOutputs] = useState(2);
    const [activationFunction, setActivationFunction] = useState('ReLU');
    // Weights is an array of matrices where each matrix connects adjacent layers.
    const [weights, setWeights] = useState([]);
    const [inputValues, setInputValues] = useState([]);
    const [nodeActivations, setNodeActivations] = useState([]);

    // Add new state for expected outputs and error calculations
    const [expectedOutputs, setExpectedOutputs] = useState([]);
    const [outputErrors, setOutputErrors] = useState([]);
    const [totalError, setTotalError] = useState(0);

    // Add new state for loss function
    const [lossFunction, setLossFunction] = useState('Mean Squared Error');

    // Add new state for loss history
    const [lossHistory, setLossHistory] = useState([]);

    // Add new state for training
    const [learningRate, setLearningRate] = useState(0.01);
    const [isTraining, setIsTraining] = useState(false);
    const [epoch, setEpoch] = useState(0);
    const [batchSize, setBatchSize] = useState(1);

    // Add training speed state
    const [trainingSpeed, setTrainingSpeed] = useState(100);

    // Add state for momentum
    const [momentum, setMomentum] = useState(0.9);
    const [previousGradients, setPreviousGradients] = useState(null);

    // Add new state for batch management
    const [currentBatch, setCurrentBatch] = useState([]);
    const [batchProgress, setBatchProgress] = useState(0);

    // Add new state for batch statistics
    const [batchStats, setBatchStats] = useState(null);

    // Add new state for layer errors
    const [layerErrors, setLayerErrors] = useState([]);

    // Activation functions
    const activationFunctions = {
        ReLU: x => Math.max(0, x),
        Sigmoid: x => 1 / (1 + Math.exp(-x)),
        Tanh: x => Math.tanh(x),
        Linear: x => x,
    };

    // Add activation function derivatives
    const activationDerivatives = {
        ReLU: x => x > 0 ? 1 : 0,
        Sigmoid: x => {
            const sig = 1 / (1 + Math.exp(-x));
            return sig * (1 - sig);
        },
        Tanh: x => 1 - Math.pow(Math.tanh(x), 2),
        Linear: () => 1,
    };

    // Create a weight matrix between layers (rows = neurons in previous layer, cols = neurons in next layer).
    const createWeightMatrix = (rows, cols) => {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < cols; j++) {
                // Random weight between -1 and 1.
                row.push(Math.random() * 2 - 1);
            }
            matrix.push(row);
        }
        return matrix;
    };

    // Generate random weights for the entire network based on current structure.
    const generateRandomWeights = () => {
        const layersWeights = [];
        if (numHiddenLayers > 0) {
            // Create an effective hidden layers array using default of 4 if not defined.
            const effectiveHidden = Array.from(
                { length: numHiddenLayers },
                (_, i) => hiddenLayerNeurons[i] || 4
            );

            // Connection from input to first hidden layer.
            layersWeights.push(createWeightMatrix(numInputs, effectiveHidden[0]));

            // Connections between hidden layers.
            for (let i = 0; i < numHiddenLayers - 1; i++) {
                layersWeights.push(createWeightMatrix(effectiveHidden[i], effectiveHidden[i + 1]));
            }

            // Connection from last hidden layer to output layer.
            layersWeights.push(createWeightMatrix(effectiveHidden[numHiddenLayers - 1], numOutputs));
        } else {
            // If no hidden layers, connect input directly to outputs.
            layersWeights.push(createWeightMatrix(numInputs, numOutputs));
        }
        return layersWeights;
    };

    // Update the randomizeWeights function to reset everything
    const randomizeWeights = () => {
        // Reset weights
        setWeights(generateRandomWeights());
        
        // Reset training state
        setEpoch(0);
        setLossHistory([]);
        setPreviousGradients(null);
        
        // Reset error tracking
        setOutputErrors(Array(numOutputs).fill(0));
        setTotalError(0);
        
        // Reset momentum
        setPreviousGradients(null);
        
        // Reset node activations to initial state
        setNodeActivations([inputValues, ...Array(weights.length).fill([]).map((_, i) => 
            Array(i === weights.length - 1 ? numOutputs : hiddenLayerNeurons[i]).fill(0)
        )]);

        // Stop training if it's running
        if (isTraining) {
            setIsTraining(false);
        }
    };

    // Handler to update the number of hidden layers and adjust the hiddenLayerNeurons array accordingly.
    const handleNumHiddenLayersChange = (value) => {
        // Create the new neurons array first
        const newHiddenLayerNeurons = value > hiddenLayerNeurons.length
            ? [...hiddenLayerNeurons, ...Array(value - hiddenLayerNeurons.length).fill(4)]
            : hiddenLayerNeurons.slice(0, value);
        
        // Update both states at once to maintain consistency
        setHiddenLayerNeurons(newHiddenLayerNeurons);
        setNumHiddenLayers(value);
    };

    // Move the weights generation to a separate useEffect
    useEffect(() => {
        // Ensure we have valid hidden layer neurons before generating weights
        if (hiddenLayerNeurons.length === numHiddenLayers) {
            setWeights(generateRandomWeights());
        }
    }, [numInputs, numHiddenLayers, hiddenLayerNeurons, numOutputs]);

    // Calculate node activations through the network
    const calculateActivations = () => {
        if (!weights.length) return;

        // Start with input layer
        let activations = [inputValues];

        // Process each layer
        for (let layerIdx = 0; layerIdx < weights.length; layerIdx++) {
            const currentActivations = [];
            const currentLayer = weights[layerIdx];
            const prevActivations = activations[activations.length - 1];

            // For each neuron in the current layer
            for (let neuronIdx = 0; neuronIdx < currentLayer[0].length; neuronIdx++) {
                // Calculate weighted sum
                let sum = 0;
                for (let prevNeuronIdx = 0; prevNeuronIdx < prevActivations.length; prevNeuronIdx++) {
                    sum += prevActivations[prevNeuronIdx] * currentLayer[prevNeuronIdx][neuronIdx];
                }
                // Apply activation function
                currentActivations.push(activationFunctions[activationFunction](sum));
            }
            activations.push(currentActivations);
        }

        setNodeActivations(activations);
    };

    // Initialize input values when numInputs changes
    useEffect(() => {
        setInputValues(Array(numInputs).fill(0.5)); // Default value of 0.5
    }, [numInputs]);

    // Recalculate activations when inputs, weights, or activation function changes
    useEffect(() => {
        calculateActivations();
    }, [inputValues, weights, activationFunction]);

    // Update a specific input value
    const handleInputChange = (index, value) => {
        const newInputs = [...inputValues];
        newInputs[index] = Number(value);
        setInputValues(newInputs);
    };

    // Add this helper function to calculate net inputs
    const calculateNetInputs = () => {
        if (!weights.length) return [];

        let netInputs = [inputValues]; // Input layer has no net input
        let currentActivations = inputValues;

        // Calculate net input for each layer
        for (let layerIdx = 0; layerIdx < weights.length; layerIdx++) {
            const currentLayer = weights[layerIdx];
            const layerNetInputs = [];

            // For each neuron in the current layer
            for (let neuronIdx = 0; neuronIdx < currentLayer[0].length; neuronIdx++) {
                // Calculate weighted sum (net input)
                let sum = 0;
                for (let prevNeuronIdx = 0; prevNeuronIdx < currentActivations.length; prevNeuronIdx++) {
                    sum += currentActivations[prevNeuronIdx] * currentLayer[prevNeuronIdx][neuronIdx];
                }
                layerNetInputs.push(sum);
            }

            netInputs.push(layerNetInputs);
            // Update current activations for next layer
            currentActivations = layerNetInputs.map(sum => activationFunctions[activationFunction](sum));
        }

        return netInputs;
    };

    // Update the export function
    const exportNetworkData = () => {
        const netInputs = calculateNetInputs();
        
        // Prepare CSV content
        let csvContent = "Neural Network Configuration\n\n";
        
        // Network Settings
        csvContent += "Network Settings\n";
        csvContent += "Parameter,Value\n";
        csvContent += `Activation Function,${activationFunction}\n`;
        csvContent += `Loss Function,${lossFunction}\n`;  // Add Loss Function
        csvContent += `Input Neurons,${numInputs}\n`;
        csvContent += `Hidden Layers,${numHiddenLayers}\n`;
        hiddenLayerNeurons.forEach((count, idx) => {
            csvContent += `Hidden Layer ${idx + 1} Neurons,${count}\n`;
        });
        csvContent += `Output Neurons,${numOutputs}\n\n`;
        
        // Input Values
        csvContent += "Input Values\n";
        csvContent += "Node,Value\n";
        inputValues.forEach((value, idx) => {
            csvContent += `Input ${idx + 1},${value}\n`;
        });
        csvContent += "\n";

        // Hidden Layer Calculations
        if (nodeActivations.length > 1) {
            csvContent += "Hidden Layer Calculations\n";
            csvContent += "Layer,Node,Net Input,Activation Value\n";
            for (let i = 1; i < nodeActivations.length - 1; i++) {
                nodeActivations[i].forEach((value, nodeIdx) => {
                    const netInput = netInputs[i][nodeIdx];
                    csvContent += `Hidden ${i},${nodeIdx + 1},${netInput},${value}\n`;
                });
            }
            csvContent += "\n";
        }

        // Output Layer Calculations with Expected Values and Errors
        csvContent += "Output Layer Results\n";
        csvContent += "Node,Net Input,Actual Output,Expected Output,Error\n";
        const outputs = nodeActivations[nodeActivations.length - 1] || [];
        const outputNetInputs = netInputs[netInputs.length - 1] || [];
        outputs.forEach((value, idx) => {
            const netInput = outputNetInputs[idx];
            const expected = expectedOutputs[idx];
            const error = outputErrors[idx];
            csvContent += `Output ${idx + 1},${netInput},${value},${expected},${error}\n`;
        });
        csvContent += "\n";

        // Add Total Network Error
        csvContent += "Network Error Summary\n";
        csvContent += "Metric,Value\n";
        csvContent += `Total Error,${totalError}\n`;
        csvContent += `Loss Function,${lossFunction}\n\n`;

        // Weights
        csvContent += "Connection Weights\n";
        csvContent += "From Layer,From Node,To Layer,To Node,Weight\n";
        weights.forEach((layerWeights, layerIdx) => {
            const fromLayer = layerIdx === 0 ? "Input" : `Hidden ${layerIdx}`;
            const toLayer = layerIdx === weights.length - 1 ? "Output" : `Hidden ${layerIdx + 1}`;
            
            layerWeights.forEach((nodeWeights, fromIdx) => {
                nodeWeights.forEach((weight, toIdx) => {
                    csvContent += `${fromLayer},${fromIdx + 1},${toLayer},${toIdx + 1},${weight}\n`;
                });
            });
        });

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `neural_network_data_${activationFunction}_${lossFunction}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Update the useEffect that handles numOutputs changes
    useEffect(() => {
        setExpectedOutputs(Array(numOutputs).fill(0.5));
        setOutputErrors(Array(numOutputs).fill(0)); // Initialize output errors
    }, [numOutputs]);

    // Update the error calculation useEffect
    useEffect(() => {
        if (nodeActivations.length > 0) {
            const actualOutputs = nodeActivations[nodeActivations.length - 1] || [];
            const errors = actualOutputs.map((actual, index) => {
                const expected = expectedOutputs[index];
                return lossFunctionInfo[lossFunction].calculate(expected, actual);
            });
            
            setOutputErrors(errors);
            const total = errors.reduce((sum, error) => sum + error, 0);
            setTotalError(total);
            
            // Update loss history
            setLossHistory(prev => [...prev.slice(-29), total]); // Keep last 30 values
        }
    }, [nodeActivations, expectedOutputs, lossFunction]);

    // Handler for expected output changes
    const handleExpectedOutputChange = (index, value) => {
        const newExpectedOutputs = [...expectedOutputs];
        newExpectedOutputs[index] = Number(value);
        setExpectedOutputs(newExpectedOutputs);
    };

    // Update the downloadJPEG function
    const downloadJPEG = () => {
        // Get the SVG element and its container
        const svgElement = document.querySelector('.network-visualization svg');
        const container = document.querySelector('.visualization-container');
        if (!svgElement || !container) return;

        // Get the SVG content bounds
        const bbox = svgElement.getBBox();
        
        // Add padding to ensure nothing is cut off
        const padding = 50;
        const width = bbox.width + padding * 2;
        const height = bbox.height + padding * 2;
        
        // Create a copy of the SVG with proper dimensions
        const clonedSvg = svgElement.cloneNode(true);
        
        // Set viewBox to include the entire content
        clonedSvg.setAttribute('viewBox', `${bbox.x - padding} ${bbox.y - padding} ${width} ${height}`);
        clonedSvg.setAttribute('width', width);
        clonedSvg.setAttribute('height', height);
        
        // Create a canvas with higher resolution for better quality
        const scale = 2; // Increase this for higher quality
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width * scale;
        canvas.height = height * scale;
        
        // Scale the context to match the higher resolution
        ctx.scale(scale, scale);
        
        // Set background
        ctx.fillStyle = '#e5e5e5';
        ctx.fillRect(0, 0, width, height);
        
        // Convert SVG to string with correct dimensions
        const svgData = new XMLSerializer().serializeToString(clonedSvg);
        const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
        const url = URL.createObjectURL(svgBlob);
        
        // Create image
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, width, height);
            // Convert to JPEG and download with high quality
            canvas.toBlob((blob) => {
                const link = document.createElement('a');
                link.download = `neural_network_${activationFunction}_${lossFunction}.jpg`;
                link.href = URL.createObjectURL(blob);
                link.click();
                URL.revokeObjectURL(link.href);
                URL.revokeObjectURL(url);
            }, 'image/jpeg', 1.0); // Maximum quality
        };
        img.src = url;
    };

    // Forward propagation function
    const forwardPropagate = () => {
        if (!weights.length) return;

        // Start with input layer
        let activations = [inputValues];

        // Process each layer
        for (let layerIdx = 0; layerIdx < weights.length; layerIdx++) {
            const currentActivations = [];
            const currentLayer = weights[layerIdx];
            const prevActivations = activations[activations.length - 1];

            // For each neuron in the current layer
            for (let neuronIdx = 0; neuronIdx < currentLayer[0].length; neuronIdx++) {
                // Calculate weighted sum
                let sum = 0;
                for (let prevNeuronIdx = 0; prevNeuronIdx < prevActivations.length; prevNeuronIdx++) {
                    sum += prevActivations[prevNeuronIdx] * currentLayer[prevNeuronIdx][neuronIdx];
                }
                // Apply activation function
                currentActivations.push(activationFunctions[activationFunction](sum));
            }
            activations.push(currentActivations);
        }

        setNodeActivations(activations);
    };

    // Calculate gradients for backpropagation
    const calculateGradients = (outputs, netInputs) => {
        // Calculate output layer deltas
        const deltas = [outputs.map((output, i) => {
            const expected = expectedOutputs[i];
            const errorDerivative = lossFunctionInfo[lossFunction].derivative(expected, output);
            const activationDerivative = activationDerivatives[activationFunction](netInputs[netInputs.length - 1][i]);
            return errorDerivative * activationDerivative;
        })];

        // Calculate hidden layer deltas
        for (let layerIdx = weights.length - 1; layerIdx > 0; layerIdx--) {
            const currentDeltas = [];
            const currentLayer = weights[layerIdx];
            const nextDeltas = deltas[0];

            for (let i = 0; i < weights[layerIdx - 1][0].length; i++) {
                let error = 0;
                for (let j = 0; j < nextDeltas.length; j++) {
                    error += nextDeltas[j] * currentLayer[i][j];
                }
                const activationDerivative = activationDerivatives[activationFunction](netInputs[layerIdx][i]);
                currentDeltas.push(error * activationDerivative);
            }
            deltas.unshift(currentDeltas);
        }

        // Calculate gradients
        return weights.map((layer, layerIdx) => {
            return layer.map((neuronWeights, fromNeuron) => {
                return neuronWeights.map((weight, toNeuron) => {
                    const delta = deltas[layerIdx][toNeuron];
                    const input = nodeActivations[layerIdx][fromNeuron];
                    return delta * input;
                });
            });
        });
    };

    // Calculate variance of an array of numbers
    const calculateVariance = (numbers) => {
        if (!numbers || numbers.length === 0) return 0;
        
        const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
        const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
        const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
        
        return variance;
    };

    // Calculate the magnitude of gradients (root mean square)
    const calculateGradientMagnitude = (gradients) => {
        if (!gradients) return 0;
        
        let sumSquared = 0;
        let count = 0;
        
        // Flatten and process all gradients
        gradients.forEach(layer => {
            layer.forEach(neuron => {
                neuron.forEach(gradient => {
                    sumSquared += gradient * gradient;
                    count++;
                });
            });
        });
        
        return count > 0 ? Math.sqrt(sumSquared / count) : 0;
    };

    // Modify backpropagate function to handle batches
    const backpropagate = async () => {
        // Initialize batch gradients
        const batchGradients = weights.map(layer =>
            layer.map(neuron =>
                neuron.map(() => 0)
            )
        );
        
        let totalBatchError = 0;
        let currentOutputErrors = [];  // Add this to store current output errors
        
        // Process each sample in the batch
        for (let i = 0; i < batchSize; i++) {
            // Forward pass remains the same
            forwardPropagate();
            
            const outputs = nodeActivations[nodeActivations.length - 1];
            const netInputs = calculateNetInputs();
            
            // Calculate output errors first
            currentOutputErrors = outputs.map((output, j) => {
                return expectedOutputs[j] - output;
            });
            
            // Calculate hidden layer errors through backpropagation
            const hiddenErrors = [];
            for (let layerIdx = weights.length - 1; layerIdx > 0; layerIdx--) {
                const layerError = [];
                const nextErrors = layerIdx === weights.length - 1 ? currentOutputErrors : hiddenErrors[0];
                
                for (let i = 0; i < weights[layerIdx - 1][0].length; i++) {
                    let error = 0;
                    for (let j = 0; j < nextErrors.length; j++) {
                        error += nextErrors[j] * weights[layerIdx][i][j];
                    }
                    layerError.push(error);
                }
                hiddenErrors.unshift(layerError);
            }
            
            // Update state with errors
            setLayerErrors(hiddenErrors);
            setOutputErrors(currentOutputErrors);
            
            // Calculate error for this sample
            const sampleError = outputs.reduce((sum, output, j) => {
                return sum + lossFunctionInfo[lossFunction].calculate(expectedOutputs[j], output);
            }, 0);
            
            totalBatchError += sampleError;
            
            // Rest of the batch processing...
            const sampleGradients = calculateGradients(outputs, netInputs);
            
            // Accumulate gradients...
            batchGradients.forEach((layer, layerIdx) => {
                layer.forEach((neuron, fromNeuron) => {
                    neuron.forEach((_, toNeuron) => {
                        batchGradients[layerIdx][fromNeuron][toNeuron] += 
                            sampleGradients[layerIdx][fromNeuron][toNeuron];
                    });
                });
            });
            
            setBatchProgress(i + 1);
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        // Process batch results...
        const avgError = totalBatchError / batchSize;
        setLossHistory(prev => [...prev, avgError]);
        
        // Apply momentum to averaged gradients
        const finalGradients = batchGradients.map((layer, layerIdx) => {
            return layer.map((neuronGradients, fromNeuron) => {
                return neuronGradients.map((gradient, toNeuron) => {
                    const avgGradient = gradient / batchSize;
                    const previousGradient = previousGradients?.[layerIdx]?.[fromNeuron]?.[toNeuron] || 0;
                    return avgGradient + momentum * previousGradient;
                });
            });
        });
        
        // Update weights using averaged gradients
        const newWeights = weights.map((layer, layerIdx) => {
            return layer.map((neuronWeights, fromNeuron) => {
                return neuronWeights.map((weight, toNeuron) => {
                    const gradient = finalGradients[layerIdx][fromNeuron][toNeuron];
                    return weight - learningRate * gradient;
                });
            });
        });
        
        setPreviousGradients(finalGradients);
        setWeights(newWeights);
        setBatchProgress(0);
        
        // Calculate batch statistics
        const batchStats = {
            avgError: avgError,
            variance: calculateVariance(currentOutputErrors),
            gradientMagnitude: calculateGradientMagnitude(finalGradients)
        };
        setBatchStats(batchStats);
    };

    // Update handleStep function
    const handleStep = () => {
        backpropagate();
        setEpoch(prev => prev + 1);
    };

    // Update handleStartTraining
    const handleStartTraining = () => {
        setIsTraining(true);
        const trainInterval = setInterval(() => {
            if (!isTraining) {
                clearInterval(trainInterval);
                return;
            }
            backpropagate();
            setEpoch(prev => prev + 1);
        }, trainingSpeed);
        
        // Clean up interval on component unmount
        return () => clearInterval(trainInterval);
    };

    const handleStopTraining = () => {
        setIsTraining(false);
    };

    // Add this test function
    const testXOR = () => {
        const testCases = [
            { inputs: [0, 0], expected: 0 },
            { inputs: [1, 0], expected: 1 },
            { inputs: [0, 1], expected: 1 },
            { inputs: [1, 1], expected: 0 }
        ];
        
        let totalError = 0;
        testCases.forEach(testCase => {
            setInputValues(testCase.inputs);
            setExpectedOutputs([testCase.expected]);
            calculateActivations();
            const output = nodeActivations[nodeActivations.length - 1][0];
            const error = Math.abs(testCase.expected - output);
            totalError += error;
            console.log(`Input: ${testCase.inputs}, Expected: ${testCase.expected}, Got: ${output.toFixed(4)}, Error: ${error.toFixed(4)}`);
        });
        console.log(`Total Error: ${totalError.toFixed(4)}`);
    };

    return (
        <>
            <TopPanel 
                activationFunction={activationFunction}
                onExportData={exportNetworkData}
                downloadJPEG={downloadJPEG}
                randomizeWeights={randomizeWeights}
                numInputs={numInputs}
                numOutputs={numOutputs}
                numHiddenLayers={numHiddenLayers}
                totalError={totalError}
                lossFunction={lossFunction}
            />
            <div className="app-container">
                <ControlsPanel
                    numInputs={numInputs}
                    setNumInputs={setNumInputs}
                numHiddenLayers={numHiddenLayers}
                onHiddenLayersChange={handleNumHiddenLayersChange}
                hiddenLayerNeurons={hiddenLayerNeurons}
                setHiddenLayerNeurons={setHiddenLayerNeurons}
                numOutputs={numOutputs}
                setNumOutputs={setNumOutputs}
                activationFunction={activationFunction}
                setActivationFunction={setActivationFunction}
                randomizeWeights={randomizeWeights}
                    inputValues={inputValues}
                    handleInputChange={handleInputChange}
                    expectedOutputs={expectedOutputs}
                    handleExpectedOutputChange={handleExpectedOutputChange}
                    lossFunction={lossFunction}
                    setLossFunction={setLossFunction}
                    learningRate={learningRate}
                    setLearningRate={setLearningRate}
                    isTraining={isTraining}
                    onStartTraining={handleStartTraining}
                    onStopTraining={handleStopTraining}
                    onStep={handleStep}
                    epoch={epoch}
                    batchSize={batchSize}
                    setBatchSize={setBatchSize}
                    trainingSpeed={trainingSpeed}
                    setTrainingSpeed={setTrainingSpeed}
                    momentum={momentum}
                    setMomentum={setMomentum}
                    batchProgress={batchProgress}
                    batchStats={batchStats}
                    layerErrors={layerErrors}
                />
                <ErrorBoundary>
            <NetworkVisualization
                numInputs={numInputs}
                numHiddenLayers={numHiddenLayers}
                hiddenLayerNeurons={hiddenLayerNeurons}
                numOutputs={numOutputs}
                weights={weights}
                        setWeights={setWeights}
                activationFunction={activationFunction}
                        inputValues={inputValues}
                        nodeActivations={nodeActivations}
                        handleInputChange={handleInputChange}
                        expectedOutputs={expectedOutputs}
                        outputErrors={outputErrors}
                        totalError={totalError}
                        handleExpectedOutputChange={handleExpectedOutputChange}
                        lossFunction={lossFunction}
                        lossHistory={lossHistory}
                        previousGradients={previousGradients}
                        layerErrors={layerErrors}
                    />
                    <LossHistoryPanel 
                        lossHistory={lossHistory}
                        lossFunction={lossFunction}
                    />
                </ErrorBoundary>
        </div>
        </>
    );
}

export default App;