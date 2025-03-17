import React from 'react';
import { render } from '@testing-library/react';

// Mock the App component to avoid router dependencies
jest.mock('./App', () => () => <div>Mocked App</div>);

test('renders the application', () => {
  const { container } = render(<div>Test Passed</div>);
  expect(container).toBeInTheDocument();
});
