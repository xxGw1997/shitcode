import { useKeyboard } from "@opentui/react";
import type { ScrollBoxRenderable } from "@opentui/core";
import type { InferResponseType } from "hono/client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useDialog } from "@/components/dialog";
import { client } from "@/lib/api/client";
import { useTheme } from "@/lib/theme";
import { appRoutes } from "@/route/navigation";

type ServerSession = InferResponseType<typeof client.chat.sessions.$get, 200>[number];

type SessionPreview = {
  id: string;
  title: string;
  createdAt: string;
};

type SessionDisplayRow =
  | { type: "date"; key: string; label: string }
  | { type: "session"; key: string; session: SessionPreview; sessionIndex: number };

export function useSessionsDialog() {
  const navigate = useNavigate();
  const { openDialog, closeDialog } = useDialog();
  const theme = useTheme();

  return () => {
    openDialog({
      title: "sessions",
      titleHint: "esc",
      width: "90%",
      height: 22,
      body: (
        <SessionsDialogBody
          onSelect={(sessionId) => {
            closeDialog();
            navigate(appRoutes.chat(sessionId));
          }}
        />
      ),
      footer: (
        <>
          <text fg={theme.colors.textMuted}>up/down select</text>
          <text fg={theme.colors.textMuted}>enter open</text>
        </>
      ),
    });
  };
}

type SessionsDialogBodyProps = {
  onSelect: (sessionId: string) => void;
};

function SessionsDialogBody({ onSelect }: SessionsDialogBodyProps) {
  const theme = useTheme();
  const [query, setQuery] = useState("");
  const [sessions, setSessions] = useState<SessionPreview[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollBoxRenderable>(null);
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

    if (event.name === "return" || event.name === "enter") {
      const selectedSession = filteredSessions[selectedIndex];

      if (selectedSession) {
        onSelect(selectedSession.id);
      }
    }
  });

  useEffect(() => {
    const selectedRowIndex = displayRows.findIndex(
      (row) => row.type === "session" && row.sessionIndex === selectedIndex,
    );
    const selected = displayRows[selectedRowIndex];
    const previous = displayRows[selectedRowIndex - 1];

    if (selected && selected.type === "session") {
      const scrollTarget = previous?.type === "date" ? previous.key : selected.session.id;
      scrollRef.current?.scrollChildIntoView(scrollTarget);
    }
  }, [selectedIndex, displayRows]);

  return (
    <box flexDirection="column" gap={1} flexGrow={1} minHeight={0}>
      <box height={1} flexShrink={0}>
        <input
          value={query}
          onInput={setQuery}
          focused
          placeholder="Filter sessions by title..."
          placeholderColor={theme.colors.textSubtle}
          cursorColor={theme.colors.primary}
          textColor={theme.colors.textStrong}
          backgroundColor={theme.colors.transparent}
          focusedBackgroundColor={theme.colors.transparent}
        />
      </box>

      <scrollbox
        ref={scrollRef}
        scrollY={true}
        scrollX={false}
        flexGrow={1}
        flexShrink={1}
        minHeight={0}
        contentOptions={{ flexDirection: "column" }}
      >
        {loading ? (
          <text fg={theme.colors.textMuted}>Loading sessions...</text>
        ) : error ? (
          <text fg={theme.colors.error}>{error}</text>
        ) : displayRows.length === 0 ? (
          <text fg={theme.colors.textMuted}>No matching sessions</text>
        ) : (
          displayRows.map((row) => {
            if (row.type === "date") {
              return (
                <box key={row.key} id={row.key} marginTop={1}>
                  <text fg={theme.modes.plan}>{row.label}</text>
                </box>
              );
            }

            const selected = row.sessionIndex === selectedIndex;

            return (
              <box
                key={row.key}
                id={row.session.id}
                flexDirection="row"
                justifyContent="space-between"
                backgroundColor={selected ? theme.colors.accent : theme.colors.surface}
                paddingX={1}
                onMouseMove={() => setSelectedIndex(row.sessionIndex)}
              >
                <text flexGrow={1} truncate fg={selected ? theme.colors.textInverse : theme.colors.textStrong}>
                  {row.session.title}
                </text>
                <text width={5} fg={selected ? theme.colors.textInverse : theme.colors.textMuted}>
                  {formatTime(row.session.createdAt)}
                </text>
              </box>
            );
          })
        )}
      </scrollbox>
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
