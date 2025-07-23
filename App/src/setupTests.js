require('@testing-library/jest-dom');

// Mock Material Tailwind React components
jest.mock('@material-tailwind/react', () => ({
  ListItem: ({ children, ...props }) => {
    const React = require('react');
    return React.createElement('li', props, children);
  },
  ListItemPrefix: ({ children, ...props }) => {
    const React = require('react');
    return React.createElement('div', props, children);
  },
  Avatar: ({ src, alt, ...props }) => {
    const React = require('react');
    return React.createElement('img', { src, alt, ...props });
  },
  Typography: ({ children, ...props }) => {
    const React = require('react');
    return React.createElement('span', props, children);
  },
}));
