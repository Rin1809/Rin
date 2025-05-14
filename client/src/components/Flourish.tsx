// src/components/Flourish.tsx
import React from 'react';
import './styles/Flourish.css'; // Sẽ tạo file này ở bước sau

// --- Chọn một trong các path data sau hoặc dùng path của riêng bạn ---
// Path data đơn giản, đối xứng (Ví dụ mới)
const simpleFlourishPathData = "M 10 20 Q 125 0, 250 20 T 490 20";
// Path data từ LanguageSelector (Phức tạp hơn)
// const complexFlourishPathData = "M 10 25 C 100 -5, 200 15, 240 23 L 250 15 L 260 23 C 300 15, 400 -5, 490 25";

// Chọn path data bạn muốn sử dụng
const currentFlourishPathData = simpleFlourishPathData; // <-- Thay đổi ở đây nếu muốn

interface FlourishProps {
  position?: 'top' | 'bottom'; // Tùy chọn, để style khác nhau nếu cần
  className?: string;
  style?: React.CSSProperties;
  strokeWidth?: number;
  viewBox?: string; // Cho phép tùy chỉnh viewBox nếu cần
}

const Flourish: React.FC<FlourishProps> = ({
  position,
  className = '',
  style,
  strokeWidth = 1, // Mỏng hơn một chút mặc định
  viewBox = "0 0 500 30" // ViewBox phù hợp với simpleFlourishPathData
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