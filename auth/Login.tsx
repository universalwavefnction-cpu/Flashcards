import React, { useState, useEffect } from 'react';
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

// Fix: Augment the Window interface to include recaptchaVerifier for phone auth.
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

  // Set up reCAPTCHA for phone auth
  useEffect(() => {
    if (authMethod === 'phone') {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
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
          <form onSubmit={handleEmailAuth} className="w-full flex flex-col gap-4">
             <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full p-3 bg-[#0a0e27]/80 border-2 border-[#00f3ff] rounded-md focus:outline-none focus:border-[#ff006e] focus:ring-2 focus:ring-[#ff006e] text-white"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              className="w-full p-3 bg-[#0a0e27]/80 border-2 border-[#00f3ff] rounded-md focus:outline-none focus:border-[#ff006e] focus:ring-2 focus:ring-[#ff006e] text-white"
            />
            <NeonButton type="submit" color="magenta" className="w-full">
              {isSignUp ? 'Sign Up' : 'Login'}
            </NeonButton>
            <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-[#00f3ff] hover:underline">
              {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </button>
          </form>
        );
      case 'phone':
        return (
            <div className="w-full flex flex-col gap-4">
            {!confirmationResult ? (
              <>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number with country code"
                  required
                  className="w-full p-3 bg-[#0a0e27]/80 border-2 border-[#00f3ff] rounded-md focus:outline-none focus:border-[#ff006e] focus:ring-2 focus:ring-[#ff006e] text-white"
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
                  className="w-full p-3 bg-[#0a0e27]/80 border-2 border-[#00f3ff] rounded-md focus:outline-none focus:border-[#ff006e] focus:ring-2 focus:ring-[#ff006e] text-white"
                />
                <NeonButton onClick={handleVerifyOtp} color="magenta" className="w-full">
                  Verify & Sign In
                </NeonButton>
              </>
            )}
          </div>
        );
      case 'google':
      default:
        return (
          <NeonButton onClick={handleGoogleSignIn} color="magenta" className="w-full">
            Sign in with Google
          </NeonButton>
        );
    }
  }

  return (
    <div className="p-6 border border-[#9d4edd] bg-[#1a1a2e]/50 backdrop-blur-sm shadow-lg shadow-[#9d4edd]/20 rounded-lg flex flex-col gap-6 items-center animate-fade-in w-full max-w-sm">
      <h2 className="font-orbitron text-3xl text-center text-[#9d4edd]">
        // SECURE LOGIN //
      </h2>
      <div className="flex w-full border-b border-[#9d4edd]/50">
        <button onClick={() => setAuthMethod('google')} className={`flex-1 p-2 font-orbitron uppercase transition-colors ${authMethod === 'google' ? 'text-[#ff006e] border-b-2 border-[#ff006e]' : 'text-gray-400'}`}>Google</button>
        <button onClick={() => setAuthMethod('email')} className={`flex-1 p-2 font-orbitron uppercase transition-colors ${authMethod === 'email' ? 'text-[#ff006e] border-b-2 border-[#ff006e]' : 'text-gray-400'}`}>Email</button>
        <button onClick={() => setAuthMethod('phone')} className={`flex-1 p-2 font-orbitron uppercase transition-colors ${authMethod === 'phone' ? 'text-[#ff006e] border-b-2 border-[#ff006e]' : 'text-gray-400'}`}>Phone</button>
      </div>

      <p className="text-center text-gray-300">
        Sign in to sync your databanks across all devices.
      </p>

      {error && <p className="text-red-400 text-center text-sm">{error}</p>}

      {renderAuthMethod()}
      
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default Login;
