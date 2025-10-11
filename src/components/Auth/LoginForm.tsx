import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { signInWithOTP, verifyOTP } from '../../lib/supabase';
import Logo from '../../assets/logo.png';
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

const LoginForm: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fullPhone = `+${phoneNumber}`;
    try {
      const { error } = await signInWithOTP(fullPhone);
      console.log(fullPhone)
      if (error) throw error;
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };
  

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fullPhone = `+${phoneNumber}`;
    try {
      const { error } = await verifyOTP(fullPhone, otp);
      if (error) throw error;
      // Navigation will be handled by the auth context
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center">
              {/* <span className="text-white font-bold text-xl">S</span> */}
              <img src={Logo} alt="Sparky AI Logo" className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-white">Sparky AI</h1>
          </div>
          <p className="text-zinc-400">Empowering farmers with AI-driven insights</p>
        </div>

        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <PhoneInput
                      country={'in'}
                      value={phoneNumber}
                      onChange={phone => setPhoneNumber(phone)}
                      placeholder="1234567890"
                      inputClass="!w-full !h-12 !pr-4 !py-3 !bg-zinc-800 !border !border-zinc-700 
                                  !rounded-lg !text-white !placeholder-zinc-500 
                                  focus:!outline-none focus:!ring-2 focus:!ring-green-500 
                                  focus:!border-transparent"
                      buttonClass="!bg-zinc-800 !border-zinc-700 !rounded-l-lg hover:!bg-zinc-700 focus:!bg-zinc-700"
                      containerClass="!w-full"
                      dropdownClass="custom-dropdown"
                      searchClass="!bg-zinc-800 !text-white !rounded-md focus:!ring-2 focus:!ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? 'Sending...' : 'Send OTP'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Enter OTP sent to  +{phoneNumber}
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg tracking-widest"
                  maxLength={6}
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-zinc-400 hover:text-white transition-colors"
              >
                Back to phone number
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-8 text-zinc-500 text-sm">
          By continuing, you agree to our{' '}
          <a href="#" className="text-green-500 hover:text-green-400">Terms of Service</a>{' '}
          and{' '}
          <a href="#" className="text-green-500 hover:text-green-400">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;