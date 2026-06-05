import { RGBA } from "@opentui/core";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useTheme } from "@/lib/theme";

type DialogDimension = number | "auto" | `${number}%`;
type DialogColor = string | RGBA;

export type DialogOptions = {
  title?: string;
  titleHint?: string;
  body: ReactNode;
  footer?: ReactNode;
  width?: DialogDimension;
  height?: DialogDimension;
  backgroundColor?: DialogColor;
  overlayColor?: DialogColor;
  onClose?: () => void;
};

type DialogContextValue = {
  dialog: DialogOptions | null;
  openDialog: (dialog: DialogOptions) => void;
  closeDialog: () => void;
};

type DialogProviderProps = {
  children: ReactNode;
};

type DialogOverlayProps = {
  children: ReactNode;
  backgroundColor?: DialogColor;
};

type DialogProps = {
  children: ReactNode;
  title?: string;
  titleHint?: string;
  footer?: ReactNode;
  width?: DialogDimension;
  height?: DialogDimension;
  backgroundColor?: DialogColor;
};

const DialogContext = createContext<DialogContextValue | null>(null);
const maxDialogWidth = 72;
const compactDialogWidthRatio = 0.9;
const minDialogWidth = 24;

export function DialogProvider({ children }: DialogProviderProps) {
  const [dialog, setDialog] = useState<DialogOptions | null>(null);

  const openDialog = useCallback((nextDialog: DialogOptions) => {
    setDialog(nextDialog);
  }, []);

  const closeDialog = useCallback(() => {
    setDialog((currentDialog) => {
      currentDialog?.onClose?.();
      return null;
    });
  }, []);

  const value = useMemo(
    () => ({ dialog, openDialog, closeDialog }),
    [dialog, openDialog, closeDialog],
  );

  return (
    <DialogContext.Provider value={value}>
      {children}
      <DialogHost />
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error("useDialog must be used within DialogProvider");
  }

  return context;
}

export function DialogHost() {
  const { dialog, closeDialog } = useDialog();
  const open = dialog !== null;

  useKeyboard((event) => {
    if (!open || event.eventType !== "press" || event.repeated) {
      return;
    }

    if (event.name === "escape") {
      closeDialog();
    }
  });

  if (!dialog) {
    return null;
  }

  return (
    <DialogOverlay backgroundColor={dialog.overlayColor}>
      <Dialog
        title={dialog.title}
        titleHint={dialog.titleHint}
        width={dialog.width}
        height={dialog.height}
        backgroundColor={dialog.backgroundColor}
        footer={dialog.footer}
      >
        {dialog.body}
      </Dialog>
    </DialogOverlay>
  );
}

export function DialogOverlay({
  children,
  backgroundColor,
}: DialogOverlayProps) {
  const theme = useTheme();

  return (
    <box
      position="absolute"
      top={0}
      right={0}
      bottom={0}
      left={0}
      zIndex={200}
      justifyContent="center"
      alignItems="center"
      backgroundColor={backgroundColor ?? theme.overlay.dialog}
    >
      {children}
    </box>
  );
}

export function Dialog({
  children,
  title,
  titleHint,
  footer,
  width,
  height,
  backgroundColor,
}: DialogProps) {
  const { width: terminalWidth } = useTerminalDimensions();
  const theme = useTheme();
  const dialogWidth = width ?? getResponsiveDialogWidth(terminalWidth);

  return (
    <box
      width={dialogWidth}
      height={height}
      flexDirection="column"
      backgroundColor={backgroundColor ?? theme.colors.surface}
      paddingX={2}
      paddingY={1}
    >
      {(title || titleHint) && (
        <box flexDirection="row" justifyContent="space-between" flexShrink={0}>
          <text fg={theme.colors.textStrong}>{title}</text>
          <text fg={theme.colors.textMuted}>{titleHint}</text>
        </box>
      )}
      <box flexDirection="column" flexGrow={1} minHeight={0} paddingTop={1}>
        {children}
      </box>
      {footer && (
        <box
          flexDirection="row"
          justifyContent="space-between"
          flexShrink={0}
          paddingTop={1}
        >
          {footer}
        </box>
      )}
    </box>
  );
}

function getResponsiveDialogWidth(terminalWidth: number) {
  const compactWidth = Math.floor(terminalWidth * compactDialogWidthRatio);

  if (terminalWidth <= minDialogWidth) {
    return compactWidth;
  }

  return Math.max(Math.min(compactWidth, maxDialogWidth), minDialogWidth);
}
