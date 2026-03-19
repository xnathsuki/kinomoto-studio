// SVG decorativos kawaii para Studio Yume

export const StarIcon = ({ size = 12, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z" fill="#ff6eb4" opacity="0.8"/>
  </svg>
);

export const HeartIcon = ({ size = 10, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" className={className}>
    <path d="M8 14l-1.5-1.3C3.5 9.5 1 7.2 1 4.5 1 2.5 2.5 1 4.5 1c1.3 0 2.5.7 3.2 1.7.7-1 1.9-1.7 3.2-1.7 2 0 3.5 1.5 3.5 3.5 0 2.7-2.5 5-5.5 8.2L8 14z" fill="#ff6eb4"/>
  </svg>
);

export const FlowerIcon = ({ size = 8, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" className={className}>
    <circle cx="8" cy="8" r="2" fill="#c084fc"/>
    <circle cx="8" cy="4" r="1.5" fill="#67e8b1"/>
    <circle cx="12" cy="8" r="1.5" fill="#67e8b1"/>
    <circle cx="8" cy="12" r="1.5" fill="#67e8b1"/>
    <circle cx="4" cy="8" r="1.5" fill="#67e8b1"/>
    <circle cx="10" cy="6" r="1" fill="#ff6eb4"/>
    <circle cx="10" cy="10" r="1" fill="#ff6eb4"/>
    <circle cx="6" cy="10" r="1" fill="#ff6eb4"/>
    <circle cx="6" cy="6" r="1" fill="#ff6eb4"/>
  </svg>
);

export const MoonIcon = ({ size = 12, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 3a9 9 0 1 0 9 9c0-.5-.05-1-.15-1.5-.5.3-1.1.5-1.7.5-2.2 0-4-1.8-4-4 0-.6.2-1.2.5-1.7C13 3.05 12.5 3 12 3z" fill="#c084fc" opacity="0.8"/>
  </svg>
);

export const CardDecor = () => (
  <div className="card-decor" aria-hidden="true">
    <StarIcon size={10} className="decor-top-right" />
    <FlowerIcon size={6} className="decor-bottom-left" />
  </div>
);
