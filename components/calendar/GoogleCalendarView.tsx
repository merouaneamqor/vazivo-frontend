"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import resourcePlugin from "@fullcalendar/resource";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";

import type { DatesSetArg, EventClickArg, EventContentArg, DateSelectArg, EventDropArg } from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";
import { format, startOfMonth, endOfMonth, parseISO, addMinutes } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight, Plus, Users, Clock, SlidersHorizontal, X, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import { useAuth } from "@/hooks/useAuth";
import { useSelectedCalendarStaffId, useSetSelectedCalendarStaffId } from "@/store/auth";
import { useProviderBusiness } from "@/context/ProviderBusinessContext";
import { useBusinessServices } from "@/hooks/useBusinessServices";
import { useConfirmBooking, useCancelBooking, useCompleteBooking, useCreateBooking, useUpdateBooking } from "@/hooks/useBookings";
import { StatusBadge } from "@/components/ui/badge";
import { formatPrice, formatTime } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import toast from "react-hot-toast";
import type { Business, Booking, Service, StaffMember, CalendarEvent } from "@/types";
import { BookingDetailDrawer } from "./BookingDetailDrawer";
import { CalendarStaffFilter, STAFF_COLORS } from "./CalendarStaffFilter";
import { CreateBookingDrawer } from "./CreateBookingDrawer";
import { MiniCalendar } from "./MiniCalendar";

interface GoogleCalendarViewProps {
  businessId?: number;
}

export function GoogleCalendarView({ businessId }: GoogleCalendarViewProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { businesses, activeBusinessId: selectedBusinessId, selectedBusiness } = useProviderBusiness();
  const calendarRef = useRef<FullCalendar>(null);
  const t = useTranslations("calendar");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  // View state - tablet first (agenda on md), day on small mobile, week on desktop
  const [view, setView] = useState<"timeGridDay" | "timeGrid3Day" | "timeGridWeek" | "dayGridMonth" | "listWeek" | "staff">(() => {
    if (typeof window === "undefined") return "timeGridWeek";
    const w = window.innerWidth;
    if (w < 640) return "timeGridDay";   // mobile: day view
    if (w < 1024) return "listWeek";      // tablet: agenda first
    return "timeGridWeek";                 // desktop: week
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCancelled, setShowCancelled] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);
  const [showPending, setShowPending] = useState(true);
  const [showConfirmed, setShowConfirmed] = useState(true);

  // Drawer states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [createSlot, setCreateSlot] = useState<{ date: Date; startTime: string; endTime?: string } | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [pendingDrawerOpen, setPendingDrawerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [staffSubView, setStaffSubView] = useState<"resourceTimeGridDay" | "resourceTimeGridWeek">("resourceTimeGridDay");

  // Date range for queries
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return { start, end };
  });

  const { data: staffData } = useQuery({
    queryKey: queryKeys.businesses.staff(selectedBusinessId!),
    queryFn: () => api.getBusinessStaff(selectedBusinessId!),
    enabled: !!selectedBusinessId,
  });
  const staffMembers: StaffMember[] = staffData?.staff ?? [];

  const isOwnerOfSelectedBusiness = staffMembers.find((s) => s.id === user?.id)?.role === "owner";
  const selectedCalendarStaffId = useSelectedCalendarStaffId();
  const setSelectedCalendarStaffId = useSetSelectedCalendarStaffId();
  const effectiveSelectedStaffIds = useMemo(
    () => (isOwnerOfSelectedBusiness && selectedCalendarStaffId != null ? [selectedCalendarStaffId] : []),
    [isOwnerOfSelectedBusiness, selectedCalendarStaffId]
  );

  useEffect(() => {
    if (!isOwnerOfSelectedBusiness && selectedCalendarStaffId != null) {
      setSelectedCalendarStaffId(null);
    }
  }, [isOwnerOfSelectedBusiness, selectedCalendarStaffId, setSelectedCalendarStaffId]);

  const startStr = format(dateRange.start, "yyyy-MM-dd");
  const endStr = format(dateRange.end, "yyyy-MM-dd");

  const { data: calendarData, isLoading: calendarLoading } = useQuery({
    queryKey: queryKeys.provider.calendar({
      business_id: selectedBusinessId!,
      user_id: effectiveSelectedStaffIds.length === 1 ? effectiveSelectedStaffIds[0] : undefined,
      start_date: startStr,
      end_date: endStr,
    }),
    queryFn: () =>
      api.getProviderCalendar({
        business_id: selectedBusinessId!,
        user_id: effectiveSelectedStaffIds.length === 1 ? effectiveSelectedStaffIds[0] : undefined,
        start_date: startStr,
        end_date: endStr,
      }),
    enabled: !!selectedBusinessId,
    staleTime: 30 * 1000,
  });

  const calendarEvents: CalendarEvent[] = calendarData?.events ?? [];

  const { data: businessDetail } = useQuery({
    queryKey: queryKeys.businesses.detail(selectedBusinessId!),
    queryFn: () => api.getBusinessById(selectedBusinessId!),
    enabled: !!selectedBusinessId,
  });

  // Fetch services using custom hook
  const { data: servicesData } = useBusinessServices(selectedBusinessId);

  const businessWithServices = businessDetail?.business
    ? { ...businessDetail.business, services: servicesData?.services ?? businessDetail.business.services ?? [] }
    : selectedBusiness;

  // Fetch pending bookings
  const { data: pendingBookingsData } = useQuery({
    queryKey: queryKeys.provider.bookings({
      business_id: selectedBusinessId,
      status: "pending",
    }),
    queryFn: () =>
      api.getProviderBookings({
        business_id: selectedBusinessId!,
        status: "pending",
      }),
    enabled: !!selectedBusinessId,
  });

  const pendingBookings: Booking[] = (() => {
    const raw = pendingBookingsData as
      | Booking[]
      | { bookings: Booking[] | { bookings: Booking[] }; meta?: unknown }
      | undefined;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "object" && "bookings" in raw) {
      const b = raw.bookings;
      return Array.isArray(b) ? b : Array.isArray(b?.bookings) ? b.bookings : [];
    }
    return [];
  })();

  // Mutations
  const confirmBooking = useConfirmBooking();
  const cancelBooking = useCancelBooking();
  const completeBooking = useCompleteBooking();
  const createBooking = useCreateBooking();
  const updateBooking = useUpdateBooking();

  const invalidateCalendar = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["provider", "calendar"] });
    queryClient.invalidateQueries({ queryKey: ["provider", "bookings"] });
  }, [queryClient]);

  // Transform events for FullCalendar
  const fullCalendarEvents = useMemo(() => {
    return calendarEvents
      .filter((event) => {
        if (!showCancelled && event.status === "cancelled") return false;
        if (!showCompleted && event.status === "completed") return false;
        if (!showPending && event.status === "pending") return false;
        if (!showConfirmed && event.status === "confirmed") return false;
        if (view !== "staff" && effectiveSelectedStaffIds.length > 0 && event.staff_id && !effectiveSelectedStaffIds.includes(event.staff_id)) return false;
        return true;
      })
      .map((event) => {
        const staffIndex = staffMembers.findIndex((s) => s.id === event.staff_id);
        const staffColor = staffIndex >= 0 ? STAFF_COLORS[staffIndex % STAFF_COLORS.length] : "#8b5cf6";

        const dateStr = event.start.split("T")[0];
        const startTimeStr = event.start.split("T")[1]?.slice(0, 5) || "00:00";
        const endTimeStr = event.end_time?.split("T")[1]?.slice(0, 5);

        const start = parseISO(`${dateStr}T${startTimeStr}`);
        const end = endTimeStr ? parseISO(`${dateStr}T${endTimeStr}`) : addMinutes(start, event.service_duration || 60);

        return {
          id: String(event.id),
          title: event.service_name,
          start: start.toISOString(),
          end: end.toISOString(),
          ...(event.staff_id != null && { resourceId: String(event.staff_id) }),
          backgroundColor: staffColor,
          borderColor: staffColor,
          editable: event.status !== "cancelled" && event.status !== "completed",
          extendedProps: {
            event,
            customerName: event.customer_name,
            staffName: event.staff_name,
            status: event.status,
            staffColor,
          },
        };
      });
  }, [calendarEvents, staffMembers, effectiveSelectedStaffIds, view, showCancelled, showCompleted, showPending, showConfirmed]);

  // Resources for staff view (one column per staff)
  const staffResources = useMemo(
    () => staffMembers.map((s) => ({ id: String(s.id), title: s.name })),
    [staffMembers]
  );

  // Event handlers
  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    setDateRange({ start: arg.start, end: arg.end });
    setCurrentDate(arg.start);
  }, []);

  const handleEventClick = useCallback((arg: EventClickArg) => {
    const event = arg.event.extendedProps.event as CalendarEvent;
    if (event) {
      const bookingLike: Booking = {
        id: event.id,
        date: event.start.split("T")[0],
        start_time: event.start.split("T")[1]?.slice(0, 5) || "",
        end_time: event.end_time?.split("T")[1]?.slice(0, 5) || "",
        status: event.status as Booking["status"],
        total_price: event.total_price,
        notes: event.notes,
        duration_minutes: event.service_duration,
        can_cancel: event.status === "pending" || event.status === "confirmed",
        can_confirm: event.status === "pending",
        can_complete: event.status === "confirmed",
        service_id: event.service_id,
        service_name: event.service_name,
        business_id: selectedBusinessId!,
        business_name: selectedBusiness?.name ?? "",
        customer_name: event.customer_name,
        customer_phone: event.customer_phone,
        customer_email: event.customer_email,
        staff_id: event.staff_id,
        staff: event.staff_name ? { id: event.staff_id!, name: event.staff_name, email: "" } : undefined,
        created_at: event.created_at,
      };
      setSelectedBooking(bookingLike);
      setDetailDrawerOpen(true);
    }
  }, [selectedBusinessId, selectedBusiness?.name]);

  const handleSelect = useCallback((arg: DateSelectArg) => {
    const now = new Date();
    if (arg.start < now && !arg.allDay) return;

    const startTime = format(arg.start, "HH:mm");
    const endTime = format(arg.end, "HH:mm");
    setCreateSlot({ date: arg.start, startTime, endTime });
    setCreateDrawerOpen(true);
  }, []);

  const handleDateClick = useCallback((arg: DateClickArg) => {
    const now = new Date();
    if (arg.date < now) return;

    const slotDuration = 30; // minutes
    const startTime = format(arg.date, "HH:mm");
    const endDate = addMinutes(arg.date, slotDuration);
    const endTime = format(endDate, "HH:mm");
    setCreateSlot({ date: arg.date, startTime, endTime });
    setCreateDrawerOpen(true);
  }, []);

  const handleEventDrop = useCallback(
    (arg: EventDropArg) => {
      const bookingId = Number(arg.event.id);
      if (!Number.isInteger(bookingId)) {
        arg.revert();
        return;
      }
      const start = arg.event.start;
      if (!start) {
        arg.revert();
        return;
      }
      const date = format(start, "yyyy-MM-dd");
      const start_time = format(start, "HH:mm");
      updateBooking.mutate(
        { id: bookingId, date, start_time, skip_availability_check: true },
        { onError: () => arg.revert() }
      );
    },
    [updateBooking]
  );

  const handleEventResize = useCallback(
    (arg: any) => {
      const bookingId = Number(arg.event.id);
      if (!Number.isInteger(bookingId) || !arg.event.start || !arg.event.end) {
        arg.revert();
        return;
      }
      const date = format(arg.event.start, "yyyy-MM-dd");
      const start_time = format(arg.event.start, "HH:mm");
      updateBooking.mutate(
        { id: bookingId, date, start_time, skip_availability_check: true },
        { onError: () => arg.revert() }
      );
    },
    [updateBooking]
  );

  const eventContent = useCallback((arg: EventContentArg) => {
    const { customerName, staffName, status, staffColor } = arg.event.extendedProps;
    const isListView = arg.view.type.includes("list");

    if (isListView) {
      return (
        <div className="flex items-center gap-2 py-1">
          <div className="w-1 h-8 rounded-full" style={{ backgroundColor: staffColor }} />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{arg.event.title}</p>
            {customerName && <p className="text-xs text-neutral-600 truncate">{customerName}</p>}
            {staffName && <p className="text-xs text-neutral-500">{staffName}</p>}
          </div>
          <StatusBadge status={status} />
        </div>
      );
    }

    return (
      <div className="h-full w-full px-1.5 py-1 overflow-hidden">
        <div className="flex flex-col h-full text-white">
          <p className="font-semibold text-xs truncate">{arg.timeText}</p>
          <p className="font-medium text-xs truncate">{arg.event.title}</p>
          {customerName && <p className="text-[10px] opacity-90 truncate">{customerName}</p>}
        </div>
      </div>
    );
  }, []);

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    calendarRef.current?.getApi().gotoDate(today);
  };

  const handlePrev = () => {
    calendarRef.current?.getApi().prev();
  };

  const handleNext = () => {
    calendarRef.current?.getApi().next();
  };

  const getDateLabel = () => {
    if (view === "staff" && staffSubView === "resourceTimeGridDay") return format(currentDate, "MMMM d, yyyy");
    if (view === "timeGridDay") return format(currentDate, "MMMM d, yyyy");
    return format(currentDate, "MMMM yyyy");
  };

  if (!selectedBusinessId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-neutral-500">{t("selectBusiness")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white">
      {/* Top Navigation - mobile / tablet / desktop */}
      <div className="border-b border-neutral-200 bg-white shadow-sm flex-shrink-0 min-w-0">
        <div className="flex flex-col gap-2 sm:gap-3 px-2 sm:px-4 lg:px-6 py-2 sm:py-3">
          {/* Row 1: Date navigation */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <div className="p-1 sm:p-1.5 bg-primary-50 rounded-lg shrink-0">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="hidden lg:flex h-8 w-8 p-0 shrink-0"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
              >
                {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
            <div className="h-5 sm:h-6 w-px bg-neutral-200 hidden sm:block shrink-0" aria-hidden />
            <div className="flex items-center gap-0.5 shrink-0">
              <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-8 sm:w-8 touch-manipulation" onClick={handlePrev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-8 sm:w-8 touch-manipulation" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={handleToday} className="shrink-0 text-xs h-9 sm:h-8 px-2 sm:px-3 touch-manipulation">
              {t("today")}
            </Button>
            <h2 className="text-xs sm:text-sm lg:text-base font-medium text-neutral-700 min-w-0 truncate ml-0.5 sm:ml-1">
              {getDateLabel()}
            </h2>
          </div>

          {/* Row 2: View selectors (Week, Month, Agenda) + Filters (Pending, All staff) */}
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 min-w-0">
            {/* View switcher: scroll on mobile, normal on tablet/PC */}
            <div className="min-w-0 overflow-x-auto overflow-y-hidden scrollbar-hide -mx-1 px-1 md:overflow-visible md:mx-0 md:px-0">
              <div className="flex items-center gap-0.5 sm:gap-1 bg-neutral-100 rounded-lg p-0.5 sm:p-1 w-max">
                <Button
                  variant={view === "timeGridWeek" ? "default" : "ghost"}
                  size="sm"
                  className="h-9 sm:h-8 text-xs px-2 sm:px-3 min-w-[2.25rem] sm:min-w-0 touch-manipulation"
                  onClick={() => setView("timeGridWeek")}
                >
                  {t("week")}
                </Button>
                <Button
                  variant={view === "dayGridMonth" ? "default" : "ghost"}
                  size="sm"
                  className="h-9 sm:h-8 text-xs px-2 sm:px-3 min-w-[2.25rem] sm:min-w-0 touch-manipulation"
                  onClick={() => setView("dayGridMonth")}
                >
                  {t("month")}
                </Button>
                <Button
                  variant={view === "listWeek" ? "default" : "ghost"}
                  size="sm"
                  className="h-9 sm:h-8 text-xs px-2 sm:px-3 min-w-[2.25rem] sm:min-w-0 touch-manipulation"
                  onClick={() => setView("listWeek")}
                >
                  {t("agenda")}
                </Button>
                {staffMembers.length > 1 && (
                  <Button
                    variant={view === "staff" ? "default" : "ghost"}
                    size="sm"
                    className="h-9 sm:h-8 text-xs px-2 sm:px-3 touch-manipulation"
                    onClick={() => setView("staff")}
                  >
                    <Users className="h-3.5 w-3.5 sm:mr-1" />
                    <span className="hidden sm:inline">Staff</span>
                  </Button>
                )}
                {view === "staff" && (
                  <>
                    <div className="w-px h-5 bg-neutral-300 mx-0.5 shrink-0" aria-hidden />
                    <Button
                      variant={staffSubView === "resourceTimeGridDay" ? "default" : "ghost"}
                      size="sm"
                      className="h-9 sm:h-8 text-xs shrink-0 touch-manipulation"
                      onClick={() => {
                        setStaffSubView("resourceTimeGridDay");
                        calendarRef.current?.getApi().changeView("resourceTimeGridDay");
                      }}
                    >
                      {t("day")}
                    </Button>
                    <Button
                      variant={staffSubView === "resourceTimeGridWeek" ? "default" : "ghost"}
                      size="sm"
                      className="h-9 sm:h-8 text-xs shrink-0 touch-manipulation"
                      onClick={() => {
                        setStaffSubView("resourceTimeGridWeek");
                        calendarRef.current?.getApi().changeView("resourceTimeGridWeek");
                      }}
                    >
                      {t("week")}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Filters: Pending + All staff (right-aligned) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <div className="h-5 sm:h-6 w-px bg-neutral-200 hidden sm:block" aria-hidden />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPendingDrawerOpen(true)}
                className="relative h-9 w-9 sm:h-8 sm:w-auto sm:min-h-8 sm:px-3 p-0 sm:py-2 touch-manipulation"
              >
                <CheckCircle className="h-4 w-4 sm:h-3.5 sm:w-3.5 sm:mr-2" />
                <span className="hidden sm:inline text-xs sm:text-sm">{t("pending")}</span>
                {pendingBookings.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:top-[-2px] sm:right-[-2px] h-4 w-4 sm:h-5 sm:w-5 bg-amber-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center">
                    {pendingBookings.length}
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden h-9 w-9 sm:h-8 sm:w-8 p-0 touch-manipulation"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
              </Button>
              {isOwnerOfSelectedBusiness && staffMembers.length > 0 ? (
                <div className="hidden lg:block">
                  <CalendarStaffFilter
                    staffMembers={staffMembers}
                    selectedStaffId={selectedCalendarStaffId}
                    onChange={setSelectedCalendarStaffId}
                    variant="dropdown"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="hidden lg:flex w-64 border-r border-neutral-200 bg-neutral-50 flex-col overflow-y-auto">
            <div className="p-4 space-y-6">
            {/* Mini Calendar */}
            <MiniCalendar
              selectedDate={currentDate}
              onDateSelect={(date) => {
                setCurrentDate(date);
                calendarRef.current?.getApi().gotoDate(date);
              }}
            />
          </div>
        </aside>
        )}

        {/* Calendar */}
        <main className="flex-1 overflow-auto bg-white ">
          {/* Tablet & mobile view selector: Agenda first (Day, Agenda, 3d, Month) */}
          <div className="lg:hidden mb-3 flex items-center gap-1 bg-neutral-100 rounded-xl p-1.5">
            <Button
              variant={view === "timeGridDay" ? "default" : "ghost"}
              size="sm"
              className="h-10 min-w-[4rem] text-xs flex-1 sm:flex-none"
              onClick={() => setView("timeGridDay")}
            >
              {t("day")}
            </Button>
            <Button
              variant={view === "listWeek" ? "default" : "ghost"}
              size="sm"
              className="h-10 min-w-[4rem] text-xs flex-1 sm:flex-none"
              onClick={() => setView("listWeek")}
            >
              {t("agenda")}
            </Button>
            <Button
              variant={view === "timeGrid3Day" ? "default" : "ghost"}
              size="sm"
              className="h-10 min-w-[3rem] text-xs flex-1 sm:flex-none"
              onClick={() => setView("timeGrid3Day")}
            >
              3d
            </Button>
            <Button
              variant={view === "dayGridMonth" ? "default" : "ghost"}
              size="sm"
              className="h-10 min-w-[4rem] text-xs flex-1 sm:flex-none"
              onClick={() => setView("dayGridMonth")}
            >
              {t("month")}
            </Button>
          </div>

          {view === "staff" ? (
            <div className="google-calendar-view h-full">
              <FullCalendar
                ref={calendarRef}
                plugins={[resourcePlugin, resourceTimeGridPlugin, interactionPlugin]}
                initialView={staffSubView}
                initialDate={currentDate}
                key="staff"
                headerToolbar={false}
                firstDay={1}
                resources={staffResources}
                events={fullCalendarEvents}
                datesSet={handleDatesSet}
                eventClick={handleEventClick}
                dateClick={handleDateClick}
                select={handleSelect}
                eventDrop={handleEventDrop}
                eventResize={handleEventResize}
                selectable
                editable
                eventResizableFromStart
                selectMinDistance={5}
                eventContent={eventContent}
                height="100%"
                slotMinTime="06:00:00"
                slotMaxTime="22:00:00"
                scrollTime={format(new Date(), "HH:00:00")}
                nowIndicator
                allDaySlot={false}
                slotDuration="00:30:00"
                slotLabelInterval="01:00:00"
                snapDuration="00:15:00"
                slotLabelFormat={{ hour: "numeric", minute: "2-digit", hour12: false }}
                eventOverlap
                eventMinHeight={30}
              />
            </div>
          ) : (
            <div className="google-calendar-view">
              <FullCalendar
                ref={calendarRef}
                plugins={[interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin]}
                initialView={view}
                key={view}
                headerToolbar={false}
                firstDay={1}
                locale={undefined}
                views={{
                  timeGrid3Day: {
                    type: 'timeGrid',
                    duration: { days: 3 },
                    buttonText: '3 days'
                  },
                  listWeek: {
                    buttonText: t("agenda")
                  }
                }}
                buttonText={{
                  today: t("today"),
                  day: t("day"),
                  week: t("week"),
                  month: t("month"),
                  list: t("agenda"),
                }}
                events={fullCalendarEvents}
                datesSet={handleDatesSet}
                eventClick={handleEventClick}
                dateClick={handleDateClick}
                select={handleSelect}
                eventDrop={handleEventDrop}
                eventResize={handleEventResize}
                selectable
                editable
                eventResizableFromStart
                selectMinDistance={5}
                eventContent={eventContent}
                height="100%"
                slotMinTime="06:00:00"
                slotMaxTime="22:00:00"
                scrollTime={format(new Date(), "HH:00:00")}
                nowIndicator
                allDaySlot={false}
                slotDuration="00:30:00"
                slotLabelInterval="01:00:00"
                snapDuration="00:15:00"
                dayHeaderFormat={{ weekday: "short", month: "numeric", day: "numeric" }}
                slotLabelFormat={{ hour: "numeric", minute: "2-digit", hour12: false }}
                eventOverlap
                loading={(isLoading) => calendarLoading}
                dayMaxEvents={3}
                moreLinkClick="popover"
                eventMinHeight={30}
                eventShortHeight={25}
                expandRows={false}
              />
            </div>
          )}
        </main>
      </div>

      {/* Pending Bookings Drawer */}
      <Sheet open={pendingDrawerOpen} onOpenChange={setPendingDrawerOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-amber-500" />
              {t("pendingBookings")}
              {pendingBookings.length > 0 && (
                <span className="text-sm font-normal text-neutral-500">
                  ({pendingBookings.length})
                </span>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6">
            {pendingBookings.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-center">
                <div>
                  <CheckCircle className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-sm text-neutral-500">{t("noPendingBookings")}</p>
                </div>
              </div>
            ) : (
              <ul className="space-y-3">
                {pendingBookings.map((booking) => (
                  <li
                    key={booking.id}
                    className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 space-y-3"
                  >
                    <div>
                      <p className="font-semibold text-neutral-900">
                        {booking.service_name}
                      </p>
                      <p className="text-sm text-neutral-600 mt-1">
                        {booking.customer_name || booking.user?.name || t("customer")}
                      </p>
                      {booking.customer_phone && (
                        <p className="text-sm text-neutral-500">{booking.customer_phone}</p>
                      )}
                      <p className="text-sm text-neutral-500 mt-1">
                        {format(parseISO(booking.date), "MMM d")} at {formatTime(booking.start_time)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          confirmBooking.mutate(booking.id, {
                            onSuccess: () => {
                              invalidateCalendar();
                              setPendingDrawerOpen(false);
                            },
                          });
                        }}
                        disabled={confirmBooking.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {t("confirm")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => {
                          cancelBooking.mutate(booking.id, {
                            onSuccess: () => {
                              invalidateCalendar();
                              setPendingDrawerOpen(false);
                            },
                          });
                        }}
                        disabled={cancelBooking.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        {t("cancel")}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Filters Drawer */}
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="left" className="w-64">
          <SheetHeader>
            <SheetTitle>{t("filters")}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            {isOwnerOfSelectedBusiness && staffMembers.length > 0 ? (
              <CalendarStaffFilter
                staffMembers={staffMembers}
                selectedStaffId={selectedCalendarStaffId}
                onChange={setSelectedCalendarStaffId}
                variant="drawer-list"
                staffColors={STAFF_COLORS}
              />
            ) : null}
            <div>
              <h3 className="text-sm font-semibold mb-3">{t("show")}</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <Checkbox checked={showPending} onCheckedChange={setShowPending} />
                  <span className="text-sm">{t("statusPending")}</span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox checked={showConfirmed} onCheckedChange={setShowConfirmed} />
                  <span className="text-sm">{t("statusConfirmed")}</span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox checked={showCompleted} onCheckedChange={setShowCompleted} />
                  <span className="text-sm">{t("statusCompleted")}</span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox checked={showCancelled} onCheckedChange={setShowCancelled} />
                  <span className="text-sm">{t("statusCancelled")}</span>
                </label>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Booking Detail Drawer */}
      <BookingDetailDrawer
        open={detailDrawerOpen}
        onOpenChange={setDetailDrawerOpen}
        booking={selectedBooking}
        onConfirm={(id) => {
          confirmBooking.mutate(id, {
            onSuccess: () => {
              invalidateCalendar();
              setDetailDrawerOpen(false);
              setSelectedBooking(null);
            },
          });
        }}
        onCancel={(id) => {
          cancelBooking.mutate(id, {
            onSuccess: () => {
              invalidateCalendar();
              setDetailDrawerOpen(false);
              setSelectedBooking(null);
            },
          });
        }}
        onComplete={(id) => {
          completeBooking.mutate(id, {
            onSuccess: () => {
              invalidateCalendar();
              setDetailDrawerOpen(false);
              setSelectedBooking(null);
            },
          });
        }}
        isLoading={confirmBooking.isPending || cancelBooking.isPending || completeBooking.isPending}
      />

      {/* Create Booking Drawer */}
      <CreateBookingDrawer
        open={createDrawerOpen}
        onOpenChange={setCreateDrawerOpen}
        createSlot={createSlot}
        business={businessWithServices}
        staffMembers={staffMembers}
        onSubmit={(data) => {
          createBooking.mutate(data, {
            onSuccess: () => {
              invalidateCalendar();
              setCreateDrawerOpen(false);
              setCreateSlot(null);
            },
            onError: (err: any) => {
              const errorMsg = err.message || err.errors?.[0] || "";
              const isClosedError = errorMsg.includes("closed") || errorMsg.includes("outside business hours");
              if (isClosedError) {
                if (confirm(t("businessClosedConfirm"))) {
                  createBooking.mutate(
                    { ...data, skip_business_hours_check: true },
                    {
                      onSuccess: () => {
                        invalidateCalendar();
                        setCreateDrawerOpen(false);
                        setCreateSlot(null);
                      },
                      onError: (e: any) => toast.error(e.message || t("createBookingError")),
                    }
                  );
                }
              } else {
                toast.error(errorMsg || t("createBookingError"));
              }
            },
          });
        }}
        isSubmitting={createBooking.isPending}
      />
    </div>
  );
}
