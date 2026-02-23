"use client";

import { useState } from "react";
import { Avtale, Pasient, Behandler } from "@/types";
import { getAvtaleColor, getAvtaleCategory, getCategoryColor } from "@/lib/colors";
import { AvtaleModal } from "./AvtaleModal";

type WeekCalendarProps = {
  avtaler: Avtale[];
  viewMode: "pasient" | "behandler";
  pasienter?: Pasient[];
  behandlere?: Behandler[];
  currentMonday: Date;
  onWeekChange: (monday: Date) => void;
  hideNavigation?: boolean;
};

// Generer 15-minutters slots fra 09:00 til 16:00
function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 9; hour < 16; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      slots.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
    }
  }
  return slots;
}

const TIMER = generateTimeSlots();
const UKEDAGER = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag"];
const MANEDER = [
  "Januar", "Februar", "Mars", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Desember"
];

export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Formater dato som YYYY-MM-DD i lokal tidssone (ikke UTC)
export function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeekDatesFromMonday(monday: Date): { dato: string; ukedag: string; dagManed: string }[] {
  return UKEDAGER.map((ukedag, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return {
      dato: formatDateLocal(date),
      ukedag,
      dagManed: `${date.getDate()}.${date.getMonth() + 1}`,
    };
  });
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Konverter tid (HH:MM) til minutter fra midnatt
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

type SlotInfo = {
  avtale: Avtale;
  isStart: boolean;
  isEnd: boolean;
} | null;

// Sjekk om en slot er dekket av en avtale
function getAvtaleForSlot(
  avtaler: Avtale[],
  dato: string,
  slotTime: string
): SlotInfo {
  const slotMinutes = timeToMinutes(slotTime);
  const slotEnd = slotMinutes + 15; // Hver slot er 15 min

  for (const avtale of avtaler) {
    if (avtale.dato !== dato) continue;

    const avtaleStart = timeToMinutes(avtale.startTid);
    const avtaleSlutt = timeToMinutes(avtale.sluttTid);

    // Sjekk om slot overlapper med avtalen
    if (slotMinutes >= avtaleStart && slotEnd <= avtaleSlutt) {
      return {
        avtale,
        isStart: slotMinutes === avtaleStart,
        isEnd: slotEnd === avtaleSlutt,
      };
    }
  }

  return null;
}


export function WeekCalendar({ avtaler, viewMode, pasienter = [], behandlere = [], currentMonday, onWeekChange, hideNavigation = false }: WeekCalendarProps) {
  const [selectedAvtale, setSelectedAvtale] = useState<Avtale | null>(null);

  const getPersonNavn = (avtale: Avtale): string | null => {
    if (viewMode === "pasient") {
      const behandler = behandlere.find((b) => b.id === avtale.behandlerId);
      return behandler?.navn ?? null;
    } else {
      const pasient = pasienter.find((p) => p.id === avtale.pasientId);
      return pasient?.navn ?? null;
    }
  };

  const ukedager = getWeekDatesFromMonday(currentMonday);
  const weekNumber = getWeekNumber(currentMonday);
  const currentYear = currentMonday.getFullYear();
  const currentMonth = currentMonday.getMonth();

  // Finn unike kategorier for legend
  const activeCategories = [...new Set(avtaler.map((a) => getAvtaleCategory(a.beskrivelse)))];

  const navigateWeek = (delta: number) => {
    const newMonday = new Date(currentMonday);
    newMonday.setDate(currentMonday.getDate() + delta * 7);
    onWeekChange(newMonday);
  };

  const navigateMonth = (delta: number) => {
    const newDate = new Date(currentMonday);
    newDate.setMonth(currentMonday.getMonth() + delta);
    onWeekChange(getMondayOfWeek(newDate));
  };

  const goToToday = () => {
    onWeekChange(getMondayOfWeek(new Date()));
  };

  return (
    <div className="mt-6">
      <div className="mb-4 flex flex-col gap-3">
        {hideNavigation ? (
          <div className="text-center">
            <span className="text-lg font-semibold text-zinc-900 dark:text-white">
              Uke {weekNumber}
            </span>
            <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">
              {MANEDER[currentMonth]} {currentYear}
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigateWeek(-1)}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Forrige
              </button>
              <div className="text-center">
                <span className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Uke {weekNumber}
                </span>
                <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">
                  {MANEDER[currentMonth]} {currentYear}
                </span>
              </div>
              <button
                onClick={() => navigateWeek(1)}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Neste
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm">
              <button
                onClick={() => navigateMonth(-1)}
                className="rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
              >
                -1 md
              </button>
              <button
                onClick={goToToday}
                className="rounded bg-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
              >
                I dag
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
              >
                +1 md
              </button>
            </div>
          </>
        )}

        {/* Legend */}
        {activeCategories.length > 0 && (
          <div className="flex flex-wrap gap-3 text-xs">
            {activeCategories.map((cat) => {
              const color = getCategoryColor(cat);
              return (
                <div key={cat} className="flex items-center gap-1.5">
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${color.dot}`} />
                  <span className="text-zinc-600 dark:text-zinc-400">{color.label}</span>
                </div>
              );
            })}
            <div className="mx-1 h-4 w-px bg-zinc-300 dark:bg-zinc-600" />
            <div className="flex items-center gap-1.5">
              <span className="inline-block rounded border-l-3 border-l-zinc-400 bg-zinc-500/20 px-1 py-px text-[9px] font-semibold uppercase leading-tight text-zinc-700 dark:border-l-zinc-500 dark:bg-zinc-400/20 dark:text-zinc-300">Gruppe</span>
              <span className="text-zinc-600 dark:text-zinc-400">Gruppeaktivitet</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block rounded bg-blue-100 px-1 py-px text-[9px] font-semibold uppercase leading-tight text-blue-700 dark:bg-blue-900 dark:text-blue-300">Ind.</span>
              <span className="text-zinc-600 dark:text-zinc-400">Individuell (optimert)</span>
            </div>
          </div>
        )}
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header */}
          <div className="grid grid-cols-[60px_repeat(5,1fr)] border-b border-zinc-200 dark:border-zinc-700">
            <div className="p-2 text-xs font-medium text-zinc-500" />
            {ukedager.map((dag) => (
              <div
                key={dag.dato}
                className="p-2 text-center text-xs font-medium text-zinc-700 dark:text-zinc-300"
              >
                <div>{dag.ukedag}</div>
                <div className="text-zinc-500">{dag.dagManed}</div>
              </div>
            ))}
          </div>

          {/* Time slots */}
          {TIMER.map((time) => {
            const isFullHour = time.endsWith(":00");
            return (
              <div
                key={time}
                className={`grid grid-cols-[60px_repeat(5,1fr)] ${
                  isFullHour
                    ? "border-b border-zinc-200 dark:border-zinc-700"
                    : "border-b border-zinc-100 dark:border-zinc-800"
                }`}
              >
                <div className="p-1 text-xs text-zinc-500">
                  {isFullHour ? time : ""}
                </div>
                {ukedager.map((dag) => {
                  const slotInfo = getAvtaleForSlot(avtaler, dag.dato, time);
                  const roundedClass = slotInfo
                    ? `${slotInfo.isStart ? "rounded-t" : ""} ${slotInfo.isEnd ? "rounded-b" : ""}`
                    : "";
                  const color = slotInfo ? getAvtaleColor(slotInfo.avtale.beskrivelse) : null;
                  return (
                    <div
                      key={dag.dato}
                      className={`min-h-[25px] overflow-hidden border-l border-zinc-100 dark:border-zinc-800 ${
                        slotInfo ? "" : "p-0.5"
                      }`}
                    >
                      {slotInfo && color && (
                        <div
                          onClick={() => slotInfo.isStart && setSelectedAvtale(slotInfo.avtale)}
                          className={`h-full overflow-hidden ${color.bg} ${color.bgDark} text-xs ${roundedClass} ${
                            slotInfo.avtale.type === "gruppe"
                              ? "border-l-3 border-l-zinc-400 dark:border-l-zinc-500"
                              : ""
                          } ${
                            slotInfo.isStart ? "px-1.5 pt-1 cursor-pointer hover:brightness-95 dark:hover:brightness-110" : "px-1.5"
                          } ${slotInfo.isEnd ? "pb-1" : ""}`}
                        >
                          {slotInfo.isStart && (
                            <>
                              <div className="flex items-center gap-1">
                                <span className={`inline-block rounded px-1 py-px text-[9px] font-semibold uppercase leading-tight ${
                                  slotInfo.avtale.type === "gruppe"
                                    ? "bg-zinc-500/20 text-zinc-700 dark:bg-zinc-400/20 dark:text-zinc-300"
                                    : "bg-white/40 text-current dark:bg-black/20"
                                }`}>
                                  {slotInfo.avtale.type === "gruppe" ? "Gruppe" : "Ind."}
                                </span>
                                <span className={`truncate font-medium ${color.text} ${color.textDark}`}>
                                  {slotInfo.avtale.beskrivelse}
                                </span>
                              </div>
                              {getPersonNavn(slotInfo.avtale) && (
                                <div className={`truncate ${color.textSecondary} ${color.textSecondaryDark}`}>
                                  {getPersonNavn(slotInfo.avtale)}
                                </div>
                              )}
                              <div className={`truncate ${color.textSecondary} ${color.textSecondaryDark}`}>
                                {slotInfo.avtale.startTid}-{slotInfo.avtale.sluttTid}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Avtale detail modal */}
      {selectedAvtale && (
        <AvtaleModal
          avtale={selectedAvtale}
          personNavn={getPersonNavn(selectedAvtale)}
          viewMode={viewMode}
          onClose={() => setSelectedAvtale(null)}
        />
      )}
    </div>
  );
}
