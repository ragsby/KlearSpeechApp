
export interface ExercisesState {
  neck: boolean[];
  breathing: boolean;
  abdominal: boolean;
  cv: boolean;
  bv: boolean;
  vowel: boolean;
  phonation: boolean;
  stepPhonation: boolean;
}

export interface CompletedDays {
  [key: string]: boolean;
}