export const Loader = ({ size = 'medium', color = 'currentColor', className = '' }) => {
  const sizeMap = {
    small: 16,
    medium: 20,
    large: 32,
  };

  const dimension = sizeMap[size] || 20;

  return (
    <svg
      className={`animate-spin ${className}`}
      width={dimension}
      height={dimension}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="status"
      aria-label="Loading"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default Loader;
