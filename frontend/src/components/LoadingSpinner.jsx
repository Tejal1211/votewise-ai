const LoadingSpinner = () => (
  <div className="min-h-screen mesh-bg flex items-center justify-center" role="status" aria-label="Loading">
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-primary-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-primary-700 font-medium animate-pulse">Loading VoteWise AI...</p>
    </div>
  </div>
);

export default LoadingSpinner;
