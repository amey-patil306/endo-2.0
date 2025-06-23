export interface SymptomEntry {
  // Based on your ML model parameters
  irregularPeriods: boolean;
  cramping: boolean;
  menstrualClots: boolean;
  infertility: boolean;
  chronicPain: boolean;
  diarrhea: boolean;
  longMenstruation: boolean;
  vomiting: boolean;
  migraines: boolean;
  extremeBloating: boolean;
  legPain: boolean;
  depression: boolean;
  fertilityIssues: boolean;
  ovarianCysts: boolean;
  painfulUrination: boolean;
  painAfterIntercourse: boolean;
  digestiveProblems: boolean;
  anemia: boolean;
  hipPain: boolean;
  vaginalPain: boolean;
  cysts: boolean;
  abnormalBleeding: boolean;
  hormonalProblems: boolean;
  feelingSick: boolean;
  abdominalCrampsIntercourse: boolean;
  insomnia: boolean;
  lossOfAppetite: boolean;
  notes?: string;
  date: string;
  timestamp: number;
}

export interface UserProgress {
  completedDays: number;
  totalDays: number;
  startDate: string;
  completedDates: string[];
}