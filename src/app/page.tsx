import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          LyricalGenius
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          A platform for discovering and managing aesthetic video assets for your creative projects.
        </p>
        <div className="space-y-4">
          <Link
            href="/aesthetics"
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Browse Aesthetics
          </Link>
          <p className="text-sm text-gray-500">
            Search and save aesthetic video assets from Pinterest and Pexels
          </p>
        </div>
      </div>
    </main>
  );
}
