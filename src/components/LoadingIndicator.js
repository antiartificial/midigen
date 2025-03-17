import React from 'react';

const LoadingIndicator = ({ loading, message }) => {
  if (!loading) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white px-4 py-2 text-center">
      {message || 'Loading...'}
    </div>
  );
};

export default LoadingIndicator;