import React, { createContext, useContext, useState } from 'react';

const SidebarContext = createContext({});

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function Sidebar({ children, className = "" }) {
  return (
    <div className={`w-64 bg-white border-r border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

export function SidebarHeader({ children, className = "" }) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}

export function SidebarContent({ children, className = "" }) {
  return (
    <div className={`flex-1 overflow-y-auto ${className}`}>
      {children}
    </div>
  );
}

export function SidebarFooter({ children, className = "" }) {
  return (
    <div className={`p-4 mt-auto ${className}`}>
      {children}
    </div>
  );
}

export function SidebarGroup({ children, className = "" }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function SidebarGroupLabel({ children, className = "" }) {
  return (
    <div className={`px-2 py-1 text-sm font-medium text-gray-500 ${className}`}>
      {children}
    </div>
  );
}

export function SidebarGroupContent({ children, className = "" }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function SidebarMenu({ children, className = "" }) {
  return (
    <ul className={`space-y-1 ${className}`}>
      {children}
    </ul>
  );
}

export function SidebarMenuItem({ children, className = "" }) {
  return (
    <li className={className}>
      {children}
    </li>
  );
}

export function SidebarMenuButton({ children, asChild = false, className = "" }) {
  if (asChild) {
    return React.cloneElement(children, {
      className: `${children.props.className || ''} ${className}`.trim()
    });
  }
  
  return (
    <button className={`w-full text-left ${className}`}>
      {children}
    </button>
  );
}

export function SidebarTrigger({ className = "" }) {
  const { isOpen, setIsOpen } = useContext(SidebarContext);
  
  return (
    <button 
      onClick={() => setIsOpen(!isOpen)}
      className={`p-2 ${className}`}
    >
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    </button>
  );
}