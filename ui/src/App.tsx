import React, { useEffect, useRef, useState } from "react";
import { useNuiEvent } from "./hooks/useNuiEvent";
import "./App.css";

const devMode = !window?.["invokeNative"];

const App = () => {
  const [theme, setTheme] = useState("light");
  const appDiv = useRef(null);

  const {
    setPopUp,
    fetchNui,
    sendNotification,
    getSettings,
    onSettingsChange,
  } = window as any;
  const [currentPage, setCurrentPage] = useState("GroupDashboard");
  const { inGroup, currentGroup } = useGroupStore();
  const { playerData } = usePlayerDataStore();

  useEffect(() => {
    if (devMode) {
      document.getElementsByTagName("html")[0].style.visibility = "visible";
      document.getElementsByTagName("body")[0].style.visibility = "visible";
      return;
    } else {
      getSettings().then((settings: any) => setTheme(settings.display.theme));
      onSettingsChange((settings: any) => setTheme(settings.display.theme));
    }
  }, [theme]);

  useEffect(() => {
    if (!inGroup) {
      setCurrentPage("GroupDashboard");
    }
  }, [inGroup]);

  useNuiEvent("startJob", () => {
    setCurrentPage("GroupJob");
  });

  useNuiEvent("sendNotification", (data: any) => {
    sendNotification(data);
  });

  useNuiEvent("phoneNotification", (data: any) => {
    setPopUp({
      title: data.PhoneNotify.title,
      description: data.PhoneNotify.text,
      buttons: [
        {
          title: data.PhoneNotify.deny,
          color: "red",
          cb: () => {
            $.post(
              "https://slrn_groups/AnsweredNotify",
              JSON.stringify({
                type: "failure",
              })
            );
          },
        },
        {
          title: data.PhoneNotify.accept,
          color: "blue",
          cb: () => {
            $.post(
              "https://slrn_groups/AnsweredNotify",
              JSON.stringify({
                type: "success",
              })
            );
          },
        },
      ],
    });
  });

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <AppProvider>
      <div
        className="size-full text-center text-text gap-4 bg-background h-screen p-4 px-6"
        ref={appDiv}
        data-theme={theme}
      >
        {devMode && (
          <button onClick={toggleTheme} className="w-full rounded-m">
            Toggle Theme
          </button>
        )}
        <div>&nbsp;</div>
        <div className="text-left text-4xl font-extralight mt-6 mb-2 pt-2">Groups</div>
        {currentPage === "GroupDashboard" && (
          <GroupDashboard
            setCurrentPage={setCurrentPage} fetchNui={fetchNui}
          />
        )}
        {currentPage === "GroupJob" && (
          <GroupJob setCurrentPage={setCurrentPage} fetchNui={fetchNui}/>
        )}
      </div>
      <DataHandler />
    </AppProvider>
  );
};

const AppProvider: React.FC = ({ children }) => {
  if (devMode) {
    return (
      <div className="absolute bottom-0 top-0 left-0 right-0 m-auto w-[29rem] h-[58.5rem]">
        {children}
      </div>
    );
  } else return children;
};

export default App;
