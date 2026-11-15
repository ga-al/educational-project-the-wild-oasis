export function resolveNumGuests(numGuests, maxCapacity) {
  const guests = Number(numGuests);
  if (Number.isInteger(guests) && guests >= 1 && guests <= maxCapacity) {
    return guests;
  }
  return maxCapacity;
}

export function getBookingPrice({
  numNights,
  regularPrice,
  discount,
  breakfastPrice,
  numGuests,
  hasBreakfast,
}) {
  const nights = Number.isFinite(numNights) && numNights > 0 ? numNights : 0;
  const guests = Number(numGuests) || 0;
  const cabinPrice = nights * (Number(regularPrice) - Number(discount));
  const extrasPrice = hasBreakfast
    ? nights * Number(breakfastPrice) * guests
    : 0;

  return {
    numNights: nights,
    cabinPrice,
    extrasPrice,
    totalPrice: cabinPrice + extrasPrice,
  };
}
