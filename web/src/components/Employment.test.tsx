import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Job } from "../types";
import { Employment } from "./Employment";

const jobs: Job[] = [
  {
    jobName: "police",
    title: "Police",
    gradeName: "Officer",
    gradeLevel: 2,
    salary: 800,
    active: true,
    duty: false,
  },
  {
    jobName: "mechanic",
    title: "Mechanic",
    gradeName: "Technician",
    gradeLevel: 1,
    salary: 500,
    active: false,
    duty: false,
  },
];

function renderEmployment(overrides = {}) {
  const props = {
    jobs,
    error: null,
    isLoading: false,
    pendingAction: null,
    onDutyToggle: vi.fn().mockResolvedValue(undefined),
    onJobSelect: vi.fn().mockResolvedValue(undefined),
    onJobRemove: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };

  render(<Employment {...props} />);
  return props;
}

describe("Employment", () => {
  it("shows the current job and selects a saved job", async () => {
    const user = userEvent.setup();
    const props = renderEmployment();

    expect(screen.getByText("Police")).toBeInTheDocument();
    expect(screen.getByText("$800 salary")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Select Mechanic" }));
    expect(props.onJobSelect).toHaveBeenCalledWith(jobs[1]);
  });

  it("toggles duty", async () => {
    const user = userEvent.setup();
    const props = renderEmployment();

    await user.click(screen.getByRole("button", { name: "Go on duty" }));
    expect(props.onDutyToggle).toHaveBeenCalledOnce();
  });

  it("requires confirmation before removing a job", async () => {
    const user = userEvent.setup();
    const props = renderEmployment();

    await user.click(screen.getByRole("button", { name: "Remove Mechanic" }));
    expect(screen.getByRole("dialog", { name: "Remove job?" })).toBeInTheDocument();
    expect(props.onJobRemove).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remove Mechanic" }));
    await user.click(screen.getByRole("button", { name: "Remove" }));
    expect(props.onJobRemove).toHaveBeenCalledWith(jobs[1]);
  });

  it("renders empty states", () => {
    renderEmployment({ jobs: [] });

    expect(screen.getByText("No active job")).toBeInTheDocument();
    expect(screen.getByText("No other saved jobs.")).toBeInTheDocument();
  });
});
