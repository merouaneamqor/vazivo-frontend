import { Calendar as HeroCalendar } from "@heroui/react";
import { today, getLocalTimeZone } from "@internationalized/date";

export function Calendar(props: any) {
  const { disabled, ...rest } = props;
  // Map function-based disabled (date => boolean) to HeroUI's isDateUnavailable;
  // do not forward disabled to the DOM (invalid on div, causes React warning).
  const isDateUnavailable =
    typeof disabled === "function"
      ? (date: { toDate: (tz: unknown) => Date }) => {
          const d = date.toDate(getLocalTimeZone());
          return disabled(d);
        }
      : undefined;

  return (
    <HeroCalendar
      aria-label="Calendar"
      value={today(getLocalTimeZone())}
      visibleMonths={1}
      {...rest}
      isDateUnavailable={isDateUnavailable ?? rest.isDateUnavailable}
    />
  );
}
