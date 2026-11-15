"use client";

import { differenceInDays } from "date-fns";
import { createBooking } from "../_lib/actions";
import { getBookingPrice, resolveNumGuests } from "../_lib/bookingPrice";
import { useReservation } from "./ReservationContext";
import SubmitButton from "./SubmitButton";

function ReservationForm({ cabin, user, settings }) {
  const {
    range,
    resetRange,
    hasBreakfast,
    setHasBreakfast,
    numGuests,
    setNumGuests,
  } = useReservation();

  const { maxCapacity, regularPrice, discount, id } = cabin;
  const { breakfastPrice } = settings;

  const startDate = range?.from;
  const endDate = range?.to;
  const guests = resolveNumGuests(numGuests, maxCapacity);

  const numNights = differenceInDays(endDate, startDate);
  const { cabinPrice, extrasPrice, totalPrice } = getBookingPrice({
    numNights,
    regularPrice,
    discount,
    breakfastPrice,
    numGuests: guests,
    hasBreakfast,
  });

  const bookingData = {
    startDate,
    endDate,
    numNights,
    cabinPrice,
    extrasPrice,
    totalPrice,
    hasBreakfast,
    cabinId: id,
  };

  const createBookingWithData = createBooking.bind(null, bookingData);

  return (
    <div className="scale-[1.01]">
      <div className="bg-primary-800 text-primary-300 px-16 py-2 flex justify-between items-center">
        <p>Logged in as</p>

        <div className="flex gap-4 items-center">
          <img
            // Important to display google profile images
            referrerPolicy="no-referrer"
            className="h-8 rounded-full"
            src={user.image}
            alt={user.name}
          />
          <p>{user.name}</p>
        </div>
      </div>

      <form
        // action={createBookingWithData}
        action={async (formData) => {
          await createBookingWithData(formData);
          resetRange();
        }}
        className="bg-primary-900 py-10 px-16 text-lg flex gap-5 flex-col"
      >
        <div className="space-y-2">
          <label htmlFor="numGuests">How many guests?</label>
          <select
            name="numGuests"
            id="numGuests"
            value={String(guests)}
            onChange={(e) => setNumGuests(Number(e.target.value))}
            className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
            required
          >
            <option value="" key="">
              Select number of guests...
            </option>
            {Array.from({ length: maxCapacity }, (_, i) => i + 1).map((x) => (
              <option value={String(x)} key={x}>
                {x} {x === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="observations">
            Anything we should know about your stay?
          </label>
          <textarea
            name="observations"
            id="observations"
            className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
            placeholder="Any pets, allergies, special requirements, etc.?"
          />
        </div>

        <div className="flex items-center gap-3 px-5 py-3 bg-primary-200 text-primary-800 shadow-sm rounded-sm">
          <input
            type="checkbox"
            name="hasBreakfast"
            id="hasBreakfast"
            checked={hasBreakfast}
            onChange={(e) => setHasBreakfast(e.target.checked)}
            className="h-5 w-5 shrink-0 accent-accent-500 cursor-pointer"
          />
          <label
            htmlFor="hasBreakfast"
            className="leading-none select-none cursor-pointer text-heading pt-1"
          >
            Order breakfast
          </label>
        </div>

        <div className="flex justify-end items-center gap-6">
          {!(startDate && endDate) ? (
            <p className="text-primary-300 text-base">
              Start by selecting dates
            </p>
          ) : (
            <SubmitButton pandingLabel="Reserving...">Reserve now</SubmitButton>
          )}
        </div>
      </form>
    </div>
  );
}

export default ReservationForm;
