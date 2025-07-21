import React from 'react';
import { render, screen } from '@testing-library/react';
import UserCard from '../Components/UserCard';

describe('UserCard Component', () => {
  const mockProps = {
    img: 'https://example.com/avatar.jpg',
    name: 'John Doe',
    email: 'john.doe@example.com',
    styles: 'custom-style'
  };

  test('renders user name correctly', () => {
    render(<UserCard {...mockProps} />);
    
    const nameElement = screen.getByText('John Doe');
    expect(nameElement).toBeInTheDocument();
  });

  test('renders user email correctly', () => {
    render(<UserCard {...mockProps} />);
    
    const emailElement = screen.getByText('john.doe@example.com');
    expect(emailElement).toBeInTheDocument();
  });

  test('renders user avatar with correct src and alt', () => {
    render(<UserCard {...mockProps} />);
    
    const avatarElement = screen.getByAltText('John Doe');
    expect(avatarElement).toBeInTheDocument();
    expect(avatarElement).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  test('applies custom styles correctly', () => {
    render(<UserCard {...mockProps} />);
    
    // The styles are applied to the div that contains the image and text
    const styledDiv = screen.getByRole('img').closest('div');
    expect(styledDiv).toHaveClass('custom-style');
  });

  test('handles missing props gracefully', () => {
    const minimalProps = {
      name: 'Jane Smith',
      email: 'jane@example.com'
    };
    
    render(<UserCard {...minimalProps} />);
    
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });
});
