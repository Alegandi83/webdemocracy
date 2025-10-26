import React, { useState } from 'react';
import { Star, Heart } from 'lucide-react';

interface RatingInputProps {
  value: number | null;
  onChange: (value: number) => void;
  max: number;
  icon?: 'star' | 'heart' | 'number';
  disabled?: boolean;
}

const RatingInput: React.FC<RatingInputProps> = ({
  value,
  onChange,
  max = 5,
  icon = 'star',
  disabled = false
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const getIcon = (index: number) => {
    const isActive = (hoverValue !== null ? hoverValue : value || 0) >= index;
    const size = 32;
    const style = {
      cursor: disabled ? 'default' : 'pointer',
      transition: 'all 0.2s ease'
    };

    if (icon === 'star') {
      return (
        <Star
          key={index}
          size={size}
          fill={isActive ? '#fbbf24' : 'none'}
          stroke={isActive ? '#fbbf24' : '#cbd5e1'}
          strokeWidth={2}
          style={style}
        />
      );
    } else if (icon === 'heart') {
      return (
        <Heart
          key={index}
          size={size}
          fill={isActive ? '#ec4899' : 'none'}
          stroke={isActive ? '#ec4899' : '#cbd5e1'}
          strokeWidth={2}
          style={style}
        />
      );
    } else {
      // Number circles
      return (
        <div
          key={index}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${isActive ? '#6366f1' : '#cbd5e1'}`,
            background: isActive ? '#6366f1' : 'transparent',
            color: isActive ? 'white' : '#64748b',
            fontSize: '1rem',
            fontWeight: '600',
            ...style
          }}
        >
          {index}
        </div>
      );
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center'
        }}
      >
        {Array.from({ length: max }, (_, i) => i + 1).map((index) => (
          <div
            key={index}
            onMouseEnter={() => !disabled && setHoverValue(index)}
            onMouseLeave={() => !disabled && setHoverValue(null)}
            onClick={() => !disabled && onChange(index)}
            style={{
              transform: hoverValue === index ? 'scale(1.1)' : 'scale(1)',
              transition: 'transform 0.2s ease'
            }}
          >
            {getIcon(index)}
          </div>
        ))}
      </div>
      {value && (
        <div style={{
          marginTop: '0.75rem',
          fontSize: '0.875rem',
          color: '#64748b',
          fontWeight: '500'
        }}>
          Voto: {value}/{max}
        </div>
      )}
    </div>
  );
};

export default RatingInput;

