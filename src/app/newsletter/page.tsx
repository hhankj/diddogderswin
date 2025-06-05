import Link from 'next/link';

export default function Newsletter() {
  return (
    <div className="min-h-screen bg-blue-600 text-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-4">
        <Link href="/" className="text-white hover:text-blue-200 transition-colors">
          Home
        </Link>
        <button className="text-white hover:text-blue-200 transition-colors">
          Newsletter
        </button>
      </nav>

      {/* Newsletter Content */}
      <div className="flex flex-col items-center justify-center text-center px-8 py-32">
        <h1 className="text-3xl md:text-4xl font-bold mb-12 leading-relaxed max-w-2xl">
          Want the latest updates Dodgers Home wins<br />
          for your next $6 Panda Express?
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <input
            type="email"
            placeholder="Email Address"
            className="px-6 py-3 rounded-lg text-gray-800 placeholder-gray-500 w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
} 