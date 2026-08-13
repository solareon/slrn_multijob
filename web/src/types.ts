export type Theme = "light" | "dark";
export type AppMode = "development" | "phone" | "standalone";

export interface Job {
  jobName: string;
  title: string;
  gradeName: string;
  gradeLevel: number;
  salary: number;
  active: boolean;
  duty: boolean;
}

export type PendingAction =
  | { type: "duty"; jobName: string }
  | { type: "select"; jobName: string }
  | { type: "remove"; jobName: string }
  | null;
