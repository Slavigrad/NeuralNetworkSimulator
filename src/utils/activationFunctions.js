export const activationFunctionInfo = {
  ReLU: {
    formula: 'f(x) = max(0, x)',
    description: 'Rectified Linear Unit: Returns x if positive, 0 otherwise'
  },
  Sigmoid: {
    formula: 'f(x) = 1 / (1 + e⁻ˣ)',
    description: 'Squashes values between 0 and 1'
  },
  Tanh: {
    formula: 'f(x) = (e²ˣ - 1) / (e²ˣ + 1)',
    description: 'Hyperbolic tangent: Squashes values between -1 and 1'
  },
  Linear: {
    formula: 'f(x) = x',
    description: 'Linear activation: No transformation'
  }
}; 