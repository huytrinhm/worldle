import { DateTime } from "luxon";
import { useCallback, useEffect, useMemo, useState } from "react";
import seedrandom from "seedrandom";
import {
  countriesWithImage,
  officialCountriesWithImage,
  Country,
} from "../domain/countries";
import {
  Guess,
  loadAllPracticeGuesses,
  savePracticeGuesses,
} from "../domain/guess";

export function getDayString(shiftDayCount?: number) {
  return DateTime.now()
    .plus({ days: shiftDayCount ?? 0 })
    .toFormat("yyyy-MM-dd");
}

export function usePractice(
  dayString: string,
  countryListOnly: boolean
): [
  {
    country?: Country;
    guesses: Guess[];
  },
  (guess: Guess) => void,
  number,
  number
] {
  const [todays, setTodays] = useState<{
    country?: Country;
    guesses: Guess[];
  }>({ guesses: [] });

  const addGuess = useCallback(
    (newGuess: Guess) => {
      if (todays == null) {
        return;
      }

      const newGuesses = [...todays.guesses, newGuess];

      setTodays((prev) => ({ country: prev.country, guesses: newGuesses }));
      savePracticeGuesses(dayString, newGuesses);
    },
    [dayString, todays]
  );

  useEffect(() => {
    const guesses = loadAllPracticeGuesses()[dayString] ?? [];
    const country = getCountry(dayString, countryListOnly);

    setTodays({ country, guesses });
  }, [dayString, countryListOnly]);

  const randomAngle = useMemo(
    () => seedrandom.alea(dayString)() * 360,
    [dayString]
  );

  const imageScale = useMemo(() => {
    const normalizedAngle = 45 - (randomAngle % 90);
    const radianAngle = (normalizedAngle * Math.PI) / 180;
    return 1 / (Math.cos(radianAngle) * Math.sqrt(2));
  }, [randomAngle]);
  return [todays, addGuess, randomAngle, imageScale];
}

function getCountry(dayString: string, countryListOnly: boolean) {
  return countryListOnly
    ? officialCountriesWithImage[
        Math.floor(
          seedrandom.alea(dayString)() * officialCountriesWithImage.length
        )
      ]
    : countriesWithImage[
        Math.floor(
          seedrandom.alea(dayString)() * officialCountriesWithImage.length
        )
      ];
}
