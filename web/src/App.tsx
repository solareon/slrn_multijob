import { useCallback, useEffect, useState } from "react";
import { Employment } from "./components/Employment";
import { useNuiEvent } from "./hooks/useNuiEvent";
import type { Job, PendingAction, Theme } from "./types";

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

export default function App() {
  const [theme, setTheme] = useState<Theme>("light");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (devMode) {
        setJobs(mockJobs);
      } else {
        if (!window.fetchNui) throw new Error("LB Phone components are unavailable.");
        setJobs(await window.fetchNui<Job[]>("getJobs", {}));
      }
    } catch (loadError) {
      console.error("Failed to load jobs", loadError);
      setError("Jobs could not be loaded. Try reopening Employment.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (devMode) {
      document.documentElement.style.visibility = "visible";
      document.body.style.visibility = "visible";
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
  }, [loadJobs]);

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
        if (!window.fetchNui) throw new Error("LB Phone components are unavailable.");
        await window.fetchNui(event, data);
      }
    } catch (actionError) {
      console.error(`Failed to ${event}`, actionError);
      setError("That action could not be completed. Please try again.");
    } finally {
      setPendingAction(null);
    }
  };

  const activeJob = jobs.find((job) => job.active);

  return (
    <div
      className={
        devMode
          ? "absolute inset-0 m-auto h-[58.5rem] w-[29rem] overflow-hidden shadow-2xl font-sans"
          : "h-full w-full font-sans"
      }
      data-theme={theme}
    >
      {devMode && (
        <button
          className="absolute right-3 top-3 z-40 rounded-lg bg-primary px-3 py-2 text-xs text-text shadow-md"
          onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
          type="button"
        >
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      )}
      <Employment
        error={error}
        isLoading={isLoading}
        jobs={jobs}
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
