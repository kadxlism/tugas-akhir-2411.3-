const TimelineLoading = () => {
  return (
    <div className="text-center py-12">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600">Loading timeline...</p>
    </div>
  );
};

export default TimelineLoading;

