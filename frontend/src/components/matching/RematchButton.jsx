import { useState } from 'react';
import Button from '../common/Button';
import { rematchServiceRequest } from '../../services/matching.api';

export const RematchButton = ({
  requestId,
  status,
  onRematchSuccess,
  onError,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Rematching is only allowed for OPEN or MATCHED requests
  if (status !== 'OPEN' && status !== 'MATCHED') {
    return null;
  }

  const handleRematch = async () => {
    if (!requestId || isLoading) return;

    try {
      setIsLoading(true);
      const response = await rematchServiceRequest(requestId);
      if (onRematchSuccess) {
        onRematchSuccess(response.data);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        'Unable to rematch workers at this moment. Please try again.';
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="small"
      onClick={handleRematch}
      isLoading={isLoading}
      disabled={isLoading}
      className={className}
      icon={
        !isLoading && (
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.19" />
          </svg>
        )
      }
    >
      {isLoading ? 'Finding Workers...' : 'Find Workers Again'}
    </Button>
  );
};

export default RematchButton;
