import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#05070b] text-white flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_60%)]" />

      <div className="relative z-10 text-center px-6">
        <div className="mb-6">
          <span className="text-8xl md:text-9xl font-bold bg-gradient-to-b from-white to-gray-600 bg-clip-text text-transparent">
            404
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-3">Page Not Found</h1>
        <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto mb-8">
          The page you are looking for does not exist or has been moved to a different location.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-md text-sm font-medium transition"
          >
            Go Home
          </Link>
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-md text-sm font-medium transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
