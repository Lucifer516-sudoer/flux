import React from 'react';

const Input = ({ label, id, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-text mb-1">
        {label}
      </label>
      <input
        id={id}
        className="w-full bg-background border-2 border-border-dark rounded-md px-3 py-2 text-neutral-text font-mono
                   focus:outline-none focus:ring-2 focus:ring-highlight focus:border-highlight
                   focus:shadow-glow-highlight transition-all duration-200"
        {...props}
      />
    </div>
  );
};

export default Input;
