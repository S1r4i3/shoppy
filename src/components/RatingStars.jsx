export default function RatingStars({ rating }) {
  const full = Math.round(rating);
  return (
    <span className="rating" aria-label={`Rated ${rating} out of 5`}>
      <span className="rating__stars" aria-hidden="true">{'★'.repeat(full)}{'☆'.repeat(5 - full)}</span>
      <span className="rating__value">{rating.toFixed(1)}</span>
    </span>
  );
}
