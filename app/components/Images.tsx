import { FC, MouseEvent } from 'react';

interface IconProps {
  className?: string;
  size?: number;
  onClick?: (e: MouseEvent) => void;
}

export const CloseIcon: FC<IconProps> = ({ className, size = 20, onClick }) => {
  return (
    <div className={className} onClick={onClick}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </div>
  );
};
