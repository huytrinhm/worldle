import { ToastContainer, Flip, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Game } from "./components/Game";
import { Practice } from "./components/Practice";
import React, { useEffect, useState } from "react";
import { Infos } from "./components/panels/Infos";
import { useTranslation } from "react-i18next";
import { Settings } from "./components/panels/Settings";
import { useSettings } from "./hooks/useSettings";
import { Stats } from "./components/panels/Stats";
import { useReactPWAInstall } from "@teuteuf/react-pwa-install";
import { InstallButton } from "./components/InstallButton";
import { Twemoji } from "@teuteuf/react-emoji-render";
import {
  LocalStoragePersistenceService,
  ServiceWorkerUpdaterProps,
  withServiceWorkerUpdater,
} from "@3m1/service-worker-updater";

function App({
  newServiceWorkerDetected,
  onLoadNewServiceWorkerAccept,
}: ServiceWorkerUpdaterProps) {
  const { t } = useTranslation();

  const { pwaInstall, supported, isInstalled } = useReactPWAInstall();

  const [infoOpen, setInfoOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false);

  const [settingsData, updateSettings] = useSettings();

  useEffect(() => {
    if (newServiceWorkerDetected) {
      toast.info(
        <div dangerouslySetInnerHTML={{ __html: t("newVersion") }} />,
        {
          autoClose: false,
          onClose: () => onLoadNewServiceWorkerAccept(),
        }
      );
    }
  }, [newServiceWorkerDetected, onLoadNewServiceWorkerAccept, t]);

  useEffect(() => {
    if (settingsData.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settingsData.theme]);

  return (
    <>
      <ToastContainer
        hideProgressBar
        position="top-center"
        transition={Flip}
        theme={settingsData.theme}
        autoClose={2000}
        bodyClassName="font-bold text-center"
      />
      <Infos
        isOpen={infoOpen}
        close={() => setInfoOpen(false)}
        settingsData={settingsData}
      />
      <Settings
        isOpen={settingsOpen}
        close={() => setSettingsOpen(false)}
        settingsData={settingsData}
        updateSettings={updateSettings}
      />
      <Stats
        isOpen={statsOpen}
        close={() => setStatsOpen(false)}
        distanceUnit={settingsData.distanceUnit}
      />
      <div className="flex justify-center flex-auto dark:bg-slate-900 dark:text-slate-50">
        <div className="w-full max-w-lg flex flex-col">
          <header className="border-b-2 px-3 border-gray-200 flex">
            <button
              className="mr-3 text-xl"
              type="button"
              onClick={() => setInfoOpen(true)}
            >
              <Twemoji text="❓" />
            </button>
            {supported() && !isInstalled() && (
              <InstallButton pwaInstall={pwaInstall} />
            )}
            <h1 className="text-4xl font-bold uppercase tracking-wide text-center my-1 flex-auto">
              Wor<span className="text-green-600">l</span>dle
            </h1>
            {!practiceOpen ? (
              <button
                className="ml-3 text-xl"
                type="button"
                onClick={() => setPracticeOpen(true)}
              >
                <Twemoji text="💪" />
              </button>
            ) : (
              <button
                className="ml-3 text-xl"
                type="button"
                onClick={() => setPracticeOpen(false)}
              >
                <Twemoji text="📅" />
              </button>
            )}

            <button
              className="ml-3 text-xl"
              type="button"
              onClick={() => setStatsOpen(true)}
            >
              <Twemoji text="📈" />
            </button>
            <button
              className="ml-3 text-xl"
              type="button"
              onClick={() => setSettingsOpen(true)}
            >
              <Twemoji text="⚙️" />
            </button>
          </header>
          {!practiceOpen ? (
            <Game settingsData={settingsData} updateSettings={updateSettings} />
          ) : (
            <Practice
              settingsData={settingsData}
              updateSettings={updateSettings}
            />
          )}
          <footer className="flex justify-center items-center text-sm mt-8 mb-1">
            <p className="mr-1">
              Made by{" "}
              <a
                className="underline"
                href="https://huytrinhm.me"
                target="_blank"
                rel="noopener noreferrer"
              >
                huytrinhm
              </a>{" "}
              with
            </p>
            <Twemoji
              text="❤️"
              className="flex items-center justify-center mr-1"
            />
          </footer>
        </div>
      </div>
    </>
  );
}

export default withServiceWorkerUpdater(App, {
  persistenceService: new LocalStoragePersistenceService("worldle"),
});
