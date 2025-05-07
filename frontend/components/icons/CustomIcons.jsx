import React from 'react';
import { Cube } from 'lucide-react';

// Create a proper component with default export
const Image3D = ({ size, color, ...props }) => {
  return <Cube size={size} color={color} {...props} />;
};

export default Image3D;