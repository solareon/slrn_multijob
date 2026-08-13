import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

describe("App", () => {
  it("switches the development preview between light and dark themes", async () => {
    const user = userEvent.setup();
    render(<App />);

    const themeButton = await screen.findByRole("button", { name: "Use dark mode" });
    const app = themeButton.closest("[data-theme]");
    expect(app).toHaveAttribute("data-theme", "light");

    await user.click(themeButton);
    expect(app).toHaveAttribute("data-theme", "dark");
    expect(themeButton).toHaveAccessibleName("Use light mode");
  });

  it("loads and saves the standalone KVP theme through NUI", async () => {
    const user = userEvent.setup();
    const fetchNui = vi.fn().mockResolvedValue(true);
    window.fetchNui = fetchNui;

    render(<App initialTheme="dark" mode="standalone" />);

    const themeButton = await screen.findByRole("button", { name: "Use light mode" });
    const app = themeButton.closest("[data-theme]");
    expect(app).toHaveAttribute("data-theme", "dark");

    await user.click(themeButton);
    expect(app).toHaveAttribute("data-theme", "light");
    expect(fetchNui).toHaveBeenCalledWith("setStandaloneTheme", "light");

    delete window.fetchNui;
  });

  it("refreshes the authoritative job list after an update-jobs message", async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByText("Emergency Medical Services");
    await user.click(screen.getByRole("button", { name: "Remove Emergency Medical Services" }));
    await user.click(screen.getByRole("button", { name: "Remove" }));

    await waitFor(() => {
      expect(screen.queryByText("Emergency Medical Services")).not.toBeInTheDocument();
    });

    window.dispatchEvent(new MessageEvent("message", { data: { action: "update-jobs" } }));
    expect(await screen.findByText("Emergency Medical Services")).toBeInTheDocument();
  });
});
