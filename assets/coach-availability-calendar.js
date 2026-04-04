(function initLegacyCoachAvailabilityCalendar() {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const MALAYSIA_OFFSET_MS = 8 * 60 * 60 * 1000;
  const DEFAULT_START_HOUR = 6;
  const DEFAULT_END_HOUR = 23;
  const DEFAULT_HOUR_SIZE = 52;
  const DEFAULT_LOOKAHEAD_DAYS = 28;
  const DAY_ORDER = [
    { key: "Mon", label: "Monday", dayOfWeek: 1 },
    { key: "Tue", label: "Tuesday", dayOfWeek: 2 },
    { key: "Wed", label: "Wednesday", dayOfWeek: 3 },
    { key: "Thu", label: "Thursday", dayOfWeek: 4 },
    { key: "Fri", label: "Friday", dayOfWeek: 5 },
    { key: "Sat", label: "Saturday", dayOfWeek: 6 },
    { key: "Sun", label: "Sunday", dayOfWeek: 0 },
  ];
  const RELATIVE_TIME_RANGES = {
    Morning: "8 AM - 12 PM",
    Afternoon: "12 PM - 5 PM",
    Evening: "6 PM - 10 PM",
  };
  const COACH_SCHEDULE_ACCENTS = {
    "Luke Lango": {
      color: "#ff8000",
      rgb: "255, 128, 0",
      ink: "#120800",
      alt: "#ffb347",
      altRgb: "255, 179, 71",
      spectrum: "#ffe4a3",
      spectrumRgb: "255, 228, 163",
    },
    Shobana: {
      color: "#f2e85a",
      rgb: "242, 232, 90",
      ink: "#111111",
      alt: "#ffd447",
      altRgb: "255, 212, 71",
      spectrum: "#fff7b0",
      spectrumRgb: "255, 247, 176",
    },
    "Kylie Denis": {
      color: "#06a899",
      rgb: "6, 168, 153",
      ink: "#f4fffc",
      alt: "#42d6cb",
      altRgb: "66, 214, 203",
      spectrum: "#88efff",
      spectrumRgb: "136, 239, 255",
    },
    "Jenita Jeune": {
      color: "#c020a0",
      rgb: "192, 32, 160",
      ink: "#fff0fb",
      alt: "#ee82ee",
      altRgb: "238, 130, 238",
      spectrum: "#a18fff",
      spectrumRgb: "161, 143, 255",
    },
    "Amree Ariff": {
      color: "#d4a64a",
      rgb: "212, 166, 74",
      ink: "#161006",
      alt: "#f0cf7c",
      altRgb: "240, 207, 124",
      spectrum: "#ffe8af",
      spectrumRgb: "255, 232, 175",
    },
    Caleb: {
      color: "#00aeef",
      rgb: "0, 174, 239",
      ink: "#020111",
      alt: "#61b9eb",
      altRgb: "97, 185, 235",
      spectrum: "#243d55",
      spectrumRgb: "36, 61, 85",
    },
  };

  const COACH_SCHEDULE_NAME_ALIASES = {
    "Kylie Dennis": "Kylie Denis",
  };

  function setStyles(node, styles) {
    if (!(node instanceof HTMLElement)) {
      return;
    }

    Object.assign(node.style, styles);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/gu, "&amp;")
      .replace(/</gu, "&lt;")
      .replace(/>/gu, "&gt;")
      .replace(/"/gu, "&quot;")
      .replace(/'/gu, "&#39;");
  }

  function toMalaysiaShifted(dateValue) {
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue || Date.now());
    return new Date(date.getTime() + MALAYSIA_OFFSET_MS);
  }

  function getMalaysiaDateParts(dateValue) {
    const shifted = toMalaysiaShifted(dateValue);
    return {
      year: shifted.getUTCFullYear(),
      month: shifted.getUTCMonth(),
      dayOfMonth: shifted.getUTCDate(),
      dayOfWeek: shifted.getUTCDay(),
    };
  }

  function makeMalaysiaDate(year, month, dayOfMonth, hour = 0, minute = 0) {
    return new Date(Date.UTC(year, month, dayOfMonth, hour - 8, minute, 0, 0));
  }

  function getMalaysiaStartOfDay(dateValue) {
    const parts = getMalaysiaDateParts(dateValue);
    return makeMalaysiaDate(parts.year, parts.month, parts.dayOfMonth, 0, 0);
  }

  function addMalaysiaDays(startDate, days) {
    return new Date(startDate.getTime() + days * DAY_MS);
  }

  function getMalaysiaWeekStart(dateValue) {
    const startOfDay = getMalaysiaStartOfDay(dateValue);
    const parts = getMalaysiaDateParts(startOfDay);
    const distanceFromMonday = (parts.dayOfWeek + 6) % 7;
    return addMalaysiaDays(startOfDay, -distanceFromMonday);
  }

  function toDateIso(dateValue) {
    const parts = getMalaysiaDateParts(dateValue);
    return `${parts.year}-${String(parts.month + 1).padStart(2, "0")}-${String(parts.dayOfMonth).padStart(2, "0")}`;
  }

  function formatDateLabel(dateValue, locale) {
    return new Intl.DateTimeFormat(locale || "en-MY", {
      day: "numeric",
      month: "short",
    }).format(dateValue);
  }

  function formatHourLabel(hour) {
    const normalizedHour = ((hour % 24) + 24) % 24;
    const suffix = normalizedHour >= 12 ? "PM" : "AM";
    const twelveHour = normalizedHour % 12 || 12;
    return `${twelveHour} ${suffix}`;
  }

  function parseClockValue(label) {
    const match = String(label || "")
      .trim()
      .match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/iu);

    if (!match) {
      return null;
    }

    const hourValue = Number(match[1]);
    const minuteValue = Number(match[2] || 0);
    const meridiem = String(match[3] || "").toUpperCase();
    const normalizedHour = hourValue % 12 + (meridiem === "PM" ? 12 : 0);
    return normalizedHour * 60 + minuteValue;
  }

  function parseSlotRange(label) {
    const normalizedLabel = RELATIVE_TIME_RANGES[String(label || "").trim()] || label;
    const parts = String(normalizedLabel || "")
      .split(/\s*-\s*/u)
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length !== 2) {
      return null;
    }

    const startMinutes = parseClockValue(parts[0]);
    const endMinutes = parseClockValue(parts[1]);
    if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
      return null;
    }

    return {
      startMinutes,
      endMinutes,
    };
  }

  function formatClockMinutes(totalMinutes) {
    const normalizedMinutes = ((Number(totalMinutes) % 1440) + 1440) % 1440;
    const hour = Math.floor(normalizedMinutes / 60);
    const minutes = normalizedMinutes % 60;
    const suffix = hour >= 12 ? "PM" : "AM";
    const twelveHour = hour % 12 || 12;
    const minuteLabel = minutes ? `:${String(minutes).padStart(2, "0")}` : "";
    return `${twelveHour}${minuteLabel} ${suffix}`;
  }

  function expandSlotIntoBlocks(label) {
    const parsedRange = parseSlotRange(label);
    if (!parsedRange) {
      return [];
    }

    const blocks = [];
    let cursor = parsedRange.startMinutes;

    while (cursor < parsedRange.endMinutes) {
      const nextCursor = Math.min(cursor + 60, parsedRange.endMinutes);
      blocks.push({
        startMinutes: cursor,
        endMinutes: nextCursor,
        startTime: `${String(Math.floor(cursor / 60)).padStart(2, "0")}:${String(cursor % 60).padStart(2, "0")}`,
        endTime: `${String(Math.floor(nextCursor / 60)).padStart(2, "0")}:${String(nextCursor % 60).padStart(2, "0")}`,
        label: `${formatClockMinutes(cursor)} - ${formatClockMinutes(nextCursor)}`,
      });
      cursor = nextCursor;
    }

    return blocks;
  }

  function buildCalendarFromLegacySlots(slots, options) {
    const now = options?.now instanceof Date ? options.now : new Date();
    const locale = options?.locale || "en-MY";
    const lookaheadDays = Math.max(1, Number(options?.lookaheadDays || DEFAULT_LOOKAHEAD_DAYS));
    const todayStart = getMalaysiaStartOfDay(now);
    const weekStart = getMalaysiaWeekStart(todayStart);
    const leadInDays = Math.max(0, Math.round((todayStart.getTime() - weekStart.getTime()) / DAY_MS));
    const totalCalendarDays = Math.max(7, Math.ceil((leadInDays + lookaheadDays) / 7) * 7);
    const days = [];

    for (let dayOffset = 0; dayOffset < totalCalendarDays; dayOffset += 1) {
      const dayStart = addMalaysiaDays(weekStart, dayOffset);
      const parts = getMalaysiaDateParts(dayStart);
      const dayOrderItem = DAY_ORDER.find((item) => item.dayOfWeek === parts.dayOfWeek) || DAY_ORDER[0];
      const dateIso = toDateIso(dayStart);
      const blocks = (slots || [])
        .filter((slot) => String(slot?.day || "").trim() === dayOrderItem.key)
        .flatMap((slot) =>
          expandSlotIntoBlocks(slot.time).map((block) => ({
            ...block,
            dateIso,
            startIso: new Date(dayStart.getTime() + block.startMinutes * 60 * 1000).toISOString(),
            endIso: new Date(dayStart.getTime() + block.endMinutes * 60 * 1000).toISOString(),
            state: "available",
            statusLabel: "Available",
          }))
        );

      days.push({
        key: dayOrderItem.key,
        label: dayOrderItem.label,
        shortLabel: dayOrderItem.key,
        dateIso,
        dateLabel: formatDateLabel(dayStart, locale),
        dayOfWeek: parts.dayOfWeek,
        blocks: blocks.sort((left, right) => left.startMinutes - right.startMinutes),
      });
    }

    return {
      timezone: "Asia/Kuala_Lumpur",
      startHour: DEFAULT_START_HOUR,
      endHour: DEFAULT_END_HOUR,
      days,
    };
  }

  function normalizeCoachCalendar(coach, options) {
    if (coach?.calendar?.days?.length) {
      return coach.calendar;
    }

    if (coach?.days?.length) {
      return coach;
    }

    if (Array.isArray(coach?.slots) && coach.slots.length) {
      return buildCalendarFromLegacySlots(coach.slots, options);
    }

    return {
      timezone: "Asia/Kuala_Lumpur",
      startHour: DEFAULT_START_HOUR,
      endHour: DEFAULT_END_HOUR,
      days: DAY_ORDER.map((day) => ({
        key: day.key,
        label: day.label,
        shortLabel: day.key,
        dayOfWeek: day.dayOfWeek,
        dateIso: "",
        dateLabel: "",
        blocks: [],
      })),
    };
  }

  function getAccent(coachName) {
    const normalizedName = COACH_SCHEDULE_NAME_ALIASES[String(coachName || "").trim()] || String(coachName || "").trim();
    return (
      COACH_SCHEDULE_ACCENTS[normalizedName]
      || {
        color: "#fea12a",
        rgb: "254, 161, 42",
        ink: "#120800",
        alt: "#ffd08e",
        altRgb: "255, 208, 142",
        spectrum: "#ffefcf",
        spectrumRgb: "255, 239, 207",
      }
    );
  }

  function getAvailableBlockCount(coach, options) {
    const calendar = normalizeCoachCalendar(coach, options);
    return (calendar.days || []).reduce((total, day) => {
      return total + (day.blocks || []).filter((block) => block.state !== "busy").length;
    }, 0);
  }

  function listAvailableBlocks(calendar, dateIso) {
    const day = (calendar?.days || []).find((item) => item.dateIso === dateIso);
    if (!day) {
      return [];
    }

    return (day.blocks || []).filter((block) => String(block.state || "available") !== "busy");
  }

  function findMatchingAvailableBlock(calendar, dateIso, timeValue) {
    const normalizedTimeValue = String(timeValue || "").trim().slice(0, 5);
    if (!dateIso || !normalizedTimeValue) {
      return null;
    }

    return listAvailableBlocks(calendar, dateIso).find((block) => {
      return String(block.startTime || "").trim().slice(0, 5) === normalizedTimeValue;
    }) || null;
  }

  function populateTimeSelect(selectNode, blocks, placeholder) {
    if (!(selectNode instanceof HTMLSelectElement)) {
      return;
    }

    const currentValue = String(selectNode.value || "").trim();
    const options = ['<option value="">Select time slot</option>'];

    (blocks || []).forEach((block) => {
      options.push(`<option value="${escapeHtml(block.startTime)}">${escapeHtml(block.label)}</option>`);
    });

    selectNode.innerHTML = options.join("").replace("Select time slot", escapeHtml(placeholder || "Select time slot"));
    if (currentValue && (blocks || []).some((block) => String(block.startTime || "") === currentValue)) {
      selectNode.value = currentValue;
    }
  }

  function renderCalendar(targetNode, options) {
    if (!(targetNode instanceof HTMLElement)) {
      return null;
    }

    const config = options || {};
    const coachName = config.coachName || "";
    const accent = getAccent(coachName);
    const calendarData = normalizeCoachCalendar(config.coach || {}, {
      now: config.now,
      lookaheadDays: config.lookaheadDays,
      locale: config.locale,
    });
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const compactHeader = viewportWidth <= 560;
    const daysPerView = Math.max(1, Math.min(7, Number(config.daysPerView || (viewportWidth <= 400 ? 2 : viewportWidth <= 560 ? 3 : 7))));
    const totalHours = Number(calendarData.startHour || DEFAULT_START_HOUR) >= Number(calendarData.endHour || DEFAULT_END_HOUR)
      ? DEFAULT_END_HOUR - DEFAULT_START_HOUR
      : Number(calendarData.endHour || DEFAULT_END_HOUR) - Number(calendarData.startHour || DEFAULT_START_HOUR);
    const startHour = Number(calendarData.startHour || DEFAULT_START_HOUR);
    const endHour = Number(calendarData.endHour || DEFAULT_END_HOUR);
    const hourSize = Number(config.hourSize || DEFAULT_HOUR_SIZE);
    const columnMinWidth = Math.max(84, Number(config.columnMinWidth || (viewportWidth <= 400 ? 92 : viewportWidth <= 560 ? 96 : 120)));
    const timeRailWidth = Math.max(58, Number(config.timeRailWidth || (viewportWidth <= 400 ? 62 : viewportWidth <= 560 ? 66 : 86)));
    const headerHeight = Math.max(56, Number(config.headerHeight || (viewportWidth <= 400 ? 58 : viewportWidth <= 560 ? 60 : 72)));
    const boardHeight = totalHours * hourSize;
    const isInteractive = config.interactive !== false;
    const emptyMessage = config.emptyMessage || "No published availability yet.";

    targetNode.innerHTML = "";
    targetNode.classList.add("coach-schedule-embed");
    if (config.useWorkspaceTheme) {
      targetNode.style.removeProperty("--coach-schedule-accent");
      targetNode.style.removeProperty("--coach-schedule-accent-rgb");
      targetNode.style.removeProperty("--coach-schedule-accent-ink");
    } else {
      targetNode.style.setProperty("--coach-schedule-accent", accent.color);
      targetNode.style.setProperty("--coach-schedule-accent-rgb", accent.rgb);
      targetNode.style.setProperty("--coach-schedule-accent-ink", accent.ink);
    }

    const totalBlocks = (calendarData.days || []).reduce((count, day) => count + ((day.blocks || []).length), 0);
    if (!totalBlocks) {
      targetNode.innerHTML = `<p class="coach-schedule-empty">${escapeHtml(emptyMessage)}</p>`;
      return calendarData;
    }

    const totalViews = Math.max(1, Math.ceil((calendarData.days || []).length / daysPerView));
    let currentViewIndex = Math.max(0, Math.min(totalViews - 1, Number(config.initialViewIndex || 0)));

    const shell = document.createElement("div");
    shell.className = "coach-schedule-shell";

    let weekStatus = null;
    let previousWeekButton = null;
    let nextWeekButton = null;

    const scrollShell = document.createElement("div");
    scrollShell.className = "coach-schedule-calendar-scroll";

    const calendar = document.createElement("div");
    calendar.className = "coach-schedule-calendar";
    calendar.style.setProperty("--coach-schedule-hours", String(totalHours));
    calendar.style.setProperty("--coach-schedule-hour-size", `${hourSize}px`);

    const corner = document.createElement("div");
    corner.className = "coach-schedule-corner";
    corner.textContent = "Time";

    const headerRow = document.createElement("div");
    headerRow.className = "coach-schedule-header-row";

    const timeRail = document.createElement("div");
    timeRail.className = "coach-schedule-time-rail";
    timeRail.style.setProperty("--coach-schedule-hours", String(totalHours));
    timeRail.style.setProperty("--coach-schedule-hour-size", `${hourSize}px`);

    const board = document.createElement("div");
    board.className = "coach-schedule-board";
    board.style.setProperty("--coach-schedule-hours", String(totalHours));
    board.style.setProperty("--coach-schedule-hour-size", `${hourSize}px`);

    if (totalViews > 1) {
      const toolbar = document.createElement("div");
      toolbar.className = "coach-schedule-toolbar";

      weekStatus = document.createElement("p");
      weekStatus.className = "coach-schedule-week-status";

      const navigation = document.createElement("div");
      navigation.className = "coach-schedule-week-nav";

      previousWeekButton = document.createElement("button");
      previousWeekButton.type = "button";
      previousWeekButton.className = "coach-schedule-week-button";
      previousWeekButton.textContent = "Previous week";

      nextWeekButton = document.createElement("button");
      nextWeekButton.type = "button";
      nextWeekButton.className = "coach-schedule-week-button";
      nextWeekButton.textContent = "Next week";

      previousWeekButton.addEventListener("click", () => {
        if (currentViewIndex === 0) return;
        currentViewIndex -= 1;
        renderVisibleWeek();
      });

      nextWeekButton.addEventListener("click", () => {
        if (currentViewIndex >= totalViews - 1) return;
        currentViewIndex += 1;
        renderVisibleWeek();
      });

      navigation.append(previousWeekButton, nextWeekButton);
      toolbar.append(weekStatus, navigation);
      shell.append(toolbar);
    }

    for (let hour = startHour; hour <= endHour; hour += 1) {
      const timeLabel = document.createElement("span");
      timeLabel.className = `coach-schedule-time-label${hour === endHour ? " is-terminal" : ""}`;
      timeLabel.textContent = formatHourLabel(hour);
      timeLabel.style.top = hour === startHour ? "0.4rem" : `${(hour - startHour) * hourSize}px`;
      timeRail.append(timeLabel);
    }

    function renderVisibleWeek() {
      const visibleDays = (calendarData.days || []).slice(currentViewIndex * daysPerView, (currentViewIndex + 1) * daysPerView);
      const visibleDayCount = Math.max(1, visibleDays.length);

      headerRow.innerHTML = "";
      board.innerHTML = "";
      headerRow.style.gridTemplateColumns = `repeat(${visibleDayCount}, minmax(${columnMinWidth}px, 1fr))`;
      board.style.gridTemplateColumns = `repeat(${visibleDayCount}, minmax(${columnMinWidth}px, 1fr))`;
      calendar.style.gridTemplateColumns = `${timeRailWidth}px minmax(${visibleDayCount * columnMinWidth}px, 1fr)`;
      calendar.style.gridTemplateRows = `${headerHeight}px auto`;
      corner.style.minHeight = `${headerHeight}px`;

      visibleDays.forEach((day) => {
        const headerCell = document.createElement("div");
        headerCell.className = "coach-schedule-header-cell";
        headerCell.style.minHeight = `${headerHeight}px`;
        headerCell.innerHTML = `
          <span class="coach-schedule-header-day">${escapeHtml((day.shortLabel || day.key || "").toUpperCase())}</span>
          <span class="coach-schedule-header-date">${escapeHtml(compactHeader ? String(day.dateLabel || "").split(" ")[0] : day.dateLabel || "")}</span>
        `;
        headerRow.append(headerCell);

        const dayColumn = document.createElement("div");
        dayColumn.className = "coach-schedule-board-day";
        dayColumn.style.minHeight = `${boardHeight}px`;

        if (!(day.blocks || []).length) {
          const offState = document.createElement("span");
          offState.className = "coach-schedule-day-state";
          offState.textContent = "Off";
          dayColumn.append(offState);
        } else {
          (day.blocks || []).forEach((block) => {
            const top = ((Number(block.startMinutes || 0) - startHour * 60) / 60) * hourSize + 4;
            const height = Math.max(((Number(block.endMinutes || 0) - Number(block.startMinutes || 0)) / 60) * hourSize - 8, 34);
            const state = String(block.state || "available");
            const nodeTag = state === "busy" || !isInteractive ? "div" : "button";
            const slotNode = document.createElement(nodeTag);
            slotNode.className = `coach-schedule-slot${state === "busy" ? " is-busy" : ""}`;
            slotNode.style.top = `${top}px`;
            slotNode.style.height = `${height}px`;

            if (nodeTag === "button") {
              slotNode.type = "button";
              slotNode.addEventListener("click", () => {
                if (typeof config.onSelect === "function") {
                  config.onSelect({
                    coachName,
                    calendar: calendarData,
                    day,
                    block,
                    coach: config.coach || {},
                  });
                }
              });
            } else {
              slotNode.setAttribute("aria-disabled", "true");
            }

            slotNode.setAttribute(
              "aria-label",
              `${day.label || day.shortLabel || day.key || "Day"} ${block.label || `${block.startTime} - ${block.endTime}`}`
            );

            slotNode.innerHTML = `
              <span class="coach-schedule-slot-status">${escapeHtml(block.statusLabel || (state === "busy" ? "Booked" : "Available"))}</span>
            `;
            dayColumn.append(slotNode);
          });
        }

        board.append(dayColumn);
      });

      if (weekStatus) {
        const firstDay = visibleDays[0];
        const lastDay = visibleDays[visibleDays.length - 1];
        const dateRange =
          firstDay && lastDay
            ? `${firstDay.dateLabel || ""}${lastDay !== firstDay ? ` - ${lastDay.dateLabel || ""}` : ""}`
            : "";
        weekStatus.textContent = dateRange ? `Week ${currentViewIndex + 1} of ${totalViews} • ${dateRange}` : `Week ${currentViewIndex + 1} of ${totalViews}`;
      }

      if (previousWeekButton) {
        previousWeekButton.disabled = currentViewIndex === 0;
      }

      if (nextWeekButton) {
        nextWeekButton.disabled = currentViewIndex >= totalViews - 1;
      }

      scrollShell.scrollTop = 0;
    }

    calendar.append(corner, headerRow, timeRail, board);
    scrollShell.append(calendar);
    shell.append(scrollShell);
    targetNode.append(shell);
    renderVisibleWeek();

    return calendarData;
  }

  window.LEGACY_COACH_AVAILABILITY = {
    getAccent,
    getAvailableBlockCount,
    normalizeCoachCalendar,
    listAvailableBlocks,
    findMatchingAvailableBlock,
    populateTimeSelect,
    renderCalendar,
  };
})();
