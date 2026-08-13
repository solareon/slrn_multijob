import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("switches the development preview between light and dark themes", async () => {
    const user = userEvent.setup();
    render(<App />);

    const themeButton = await screen.findByRole("button", { name: "Dark mode" });
    const app = themeButton.closest("[data-theme]");
    expect(app).toHaveAttribute("data-theme", "light");

    await user.click(themeButton);
    expect(app).toHaveAttribute("data-theme", "dark");
    expect(themeButton).toHaveTextContent("Light mode");
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
