export default function ProductCardSkeleton() {
  return (
    <div className="block animate-pulse">
      <div className="aspect-square bg-nl-gray rounded-xl mb-3" />
      <div className="h-4 bg-nl-gray rounded w-3/4 mb-2" />
      <div className="h-3 bg-nl-gray rounded w-1/2" />
    </div>
  );
}
