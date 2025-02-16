export const lossFunctionInfo = {
  'Mean Squared Error': {
    formula: 'MSE = 1/n Σ(y - ŷ)²',
    description: 'Measures the average squared difference between predicted and actual values',
    calculate: (expected, actual) => Math.pow(expected - actual, 2),
    derivative: (expected, actual) => -2 * (expected - actual)
  },
  'Mean Absolute Error': {
    formula: 'MAE = 1/n Σ|y - ŷ|',
    description: 'Measures the average absolute difference between predicted and actual values',
    calculate: (expected, actual) => Math.abs(expected - actual),
    derivative: (expected, actual) => (actual > expected) ? 1 : -1
  },
  'Binary Cross-Entropy': {
    formula: 'BCE = -(y log(ŷ) + (1-y)log(1-ŷ))',
    description: 'Measures the performance of a classification model whose output is a probability value between 0 and 1',
    calculate: (expected, actual) => {
      const epsilon = 1e-15;
      actual = Math.min(Math.max(actual, epsilon), 1 - epsilon);
      return -(expected * Math.log(actual) + (1 - expected) * Math.log(1 - actual));
    },
    derivative: (expected, actual) => {
      const epsilon = 1e-15;
      actual = Math.min(Math.max(actual, epsilon), 1 - epsilon);
      return (actual - expected) / (actual * (1 - actual));
    }
  },
  'Categorical Cross-Entropy': {
    formula: 'CCE = -Σ y log(ŷ)',
    description: 'Used for multi-class classification. Measures probability error across multiple classes.',
    calculate: (expected, actual) => {
      const epsilon = 1e-15;
      const p = Math.max(Math.min(actual, 1 - epsilon), epsilon);
      return -(expected * Math.log(p));
    },
    derivative: (expected, actual) => {
      const epsilon = 1e-15;
      const p = Math.max(Math.min(actual, 1 - epsilon), epsilon);
      return -expected / p;
    }
  }
}; 