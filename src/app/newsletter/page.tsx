'use client';

import Link from 'next/link';
import { useState } from 'react';
import { subscribeToNewsletter } from '@/app/actions';

export default function Newsletter() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await subscribeToNewsletter(formData);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        // Reset form
        const form = document.querySelector('form') as HTMLFormElement;
        form?.reset();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center px-8 py-6 backdrop-blur-sm bg-white/5 border-b border-white/10">
        <Link href="/" className="text-white hover:text-blue-300 transition-colors duration-300 font-medium tracking-wide">
          Home
        </Link>
        <button className="text-white hover:text-blue-300 transition-colors duration-300 font-medium tracking-wide">
          Newsletter
        </button>
      </nav>

      {/* Newsletter Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-8 py-16 min-h-[calc(100vh-120px)]">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-wide">
              Never Miss Your <br /><span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">$6 Panda Express</span> Deal
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-red-500 mx-auto rounded-full"></div>
            <p className="text-xl md:text-2xl text-slate-300 font-light tracking-wide max-w-3xl mx-auto">
              Get instant alerts when the Dodgers win at home in LA<br />
              <span className="text-orange-400 font-medium">Save $6 on your Panda Express order!</span>
            </p>
          </div>
          
          {/* Deal Explanation */}
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-sm rounded-2xl p-6 border border-orange-400/20 max-w-3xl mx-auto">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="text-4xl">🐼</div>
              <div className="text-2xl font-bold text-orange-400">THE DEAL</div>
              <div className="text-4xl">⚾</div>
            </div>
            <p className="text-lg text-slate-200">
              When the <span className="text-blue-400 font-semibold">Dodgers win at home</span>, 
              get your Panda Express for <span className="text-orange-400 font-bold text-xl">$6</span>
            </p>
            <p className="text-sm text-slate-400 mt-2">Valid at participating LA locations</p>
          </div>
          
          {/* Subscription Form */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-2xl mx-auto">
            <div className="space-y-6">
              <div className="text-lg font-semibold text-orange-400 mb-4">
                🚨 Get notified instantly!
              </div>
              
              {/* Success/Error Messages */}
              {message && (
                <div className={`p-4 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-500/10 border border-green-400/20 text-green-400' 
                    : 'bg-red-500/10 border border-red-400/20 text-red-400'
                }`}>
                  {message.text}
                </div>
              )}
              
              <form action={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-center">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  required
                  disabled={isSubmitting}
                  className="px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 w-full sm:flex-1 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent backdrop-blur-sm transition-all duration-300 disabled:opacity-50"
                />
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap transform hover:scale-105 shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? 'Subscribing...' : 'Get Alerts'}
                </button>
              </form>
              
              <div className="text-sm text-slate-400 space-y-2">
                <p>🏠 Only when Dodgers win at home</p>
                <p>⚡ Instant notifications via email</p>
                <p>📱 Unsubscribe anytime</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
} 