import { isBefore, isAfter } from 'date-fns';

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
}

/**
 * Verifica solapamientos en un calendario de amenidades.
 * Complejidad O(N) donde N son las reservas previas aprobadas del día.
 */
export const hasBookingOverlap = (
  newRequest: TimeSlot,
  approvedBookings: TimeSlot[]
): boolean => {
  if (!isBefore(newRequest.startTime, newRequest.endTime)) {
    throw new Error("El inicio debe ser previo a la finalización.");
  }

  return approvedBookings.some((booking) => {
    const startsBeforeExistingEnds = isBefore(newRequest.startTime, booking.endTime);
    const endsAfterExistingStarts = isAfter(newRequest.endTime, booking.startTime);
    
    return startsBeforeExistingEnds && endsAfterExistingStarts;
  });
};
