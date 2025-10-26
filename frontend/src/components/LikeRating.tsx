import React from 'react';
import { Circle } from 'lucide-react';

interface LikeRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
}

const LikeRating: React.FC<LikeRatingProps> = ({ value, onChange, readonly = false, size = 24 }) => {
  const [hover, setHover] = React.useState(0);

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((rating) => {
        const isActive = rating <= (hover || value);
        return (
          <div
            key={rating}
            onClick={() => handleClick(rating)}
            onMouseEnter={() => !readonly && setHover(rating)}
            onMouseLeave={() => !readonly && setHover(0)}
            style={{
              cursor: readonly ? 'default' : 'pointer',
              transition: 'transform 0.2s ease',
              transform: !readonly && hover === rating ? 'scale(1.2)' : 'scale(1)',
            }}
          >
            <Circle
              size={size}
              fill={isActive ? '#10b981' : 'transparent'}
              color={isActive ? '#10b981' : '#d1d5db'}
              strokeWidth={2}
            />
          </div>
        );
      })}
    </div>
  );
};

export default LikeRating;

