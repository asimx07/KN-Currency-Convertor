import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AmountInput from '../AmountInput';

describe('AmountInput', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default value', () => {
    render(<AmountInput value={100} onChange={mockOnChange} />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue(100);
  });

  it('calls onChange when value changes', () => {
    render(<AmountInput value={100} onChange={mockOnChange} />);
    const input = screen.getByRole('spinbutton');
    
    fireEvent.change(input, { target: { value: '200' } });
    expect(mockOnChange).toHaveBeenCalledWith(200);
  });

  it('handles invalid input', () => {
    render(<AmountInput value={100} onChange={mockOnChange} />);
    const input = screen.getByRole('spinbutton');
    
    fireEvent.change(input, { target: { value: '' } });
    expect(mockOnChange).toHaveBeenCalledWith(0);
  });

  it('handles negative values', () => {
    render(<AmountInput value={100} onChange={mockOnChange} />);
    const input = screen.getByRole('spinbutton');
    
    fireEvent.change(input, { target: { value: '-100' } });
    expect(mockOnChange).toHaveBeenCalledWith(-100);
  });

  it('handles decimal values', () => {
    render(<AmountInput value={100} onChange={mockOnChange} />);
    const input = screen.getByRole('spinbutton');
    
    fireEvent.change(input, { target: { value: '100.50' } });
    expect(mockOnChange).toHaveBeenCalledWith(100.5);
  });

  it('displays loading state', () => {
    render(<AmountInput value={100} onChange={mockOnChange} isLoading={true} />);
    const input = screen.getByRole('spinbutton');
    expect(input).toBeDisabled();
  });

  it('displays error state', () => {
    render(<AmountInput value={100} onChange={mockOnChange} error="Invalid amount" />);
    expect(screen.getByText('Invalid amount')).toBeInTheDocument();
  });

  it('handles keyboard input', () => {
    render(<AmountInput value={100} onChange={mockOnChange} />);
    const input = screen.getByRole('spinbutton');
    
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(mockOnChange).toHaveBeenCalledWith(100);
  });
}); 