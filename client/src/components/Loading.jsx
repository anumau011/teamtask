import './Loading.css';

export default function Loading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Loading<span className="loading-dots"></span>
        </p>
      </div>
    </div>
  );
}
