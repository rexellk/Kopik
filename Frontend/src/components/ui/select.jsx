import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const SelectContext = createContext({});

export function Select({ value, onValueChange, defaultValue, children }) {
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  
  const currentValue = value !== undefined ? value : internalValue;
  
  const handleValueChange = (newValue) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
    setIsOpen(false);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <SelectContext.Provider value={{ 
      value: currentValue, 
      onValueChange: handleValueChange, 
      isOpen, 
      setIsOpen 
    }}>
      <div ref={selectRef} className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ children, className = "" }) {
  const { isOpen, setIsOpen } = useContext(SelectContext);
  
  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
      <svg 
        width="15" 
        height="15" 
        viewBox="0 0 15 15" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
      >
        <path d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819L7.43179 8.56819C7.60753 8.74392 7.89245 8.74392 8.06819 8.56819L10.5682 6.06819C10.7439 5.89245 10.7439 5.60753 10.5682 5.43179C10.3924 5.25605 10.1075 5.25605 9.93179 5.43179L7.75 7.61358L5.56821 5.43179C5.39245 5.25605 5.10753 5.25605 4.93179 5.43179Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
      </svg>
    </button>
  );
}

export function SelectValue({ placeholder = "Select..." }) {
  const { value } = useContext(SelectContext);
  
  return (
    <span className={value ? "text-gray-900" : "text-gray-500"}>
      {value || placeholder}
    </span>
  );
}

export function SelectContent({ children, className = "" }) {
  const { isOpen } = useContext(SelectContext);
  
  if (!isOpen) return null;
  
  return (
    <div className={`absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-white text-gray-950 shadow-lg ${className}`}>
      {children}
    </div>
  );
}

export function SelectItem({ value, children, className = "" }) {
  const { onValueChange, value: selectedValue } = useContext(SelectContext);
  const isSelected = selectedValue === value;
  
  return (
    <div
      onClick={() => onValueChange(value)}
      className={`relative flex w-full cursor-pointer select-none items-center px-3 py-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 ${
        isSelected ? 'bg-blue-50 text-blue-900' : ''
      } ${className}`}
    >
      {children}
      {isSelected && (
        <svg
          className="ml-auto h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </div>
  );
}