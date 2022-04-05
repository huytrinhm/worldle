import React, {
  ReactText,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import {
  countries,
  getCountryName,
  sanitizeCountryName,
} from "../domain/countries";
import { CountryInput } from "./CountryInput";
import * as geolib from "geolib";
import { Share } from "./Share";
import { Guesses } from "./Guesses";
import { useTranslation } from "react-i18next";
import { SettingsData } from "../hooks/useSettings";
import { useMode } from "../hooks/useMode";
import { usePractice } from "../hooks/usePractice";
import { Twemoji } from "@teuteuf/react-emoji-render";

const MAX_TRY_COUNT = 6;

interface PracticeProps {
  settingsData: SettingsData;
  updateSettings: (newSettings: Partial<SettingsData>) => void;
}

function randomString(length?: number): string {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < (length || 5); i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function getCurrentPracticeString(): string {
  let practiceString = localStorage.getItem("practiceString");
  if (practiceString == null) {
    practiceString = randomString();
    localStorage.setItem("practiceString", practiceString);
  }
  return practiceString;
}

export function Practice({ settingsData, updateSettings }: PracticeProps) {
  const { t, i18n } = useTranslation();

  const countryInputRef = useRef<HTMLInputElement>(null);

  const [practiceRandomString, setPracticeRandomString] = useState(
    getCurrentPracticeString()
  );

  const [todays, addGuess, randomAngle, imageScale] = usePractice(
    practiceRandomString,
    settingsData.countryListOnly
  );
  const { country, guesses } = todays;

  const [currentGuess, setCurrentGuess] = useState("");
  const [hideImageMode, setHideImageMode] = useMode(
    "practiceHideImageMode",
    practiceRandomString,
    settingsData.noImageMode
  );
  const [rotationMode, setRotationMode] = useMode(
    "practiceRotationMode",
    practiceRandomString,
    settingsData.rotationMode
  );

  const gameEnded =
    guesses.length === MAX_TRY_COUNT ||
    guesses[guesses.length - 1]?.distance === 0;

  const newGame = useCallback(() => {
    const newRandomString = randomString();
    localStorage.setItem("practiceString", newRandomString);
    setPracticeRandomString(newRandomString);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      if (country == null) {
        return;
      }
      e.preventDefault();
      const guessedCountry = countries.find(
        (country) =>
          sanitizeCountryName(
            getCountryName(i18n.resolvedLanguage, country)
          ) === sanitizeCountryName(currentGuess)
      );

      if (guessedCountry == null) {
        toast.error(t("unknownCountry"));
        return;
      }

      const newGuess = {
        name: currentGuess,
        distance: geolib.getDistance(guessedCountry, country),
        direction: geolib.getCompassDirection(
          guessedCountry,
          country,
          (origin, dest) =>
            Math.round(geolib.getRhumbLineBearing(origin, dest) / 45) * 45
        ),
      };

      addGuess(newGuess);
      setCurrentGuess("");

      if (newGuess.distance === 0) {
        toast.success(t("welldone"), { delay: 2000 });
      }
    },
    [addGuess, country, currentGuess, i18n.resolvedLanguage, t]
  );

  useEffect(() => {
    let toastId: ReactText;
    const { country, guesses } = todays;
    if (
      country &&
      guesses.length === MAX_TRY_COUNT &&
      guesses[guesses.length - 1].distance > 0
    ) {
      toastId = toast.info(
        getCountryName(i18n.resolvedLanguage, country).toUpperCase(),
        {
          autoClose: false,
          delay: 2000,
        }
      );
    }

    return () => {
      if (toastId != null) {
        toast.dismiss(toastId);
      }
    };
  }, [todays, i18n.resolvedLanguage]);

  return (
    <div className="flex-grow flex flex-col mx-2">
      {hideImageMode && !gameEnded && (
        <button
          className="border-2 uppercase my-2 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-slate-800 dark:active:bg-slate-700"
          type="button"
          onClick={() => setHideImageMode(false)}
        >
          <Twemoji
            text={t("showCountry")}
            options={{ className: "inline-block" }}
          />
        </button>
      )}
      <div className="flex my-1">
        {settingsData.allowShiftingDay && settingsData.shiftDayCount > 0 && (
          <button
            type="button"
            onClick={() =>
              updateSettings({
                shiftDayCount: Math.max(0, settingsData.shiftDayCount - 1),
              })
            }
          >
            <Twemoji text="↪️" className="text-xl" />
          </button>
        )}
        <img
          className={`pointer-events-none max-h-52 m-auto transition-transform duration-700 ease-in dark:invert ${
            hideImageMode && !gameEnded ? "h-0" : "h-full"
          }`}
          alt="country to guess"
          src={`images/countries/${country?.code.toLowerCase()}/vector.svg`}
          style={
            rotationMode && !gameEnded
              ? {
                  transform: `rotate(${randomAngle}deg) scale(${imageScale})`,
                }
              : {}
          }
        />
        {settingsData.allowShiftingDay && settingsData.shiftDayCount < 7 && (
          <button
            type="button"
            onClick={() =>
              updateSettings({
                shiftDayCount: Math.min(7, settingsData.shiftDayCount + 1),
              })
            }
          >
            <Twemoji text="↩️" className="text-xl" />
          </button>
        )}
      </div>
      {rotationMode && !hideImageMode && !gameEnded && (
        <button
          className="border-2 uppercase mb-2 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-slate-800 dark:active:bg-slate-700"
          type="button"
          onClick={() => setRotationMode(false)}
        >
          <Twemoji
            text={t("cancelRotation")}
            options={{ className: "inline-block" }}
          />
        </button>
      )}
      <Guesses
        rowCount={MAX_TRY_COUNT}
        guesses={guesses}
        settingsData={settingsData}
        countryInputRef={countryInputRef}
      />
      <div className="my-2">
        {gameEnded && country ? (
          <>
            <Share
              guesses={guesses}
              dayString={practiceRandomString}
              settingsData={settingsData}
              hideImageMode={hideImageMode}
              rotationMode={rotationMode}
            />
            <a
              className="underline w-full text-center block mt-4"
              href={`https://www.google.com/maps?q=${getCountryName(
                i18n.resolvedLanguage,
                country
              )}+${country.code.toUpperCase()}&hl=${i18n.resolvedLanguage}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twemoji
                text={t("showOnGoogleMaps")}
                options={{ className: "inline-block" }}
              />
            </a>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <CountryInput
                inputRef={countryInputRef}
                currentGuess={currentGuess}
                setCurrentGuess={setCurrentGuess}
              />
              <button
                className="rounded font-bold p-1 flex items-center justify-center border-2 uppercase my-0.5 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-slate-800 dark:active:bg-slate-700"
                type="submit"
              >
                <Twemoji
                  text="🌍"
                  options={{ className: "inline-block" }}
                  className="flex items-center justify-center"
                />{" "}
                <span className="ml-1">Practice</span>
              </button>
            </div>
          </form>
        )}
        <button
          className="w-full rounded font-bold p-1 flex items-center justify-center border-2 uppercase my-0.5 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-slate-800 dark:active:bg-slate-700"
          onClick={newGame}
        >
          <Twemoji
            text="🔄"
            options={{ className: "inline-block" }}
            className="flex items-center justify-center"
          />{" "}
          <span className="ml-1">New game</span>
        </button>
      </div>
    </div>
  );
}
