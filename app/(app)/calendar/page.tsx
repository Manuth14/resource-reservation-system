import { requireUser } from "@/lib/auth";
import { isDateString, todayString } from "@/lib/datetime";
import { getDayTimetable } from "@/services/calendar.service";
import DayTimetable from "@/components/calendar/DayTimetable";

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  await requireUser();
  const { date: d } = await searchParams;
  const date = isDateString(d) ? d : todayString();
  const { rows, now } = await getDayTimetable(date);
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-6 font-display text-3xl font-bold tracking-tight">Calendar</h1>
      <DayTimetable rows={rows} now={now} date={date} basePath="/calendar" linkNames />
    </div>
  );
}
