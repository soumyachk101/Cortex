'use client';

import { useState, useEffect } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
}

const ENV_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
const TEST_SITE_KEY = '1x00000000000000000000AA';

export function TurnstileCaptcha({ onVerify, onExpire, onError }: TurnstileCaptchaProps) {
  const [siteKey, setSiteKey] = useState<string>(TEST_SITE_KEY);

  useEffect(() => {
    if (ENV_SITE_KEY) {
      setSiteKey(ENV_SITE_KEY);
    }
  }, []);

  const handleError = () => {
    // If real sitekey fails on localhost (Error 110200: origin not allowed), fallback to test key for smooth dev
    if (siteKey !== TEST_SITE_KEY && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.warn('[Turnstile] Site key failed on localhost (Error 110200). Falling back to Cloudflare test key for local development.');
      setSiteKey(TEST_SITE_KEY);
      return;
    }
    if (onError) onError();
    else onVerify('');
  };

  return (
    <div className="flex justify-center my-4 overflow-hidden rounded-xl">
      <Turnstile
        key={siteKey}
        siteKey={siteKey}
        onSuccess={(token) => onVerify(token)}
        onExpire={() => {
          if (onExpire) onExpire();
          else onVerify('');
        }}
        onError={handleError}
        options={{
          theme: 'light',
          size: 'normal',
        }}
      />
    </div>
  );
}
