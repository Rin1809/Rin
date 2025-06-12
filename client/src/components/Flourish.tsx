// src/components/Flourish.tsx
import React from 'react';
import './styles/Flourish.css'; 

// --- Chọn một trong các path data sau hoặc dùng path của riêng ---
const simpleFlourishPathData = "M 10 20 Q 125 0, 250 20 T 490 20";


const currentFlourishPathData = simpleFlourishPathData; 

interface FlourishProps {
  position?: 'top' | 'bottom'; 
  className?: string;
  style?: React.CSSProperties;
  strokeWidth?: number;
  viewBox?: string; 
}

const Flourish: React.FC<FlourishProps> = ({
  position,
  className = '',
  style,
  strokeWidth = 1, 
  viewBox = "0 0 500 30" 
}) => {
  const containerClass = `flourish-svg-container ${position ? `flourish-${position}` : ''} ${className}`;

  return (
    <div className={containerClass} style={style} aria-hidden="true"> {/* aria-hidden vì nó chỉ để trang trí */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={viewBox}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={currentFlourishPathData} />
      </svg>
    </div>
  );
};

export default Flourish;