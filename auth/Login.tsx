import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import NeonButton from '../components/NeonButton';

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

type AuthMethod = 'google' | 'email' | 'phone';

const Login: React.FC = () => {
  const [authMethod, setAuthMethod] = useState<AuthMethod>('google');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authMethod === 'phone') {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {}
      });
    }
  }, [authMethod]);

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Error during Google sign in:', err);
      setError(err.message || 'Failed to sign in. Please try again.');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error('Error during email auth:', err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const handlePhoneSignIn = async () => {
    setError(null);
    try {
      const verifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, `+${phone}`, verifier);
      setConfirmationResult(result);
    } catch (err: any) {
      console.error('Error during phone sign in:', err);
      setError(err.message || 'Failed to send verification code. Please check the phone number.');
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    if (!confirmationResult) {
      setError("Please request a verification code first.");
      return;
    }
    try {
      await confirmationResult.confirm(otp);
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      setError(err.message || 'Invalid verification code. Please try again.');
    }
  };

  const renderAuthMethod = () => {
    switch (authMethod) {
      case 'email':
        return (
          <motion.form
            onSubmit={handleEmailAuth}
            className="w-full flex flex-col gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="input"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              className="input"
            />
            <NeonButton type="submit" color="magenta" className="w-full">
              {isSignUp ? 'Sign Up' : 'Login'}
            </NeonButton>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-cyan)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </button>
          </motion.form>
        );
      case 'phone':
        return (
          <motion.div
            className="w-full flex flex-col gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {!confirmationResult ? (
              <>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number with country code"
                  required
                  className="input"
                />
                <NeonButton onClick={handlePhoneSignIn} color="magenta" className="w-full">
                  Send Code
                </NeonButton>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit verification code"
                  required
                  className="input"
                />
                <NeonButton onClick={handleVerifyOtp} color="magenta" className="w-full">
                  Verify & Sign In
                </NeonButton>
              </>
            )}
          </motion.div>
        );
      case 'google':
      default:
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%' }}
          >
            <NeonButton onClick={handleGoogleSignIn} color="magenta" className="w-full">
              Sign in with Google
            </NeonButton>
          </motion.div>
        );
    }
  };

  return (
    <motion.div
      className="card card-purple p-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        alignItems: 'center',
        width: '100%',
        maxWidth: '28rem'
      }}
    >
      <h2
        className="text-gradient-purple"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--font-size-3xl)',
          textAlign: 'center'
        }}
      >
        // SECURE LOGIN //
      </h2>
      <div
        className="flex w-full"
        style={{
          borderBottom: '1px solid rgba(157, 78, 221, 0.5)'
        }}
      >
        {(['google', 'email', 'phone'] as AuthMethod[]).map((method) => (
          <motion.button
            key={method}
            onClick={() => setAuthMethod(method)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              flex: 1,
              padding: 'var(--space-2)',
              fontFamily: 'var(--font-display)',
              textTransform: 'uppercase',
              fontSize: 'var(--font-size-sm)',
              background: 'none',
              border: 'none',
              borderBottom: authMethod === method ? '2px solid var(--color-magenta)' : 'none',
              color: authMethod === method ? 'var(--color-magenta)' : 'var(--color-text-muted)',
              cursor: 'pointer',
              transition: 'all var(--transition-base)'
            }}
          >
            {method}
          </motion.button>
        ))}
      </div>

      <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        Sign in to sync your databanks across all devices.
      </p>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            color: 'var(--color-red-light)',
            textAlign: 'center',
            fontSize: 'var(--font-size-sm)'
          }}
        >
          {error}
        </motion.p>
      )}

      {renderAuthMethod()}

      <div id="recaptcha-container"></div>
    </motion.div>
  );
};

export default Login;
