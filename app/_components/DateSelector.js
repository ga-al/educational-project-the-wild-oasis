"use client";

import {
  differenceInDays,
  isPast,
  isSameDay,
  isWithinInterval,
} from "date-fns";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { getBookingPrice, resolveNumGuests } from "../_lib/bookingPrice";
import { useReservation } from "./ReservationContext";

function isAlreadyBooked(range, datesArr) {
  return (
    range?.from &&
    range?.to &&
    datesArr.some((date) =>
      isWithinInterval(date, { start: range.from, end: range.to }),
    )
  );
}

function DateSelector({ settings, cabin, bookedDates }) {
  const { range, setRange, resetRange, hasBreakfast, numGuests } =
    useReservation();

  const displayRange = isAlreadyBooked(range, bookedDates) ? {} : (range ?? {});

  const { minBookingLength, maxBookingLength, breakfastPrice } = settings;
  const { regularPrice, discount, maxCapacity } = cabin;

  const numNights = differenceInDays(displayRange.to, displayRange.from);
  const guests = resolveNumGuests(numGuests, maxCapacity);
  const { extrasPrice, totalPrice } = getBookingPrice({
    numNights,
    regularPrice,
    discount,
    breakfastPrice,
    numGuests: guests,
    hasBreakfast,
  });
  const hasStay = numNights > 0;

  return (
    <div className="flex flex-col justify-between">
      <DayPicker
        className="pt-12 place-self-center"
        mode="range"
        onSelect={(selected) =>
          setRange(selected ?? { from: undefined, to: undefined })
        }
        selected={displayRange}
        min={minBookingLength + 1}
        max={maxBookingLength}
        fromMonth={new Date()}
        fromDate={new Date()}
        toYear={new Date().getFullYear() + 5}
        captionLayout="dropdown"
        numberOfMonths={2}
        disabled={(curDate) =>
          isPast(curDate) ||
          bookedDates.some((date) => isSameDay(date, curDate))
        }
      />

      <div className="flex items-center justify-between gap-4 px-8 bg-accent-500 text-primary-800 min-h-[72px] py-3">
        <div className="flex items-baseline gap-6 flex-wrap">
          <p className="flex gap-2 items-baseline">
            {discount > 0 ? (
              <>
                <span className="text-2xl">${regularPrice - discount}</span>
                <span className="line-through font-semibold text-primary-700">
                  ${regularPrice}
                </span>
              </>
            ) : (
              <span className="text-2xl">${regularPrice}</span>
            )}
            <span className="">/night</span>
          </p>
          {hasStay ? (
            <>
              <p className="bg-accent-600 px-3 py-2 text-2xl">
                <span>&times;</span> <span>{numNights}</span>
              </p>
              {hasBreakfast ? (
                <p className="text-base font-semibold leading-none">
                  +${extrasPrice}{" "}
                  <span className="text-sm font-medium uppercase">
                    breakfast
                  </span>
                </p>
              ) : null}
              <p>
                <span className="text-lg font-bold uppercase">Total</span>{" "}
                <span className="text-2xl font-semibold">${totalPrice}</span>
              </p>
            </>
          ) : null}
        </div>

        {range?.from || range?.to ? (
          <button
            className="border border-primary-800 py-2 px-4 text-sm font-semibold"
            onClick={resetRange}
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default DateSelector;
