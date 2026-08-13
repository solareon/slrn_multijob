import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBriefcase,
  faPowerOff,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useMemo, useState } from "react";
import type { Job, PendingAction } from "../types";
import { ConfirmationDialog } from "./ConfirmationDialog";

interface EmploymentProps {
  jobs: Job[];
  error: string | null;
  isLoading: boolean;
  pendingAction: PendingAction;
  onDutyToggle: () => Promise<void>;
  onJobSelect: (job: Job) => Promise<void>;
  onJobRemove: (job: Job) => Promise<void>;
}

function JobDetails({ job }: { job: Job }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-lg font-normal">{job.title}</p>
      <p className="mt-1 truncate text-sm font-light opacity-70">
        {job.gradeName} · Grade {job.gradeLevel}
      </p>
      <p className="mt-1 text-sm font-light opacity-70">
        ${job.salary.toLocaleString()} salary
      </p>
    </div>
  );
}

export function Employment({
  jobs,
  error,
  isLoading,
  pendingAction,
  onDutyToggle,
  onJobSelect,
  onJobRemove,
}: EmploymentProps) {
  const [jobToRemove, setJobToRemove] = useState<Job | null>(null);
  const activeJob = useMemo(() => jobs.find((job) => job.active), [jobs]);
  const otherJobs = useMemo(
    () => jobs.filter((job) => !job.active).sort((a, b) => a.title.localeCompare(b.title)),
    [jobs],
  );

  const actionPending = pendingAction !== null;

  const confirmRemove = async () => {
    if (!jobToRemove) return;
    await onJobRemove(jobToRemove);
    setJobToRemove(null);
  };

  return (
    <main className="flex h-full flex-col overflow-hidden bg-background px-6 pb-5 pt-16 text-text">
      <header className="shrink-0">
        <h1 className="text-left text-4xl font-extralight">Employment</h1>
        <p className="mt-1 text-left text-sm font-light opacity-60">Manage your positions and duty status</p>
      </header>

      <div className="mt-5 min-h-0 flex-1 overflow-y-auto pb-4">
        {error && (
          <div className="mb-4 rounded-xl border border-danger/40 bg-primary p-3 text-sm" role="alert">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3" aria-label="Loading jobs">
            <div className="h-52 animate-pulse rounded-3xl bg-primary" />
            <div className="h-24 animate-pulse rounded-xl bg-primary" />
            <div className="h-24 animate-pulse rounded-xl bg-primary" />
          </div>
        ) : (
          <>
            <section aria-labelledby="current-position-heading">
              <h2 className="mb-2 text-left text-sm font-light uppercase tracking-wider opacity-60" id="current-position-heading">
                Current position
              </h2>
              {activeJob ? (
                <div className="rounded-3xl bg-primary p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4 text-left">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary">
                        <FontAwesomeIcon icon={faBriefcase} />
                      </span>
                      <JobDetails job={activeJob} />
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${activeJob.duty ? "bg-success text-text" : "bg-background/80"}`}>
                      {activeJob.duty ? "On duty" : "Off duty"}
                    </span>
                  </div>
                  <div className="mt-5 flex gap-2">
                    <button
                      className="flex w-2/3 items-center justify-center gap-2 rounded-2xl bg-background px-3 py-4 transition hover:scale-[1.02] hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-wait disabled:opacity-50"
                      disabled={actionPending}
                      onClick={() => void onDutyToggle()}
                      type="button"
                    >
                      <FontAwesomeIcon icon={faPowerOff} />
                      {pendingAction?.type === "duty"
                        ? "Updating…"
                        : activeJob.duty
                          ? "Go off duty"
                          : "Go on duty"}
                    </button>
                    <button
                      aria-label={`Remove ${activeJob.title}`}
                      className="flex w-1/3 items-center justify-center rounded-2xl bg-background px-3 py-4 transition hover:scale-[1.02] hover:bg-danger hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={actionPending}
                      onClick={() => setJobToRemove(activeJob)}
                      title={`Remove ${activeJob.title}`}
                      type="button"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl bg-primary p-6 text-center shadow-sm">
                  <FontAwesomeIcon className="mb-3 text-2xl opacity-50" icon={faBriefcase} />
                  <p className="text-lg">No active job</p>
                  <p className="mt-1 text-sm font-light opacity-65">Select one of your saved jobs below.</p>
                </div>
              )}
            </section>

            <section className="mt-6" aria-labelledby="saved-positions-heading">
              <div className="mb-2 flex items-end justify-between">
                <h2 className="text-left text-sm font-light uppercase tracking-wider opacity-60" id="saved-positions-heading">
                  Other positions
                </h2>
                <span className="text-xs font-light opacity-50">{otherJobs.length} saved</span>
              </div>
              {otherJobs.length > 0 ? (
                <div className="space-y-2">
                  {otherJobs.map((job) => {
                    const selecting = pendingAction?.type === "select" && pendingAction.jobName === job.jobName;
                    return (
                      <article className="flex items-center gap-3 rounded-xl bg-primary p-4 shadow-sm" key={job.jobName}>
                        <div className="min-w-0 flex-1 text-left">
                          <JobDetails job={job} />
                        </div>
                        <button
                          aria-label={`Select ${job.title}`}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-background transition hover:scale-105 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-wait disabled:opacity-50"
                          disabled={actionPending}
                          onClick={() => void onJobSelect(job)}
                          title={`Select ${job.title}`}
                          type="button"
                        >
                          <FontAwesomeIcon className={selecting ? "animate-pulse" : ""} icon={faArrowRight} />
                        </button>
                        <button
                          aria-label={`Remove ${job.title}`}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-background transition hover:scale-105 hover:bg-danger hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={actionPending}
                          onClick={() => setJobToRemove(job)}
                          title={`Remove ${job.title}`}
                          type="button"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl bg-primary p-5 text-center text-sm font-light opacity-75">
                  No other saved jobs.
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {jobToRemove && (
        <ConfirmationDialog
          isPending={pendingAction?.type === "remove" && pendingAction.jobName === jobToRemove.jobName}
          jobTitle={jobToRemove.title}
          onCancel={() => setJobToRemove(null)}
          onConfirm={() => void confirmRemove()}
        />
      )}
    </main>
  );
}
