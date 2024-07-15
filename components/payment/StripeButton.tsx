import React, { useEffect, useRef } from 'react';

interface StripeButtonProps {
  buyButtonId: string;
  publishableKey: string;
}

const StripeButton: React.FC<StripeButtonProps> = ({ buyButtonId, publishableKey }) => {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (buttonRef.current) {
      const button = buttonRef.current;
      button.innerHTML = '';
      const stripeBuyButton = document.createElement('stripe-buy-button');
      stripeBuyButton.setAttribute('buy-button-id', buyButtonId);
      stripeBuyButton.setAttribute('publishable-key', publishableKey);
      button.appendChild(stripeBuyButton);
    }
  }, [buyButtonId, publishableKey]);

  return <div ref={buttonRef}></div>;
};

export default StripeButton;