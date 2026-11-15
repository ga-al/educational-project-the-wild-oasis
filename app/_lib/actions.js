"use server";

import { differenceInDays } from "date-fns";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signIn, signOut } from "./auth";
import { getBookingPrice, resolveNumGuests } from "./bookingPrice";
import { getBookings, getCabin, getSettings } from "./data-service";
import { supabase } from "./supabase";

export async function updateGuest(formData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const nationalID = formData.get("nationalID");
  const [nationality, countryFlag] = formData.get("nationality").split("%");

  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID))
    throw new Error("Please provide a valid national ID");

  const updateData = { nationalID, nationality, countryFlag };

  const { error } = await supabase
    .from("guests")
    .update(updateData)
    .eq("id", session.user.guestId);

  if (error) throw new Error("Guest could not be updated");

  revalidatePath("/account/profile");
}

export async function createBooking(bookingData, formData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const startDate = bookingData.startDate;
  const endDate = bookingData.endDate;
  const numNights = differenceInDays(new Date(endDate), new Date(startDate));
  if (!numNights || numNights < 1)
    throw new Error("Please select valid dates");

  const [cabin, settings] = await Promise.all([
    getCabin(bookingData.cabinId),
    getSettings(),
  ]);

  const numGuests = resolveNumGuests(
    Number(formData.get("numGuests")),
    cabin.maxCapacity,
  );
  const hasBreakfast = formData.get("hasBreakfast") === "on";
  const { cabinPrice, extrasPrice, totalPrice } = getBookingPrice({
    numNights,
    regularPrice: cabin.regularPrice,
    discount: cabin.discount,
    breakfastPrice: settings.breakfastPrice,
    numGuests,
    hasBreakfast,
  });

  const newBooking = {
    startDate,
    endDate,
    numNights,
    cabinPrice,
    cabinId: bookingData.cabinId,
    guestId: session.user.guestId,
    numGuests,
    observations: formData.get("observations").slice(0, 1000),
    extrasPrice,
    totalPrice,
    isPaid: false,
    hasBreakfast,
    status: "unconfirmed",
  };

  const { error } = await supabase.from("bookings").insert([newBooking]);

  if (error) {
    console.error(error);
    throw new Error("Booking could not be created");
  }

  revalidatePath(`/cabins/${bookingData.cabinId}`);

  redirect("/cabins/thankyou");
}

export async function deleteBooking(bookingId) {
  // For testing
  // await new Promise((res) => setTimeout(res, 2000));
  // throw new Error();

  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingsIds = guestBookings.map((booking) => booking.id);

  if (!guestBookingsIds.includes(bookingId))
    throw new Error("You are not allowed to delete this bookings");

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) throw new Error("Booking could not be deleted");

  revalidatePath("/account/reservations");
}

export async function updateBooking(formData) {
  const bookingId = Number(formData.get("bookingId"));

  // 1. Authentication
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  // 2. Authorization
  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingsIds = guestBookings.map((booking) => booking.id);

  if (!guestBookingsIds.includes(bookingId))
    throw new Error("You are not allowed to delete this bookings");

  // 3. Building update data
  const numGuests = Number(formData.get("numGuests"));
  const observations = formData.get("observations").slice(0, 1000);

  const updatedData = { numGuests, observations };

  // 4. Mutation
  const { error } = await supabase
    .from("bookings")
    .update(updatedData)
    .eq("id", bookingId);

  // 5. Error handling
  if (error) {
    throw new Error("Booking could not be updated");
  }

  // 6. Revalidation
  revalidatePath(`/account/reservations/edit/${bookingId}`);
  revalidatePath("/account/reservations");

  // 7. Redirecting
  redirect("/account/reservations");
}

export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
