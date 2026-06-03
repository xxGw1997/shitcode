import { useKeyboard } from "@opentui/react";
import type { InferResponseType } from "hono/client";
import { useEffect, useMemo, useState } from "react";
import { useDialog } from "@/components/dialog";
import { client } from "@/lib/api/client";

type ServerSession = InferResponseType<typeof client.chat.sessions.$get, 200>[number];

type SessionPreview = {
  id: string;
  title: string;
  createdAt: string;
};

type SessionDisplayRow =
  | { type: "date"; key: string; label: string }
  | { type: "session"; key: string; session: SessionPreview; sessionIndex: number };

const maxVisibleRows = 14;

export function useSessionsDialog() {
  const { openDialog } = useDialog();

  return () => {
    openDialog({
      title: "sessions",
      titleHint: "esc",
      width: "90%",
      height: 22,
      body: <SessionsDialogBody />,
      footer: (
        <>
          <text fg="#94a3b8">up/down select</text>
          <text fg="#94a3b8">hover to highlight</text>
        </>
      ),
    });
  };
}

function SessionsDialogBody() {
  const [query, setQuery] = useState("");
  const [sessions, setSessions] = useState<SessionPreview[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const filteredSessions = useMemo(
    () => sortSessionsByCreatedAt(filterSessions(sessions, query)),
    [query, sessions],
  );
  const displayRows = useMemo(
    () => getSessionDisplayRows(filteredSessions),
    [filteredSessions],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadSessions() {
      setLoading(true);
      setError(null);

      try {
        const res = await client.chat.sessions.$get();

        if (!res.ok) {
          throw new Error(`Failed to load sessions (${res.status})`);
        }

        const data = await res.json();

        if (!cancelled) {
          setSessions(data.map(toSessionPreview));
        }
      } catch (err) {
        if (!cancelled) {
          setSessions([]);
          setError(err instanceof Error ? err.message : "Failed to load sessions");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSessions();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSelectedIndex((index) => Math.min(index, Math.max(filteredSessions.length - 1, 0)));
  }, [filteredSessions.length]);

  useKeyboard((event) => {
    if (event.eventType !== "press" && event.eventType !== "repeat") {
      return;
    }

    if (filteredSessions.length === 0) {
      return;
    }

    if (event.name === "up") {
      setSelectedIndex((index) =>
        index === 0 ? filteredSessions.length - 1 : index - 1,
      );
    }

    if (event.name === "down") {
      setSelectedIndex((index) => (index + 1) % filteredSessions.length);
    }
  });

  const selectedRowIndex = Math.max(
    displayRows.findIndex((row) => row.type === "session" && row.sessionIndex === selectedIndex),
    0,
  );
  const visibleStartIndex = getVisibleStartIndex(displayRows.length, selectedRowIndex);
  const visibleRows = displayRows.slice(
    visibleStartIndex,
    visibleStartIndex + maxVisibleRows,
  );

  return (
    <box flexDirection="column" gap={1}>
      <box height={1} flexShrink={0}>
        <input
          value={query}
          onInput={setQuery}
          focused
          placeholder="Filter sessions by title..."
          placeholderColor="#64748b"
          cursorColor="#facc15"
          textColor="#e2e8f0"
          backgroundColor="transparent"
          focusedBackgroundColor="transparent"
        />
      </box>

      <box flexDirection="column" flexGrow={1} minHeight={0}>
        {loading ? (
          <text fg="#94a3b8">Loading sessions...</text>
        ) : error ? (
          <text fg="#f87171">{error}</text>
        ) : visibleRows.length === 0 ? (
          <text fg="#94a3b8">No matching sessions</text>
        ) : (
          visibleRows.map((row) => {
            if (row.type === "date") {
              return (
                <box key={row.key} marginTop={1}>
                  <text fg="#9d7cd8">{row.label}</text>
                </box>
              );
            }

            const selected = row.sessionIndex === selectedIndex;

            return (
              <box
                key={row.key}
                flexDirection="row"
                justifyContent="space-between"
                backgroundColor={selected ? "#fab283" : "#1E1E1E"}
                paddingX={1}
                onMouseMove={() => setSelectedIndex(row.sessionIndex)}
                onMouseOver={() => setSelectedIndex(row.sessionIndex)}
              >
                <text flexGrow={1} truncate fg={selected ? "#1E1E1E" : "#e2e8f0"}>
                  {row.session.title}
                </text>
                <text width={5} fg={selected ? "#1E1E1E" : "#94a3b8"}>
                  {formatTime(row.session.createdAt)}
                </text>
              </box>
            );
          })
        )}
      </box>
    </box>
  );
}

function toSessionPreview(session: ServerSession): SessionPreview {
  return {
    id: session.id,
    title: session.title?.trim() || "Untitled session",
    createdAt: session.createdAt,
  };
}

function getSessionDisplayRows(sessions: SessionPreview[]): SessionDisplayRow[] {
  const rows: SessionDisplayRow[] = [];
  let previousDateKey = "";

  sessions
    .map((session, sessionIndex) => ({ session, sessionIndex }))
    .forEach(({ session, sessionIndex }) => {
      const dateKey = getDateKey(session.createdAt);

      if (dateKey !== previousDateKey) {
        rows.push({
          type: "date",
          key: `date-${dateKey}`,
          label: formatDate(session.createdAt),
        });
        previousDateKey = dateKey;
      }

      rows.push({
        type: "session",
        key: session.id,
        session,
        sessionIndex,
      });
    });

  return rows;
}

function sortSessionsByCreatedAt(sessions: SessionPreview[]) {
  return [...sessions].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
}

function filterSessions(sessions: SessionPreview[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return sessions;
  }

  return sessions.filter((session) =>
    session.title.toLowerCase().includes(normalizedQuery),
  );
}

function getVisibleStartIndex(sessionCount: number, selectedIndex: number) {
  if (sessionCount <= maxVisibleRows) {
    return 0;
  }

  const maxStartIndex = sessionCount - maxVisibleRows;

  return Math.min(
    Math.max(selectedIndex - maxVisibleRows + 1, 0),
    maxStartIndex,
  );
}

function getDateKey(value: string) {
  const date = new Date(value);
  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join("-");
}

function formatDate(value: string) {
  const date = new Date(value);
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return `${weekdays[date.getDay()]} ${months[date.getMonth()]} ${padDatePart(
    date.getDate(),
  )} ${date.getFullYear()}`;
}

function formatTime(value: string) {
  const date = new Date(value);
  return `${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`;
}

function padDatePart(value: number) {
  return value.toString().padStart(2, "0");
}
