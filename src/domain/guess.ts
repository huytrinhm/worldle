import { Direction } from "./geography";

export interface Guess {
  name: string;
  distance: number;
  direction: Direction;
}

export function loadAllGuesses(): Record<string, Guess[]> {
  const storedGuesses = localStorage.getItem("guesses");
  return storedGuesses != null ? JSON.parse(storedGuesses) : {};
}

export function saveGuesses(dayString: string, guesses: Guess[]): void {
  const allGuesses = loadAllGuesses();
  localStorage.setItem(
    "guesses",
    JSON.stringify({
      ...allGuesses,
      [dayString]: guesses,
    })
  );
}

export function loadAllPracticeGuesses(): Record<string, Guess[]> {
  const storedGuesses = localStorage.getItem("practiceGuesses");
  return storedGuesses != null ? JSON.parse(storedGuesses) : {};
}

export function savePracticeGuesses(dayString: string, guesses: Guess[]): void {
  const allGuesses = loadAllPracticeGuesses();
  localStorage.setItem(
    "practiceGuesses",
    JSON.stringify({
      ...allGuesses,
      [dayString]: guesses,
    })
  );
}
