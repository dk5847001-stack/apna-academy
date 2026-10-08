import { createTheme } from "@mui/material/styles";

const DARK_PALETTE = {
  background: {
    default: "#080d18",
    paper: "#111827",
  },
  text: {
    primary: "#f8fafc",
    secondary: "#a8b3c7",
    disabled: "#64748b",
  },
  divider: "#263247",
};

const LIGHT_PALETTE = {
  background: {
    default: "#ffffff",
    paper: "#ffffff",
  },
  text: {
    primary: "#0f172a",
    secondary: "#475569",
    disabled: "#94a3b8",
  },
  divider: "#e2e8f0",
};

export const createApnaTheme = (mode = "light") => {
  const dark = mode === "dark";
  const palette = dark ? DARK_PALETTE : LIGHT_PALETTE;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: dark ? "#60a5fa" : "#2563eb",
        light: dark ? "#93c5fd" : "#60a5fa",
        dark: dark ? "#3b82f6" : "#1d4ed8",
        contrastText: dark ? "#07111f" : "#ffffff",
      },
      secondary: {
        main: dark ? "#a78bfa" : "#7c3aed",
        light: dark ? "#c4b5fd" : "#a78bfa",
        dark: dark ? "#8b5cf6" : "#6d28d9",
        contrastText: "#ffffff",
      },
      success: {
        main: dark ? "#34d399" : "#059669",
        light: dark ? "#6ee7b7" : "#34d399",
        dark: dark ? "#10b981" : "#047857",
        contrastText: dark ? "#052e22" : "#ffffff",
      },
      warning: {
        main: dark ? "#fbbf24" : "#d97706",
        light: dark ? "#fcd34d" : "#f59e0b",
        dark: dark ? "#f59e0b" : "#b45309",
        contrastText: "#111827",
      },
      error: {
        main: dark ? "#fb7185" : "#dc2626",
        light: dark ? "#fda4af" : "#ef4444",
        dark: dark ? "#f43f5e" : "#b91c1c",
        contrastText: "#ffffff",
      },
      background: palette.background,
      text: palette.text,
      divider: palette.divider,
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      button: {
        textTransform: "none",
        fontWeight: 700,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: palette.background.default,
            color: palette.text.primary,
          },
          "::selection": {
            backgroundColor: dark ? "rgba(96, 165, 250, 0.28)" : "rgba(37, 99, 235, 0.18)",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: palette.background.paper,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: palette.background.paper,
            borderColor: palette.divider,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
            backgroundColor: palette.background.paper,
            color: palette.text.primary,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
            backgroundColor: palette.background.paper,
            color: palette.text.primary,
            border: `1px solid ${palette.divider}`,
            boxShadow: dark
              ? "0 18px 50px rgba(0, 0, 0, 0.42)"
              : "0 18px 50px rgba(15, 23, 42, 0.12)",
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            color: palette.text.primary,
            "&:hover": {
              backgroundColor: dark ? "#1a2537" : "#f1f5f9",
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            color: palette.text.primary,
            "&:hover": {
              backgroundColor: dark ? "#1a2537" : "#f8fafc",
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: "inherit",
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: palette.divider,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: "outlined",
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            color: palette.text.primary,
            backgroundColor: dark ? "#0d1422" : "#ffffff",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: dark ? "#344157" : "#cbd5e1",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: dark ? "#52627c" : "#94a3b8",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: dark ? "#60a5fa" : "#2563eb",
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: palette.text.secondary,
            "&.Mui-focused": {
              color: dark ? "#93c5fd" : "#2563eb",
            },
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          input: {
            "&::placeholder": {
              color: palette.text.disabled,
              opacity: 1,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            color: palette.text.primary,
            borderColor: palette.divider,
            backgroundColor: dark ? "#182236" : "#f8fafc",
          },
          outlined: {
            borderColor: dark ? "#344157" : "#cbd5e1",
          },
          colorPrimary: {
            backgroundColor: dark ? "#16335c" : "#eff6ff",
            color: dark ? "#bfdbfe" : "#1d4ed8",
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          select: { color: palette.text.primary },
          icon: { color: palette.text.secondary },
        },
      },
      MuiFormHelperText: {
        styleOverrides: { root: { color: palette.text.secondary } },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            boxShadow: "none",
            "&:focus-visible": {
              outline: dark ? "2px solid #60a5fa" : "2px solid #2563eb",
              outlineOffset: 2,
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: palette.text.secondary,
            "&:hover": {
              backgroundColor: dark ? "#1a2537" : "#f1f5f9",
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
            backgroundColor: palette.background.paper,
            color: palette.text.primary,
            border: dark ? "1px solid #263247" : "none",
            boxShadow: dark
              ? "0 24px 70px rgba(0, 0, 0, 0.5)"
              : "0 24px 70px rgba(15, 23, 42, 0.16)",
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: { root: { color: palette.text.primary } },
      },
      MuiDialogContentText: {
        styleOverrides: { root: { color: palette.text.secondary } },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
            backgroundColor: palette.background.paper,
            color: palette.text.primary,
            border: "1px solid " + palette.divider,
          },
        },
      },
      MuiSnackbarContent: {
        styleOverrides: {
          root: {
            backgroundColor: dark ? "#192337" : "#0f172a",
            color: "#ffffff",
            border: dark ? "1px solid #263247" : "none",
          },
          message: { fontWeight: 600 },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 12 },
          standardInfo: {
            backgroundColor: dark ? "#132746" : "#eff6ff",
            color: dark ? "#bfdbfe" : "#1e3a8a",
          },
          standardSuccess: {
            backgroundColor: dark ? "#0b2a24" : "#ecfdf5",
            color: dark ? "#6ee7b7" : "#065f46",
          },
          standardWarning: {
            backgroundColor: dark ? "#30250b" : "#fffbeb",
            color: dark ? "#fcd34d" : "#92400e",
          },
          standardError: {
            backgroundColor: dark ? "#32151d" : "#fef2f2",
            color: dark ? "#fda4af" : "#991b1b",
          },
        },
      },
      MuiCircularProgress: {
        styleOverrides: { root: { color: dark ? "#60a5fa" : "#2563eb" } },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { backgroundColor: dark ? "#263247" : "#e2e8f0" },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { color: palette.text.primary, borderColor: palette.divider },
          head: { color: palette.text.secondary, fontWeight: 700 },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            "&:hover": {
              backgroundColor: dark ? "#151f31" : "#f8fafc",
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: dark ? "#e2e8f0" : "#0f172a",
            color: dark ? "#0f172a" : "#ffffff",
            fontSize: "0.75rem",
            fontWeight: 600,
          },
        },
      },
    },
  });
};
