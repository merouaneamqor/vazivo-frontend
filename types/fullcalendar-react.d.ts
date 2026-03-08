declare module "@fullcalendar/react" {
  import React, { Component } from "react";
  import type { CalendarOptions, CalendarApi } from "@fullcalendar/core";

  interface CalendarState {
    customRenderingMap: Map<string, any>;
  }

  declare class FullCalendar extends Component<CalendarOptions, CalendarState> {
    static act: (f: () => void) => void;
    getApi(): CalendarApi;
  }

  export default FullCalendar;
}
