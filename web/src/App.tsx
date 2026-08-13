import { useCallback, useEffect, useState } from "react";
import { Employment } from "./components/Employment";
import { useNuiEvent } from "./hooks/useNuiEvent";
import type { AppMode, Job, PendingAction, Theme } from "./types";
import { fetchNui } from "./utils/fetchNui";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun, faXmark } from "@fortawesome/free-solid-svg-icons";

export const devMode = !window.invokeNative;

const mockJobs: Job[] = [
  {
    jobName: "police",
    title: "Los Santos Police Department",
    gradeName: "Senior Officer",
    gradeLevel: 3,
    salary: 850,
    active: true,
    duty: true,
  },
  {
    jobName: "ambulance",
    title: "Emergency Medical Services",
    gradeName: "Paramedic",
    gradeLevel: 2,
    salary: 725,
    active: false,
    duty: false,
  },
  {
    jobName: "mechanic",
    title: "Benny's Original Motor Works",
    gradeName: "Technician",
    gradeLevel: 1,
    salary: 540,
    active: false,
    duty: false,
  },
];

function isTheme(value: string | undefined): value is Theme {
  return value === "light" || value === "dark";
}

interface AppProps {
  mode?: AppMode;
  initialTheme?: Theme;
  initialVisible?: boolean;
}

function getDevelopmentTheme(): Theme {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function App({ initialTheme, mode = "development", initialVisible = true }: AppProps) {
  const isStandalone = mode !== "phone";
  const [visible, setVisible] = useState(initialVisible);
  const [theme, setTheme] = useState<Theme>(() => {
    if (isTheme(initialTheme)) return initialTheme;
    return mode === "development" ? getDevelopmentTheme() : "light";
  });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (devMode) {
        setJobs(mockJobs);
      } else {
        setJobs(await fetchNui<Job[]>("getJobs", {}));
      }
    } catch (loadError) {
      console.error("Failed to load jobs", loadError);
      setError("Jobs could not be loaded. Try reopening Employment.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.visibility = "visible";
    document.body.style.visibility = "visible";

    if (devMode) {
      void loadJobs();
      return;
    }

    if (isStandalone) {
      void loadJobs();
      return;
    }

    const applyTheme = (settings: { display?: { theme?: string } }) => {
      if (isTheme(settings.display?.theme)) setTheme(settings.display.theme);
    };

    window.getSettings?.().then(applyTheme).catch((themeError) => {
      console.error("Failed to read phone theme", themeError);
    });
    window.onSettingsChange?.(applyTheme);
    void loadJobs();
  }, [isStandalone, loadJobs]);

  const closeStandalone = useCallback(async () => {
    if (mode === "development") return;
    await fetchNui("closeStandalone", {});
    setVisible(false);
  }, [mode]);

  useEffect(() => {
    if (!isStandalone) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && visible && !dialogOpen) void closeStandalone();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeStandalone, dialogOpen, isStandalone, visible]);

  useNuiEvent<{ visible: boolean; theme?: Theme }>("standalone:setVisible", (data) => {
    if (!isStandalone || !data) return;
    setVisible(data.visible);
    if (isTheme(data.theme)) setTheme(data.theme);
    if (data.visible) void loadJobs();
  });

  useNuiEvent("update-jobs", () => {
    void loadJobs();
  });

  const runAction = async (
    pending: Exclude<PendingAction, null>,
    event: "toggleDuty" | "changeJob" | "removeJob",
    data: unknown,
    updateMockJobs: (currentJobs: Job[]) => Job[],
  ) => {
    if (pendingAction) return;
    setPendingAction(pending);
    setError(null);

    try {
      if (devMode) {
        setJobs(updateMockJobs);
      } else {
        await fetchNui(event, data);
      }
    } catch (actionError) {
      console.error(`Failed to ${event}`, actionError);
      setError("That action could not be completed. Please try again.");
    } finally {
      setPendingAction(null);
    }
  };

  const activeJob = jobs.find((job) => job.active);

  if (!visible) return null;

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (mode === "standalone") void fetchNui("setStandaloneTheme", nextTheme);
  };

  return (
    <div
      className={
        isStandalone
          ? "standalone-frame fixed bottom-[2vh] right-[2vh] h-[min(58.5rem,94vh)] w-[min(29rem,92vw)] overflow-hidden rounded-[2.75rem] border-[0.55rem] border-neutral-950 bg-background shadow-2xl font-sans"
          : "h-full w-full font-sans"
      }
      data-theme={theme}
    >
      {isStandalone && (
        <div className="absolute right-5 top-4 z-40 flex gap-2 text-text">
          <button
            aria-label={theme === "dark" ? "Use light mode" : "Use dark mode"}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary shadow-md transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={toggleTheme}
            type="button"
          >
            <FontAwesomeIcon icon={theme === "dark" ? faSun : faMoon} />
          </button>
          {mode === "standalone" && (
            <button
              aria-label="Close Employment"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary shadow-md transition hover:scale-105 hover:bg-danger hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
              onClick={() => void closeStandalone()}
              type="button"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>
      )}
      <Employment
        error={error}
        isLoading={isLoading}
        jobs={jobs}
        onDialogChange={setDialogOpen}
        onDutyToggle={() =>
          activeJob
            ? runAction(
                { type: "duty", jobName: activeJob.jobName },
                "toggleDuty",
                {},
                (currentJobs) =>
                  currentJobs.map((job) =>
                    job.active ? { ...job, duty: !job.duty } : job,
                  ),
              )
            : Promise.resolve()
        }
        onJobRemove={(job) =>
          runAction(
            { type: "remove", jobName: job.jobName },
            "removeJob",
            job.jobName,
            (currentJobs) => currentJobs.filter((currentJob) => currentJob.jobName !== job.jobName),
          )
        }
        onJobSelect={(job) =>
          runAction(
            { type: "select", jobName: job.jobName },
            "changeJob",
            job.jobName,
            (currentJobs) =>
              currentJobs.map((currentJob) => ({
                ...currentJob,
                active: currentJob.jobName === job.jobName,
                duty: currentJob.jobName === job.jobName ? currentJob.duty : false,
              })),
          )
        }
        pendingAction={pendingAction}
      />
    </div>
  );
}
