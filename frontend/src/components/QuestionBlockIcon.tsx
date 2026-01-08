import React from 'react';
import questionBlockImage from '../assets/logos/others/question-block-render.png';

interface QuestionBlockIconProps {
  size?: number;
  color?: string;
}

const QuestionBlockIcon: React.FC<QuestionBlockIconProps> = ({ 
  size = 28
}) => {
  return (
    <img 
      src={questionBlockImage} 
      alt="Informazioni" 
      style={{ 
        width: size, 
        height: size,
        display: 'block',
        transform: 'rotate(-8deg)',
        transition: 'transform 0.2s ease'
      }} 
    />
  );
};

export default QuestionBlockIcon;

