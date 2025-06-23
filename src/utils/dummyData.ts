import { SymptomEntry, UserProgress } from '../types';

// Generate dummy symptom entries for testing
export const generateDummySymptomEntries = (userId: string, numberOfDays: number = 15): SymptomEntry[] => {
  const entries: SymptomEntry[] = [];
  const today = new Date();
  
  // Create entries for the past numberOfDays
  for (let i = numberOfDays - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    // Create realistic symptom patterns
    const dayOfCycle = (i % 28) + 1; // Simulate 28-day cycle
    const isNearPeriod = dayOfCycle <= 7 || dayOfCycle >= 25;
    const isMidCycle = dayOfCycle >= 12 && dayOfCycle <= 16;
    
    // Higher probability of symptoms during certain cycle phases
    const baseSymptomChance = 0.3;
    const periodSymptomChance = 0.7;
    const midCycleChance = 0.4;
    
    const getSymptomChance = (baseChance: number) => {
      if (isNearPeriod) return Math.min(periodSymptomChance, baseChance + 0.4);
      if (isMidCycle) return Math.min(midCycleChance, baseChance + 0.1);
      return baseChance;
    };
    
    const entry: SymptomEntry = {
      // Menstrual symptoms - more likely during period
      irregularPeriods: Math.random() < getSymptomChance(0.2),
      menstrualClots: isNearPeriod && Math.random() < 0.6,
      longMenstruation: isNearPeriod && Math.random() < 0.4,
      abnormalBleeding: Math.random() < getSymptomChance(0.25),
      
      // Pain symptoms - common throughout cycle
      cramping: Math.random() < getSymptomChance(0.5),
      chronicPain: Math.random() < getSymptomChance(0.4),
      legPain: Math.random() < getSymptomChance(0.3),
      hipPain: Math.random() < getSymptomChance(0.25),
      vaginalPain: Math.random() < getSymptomChance(0.3),
      painfulUrination: Math.random() < getSymptomChance(0.2),
      painAfterIntercourse: Math.random() < getSymptomChance(0.3),
      abdominalCrampsIntercourse: Math.random() < getSymptomChance(0.25),
      
      // Digestive symptoms
      diarrhea: Math.random() < getSymptomChance(0.3),
      vomiting: Math.random() < getSymptomChance(0.15),
      extremeBloating: Math.random() < getSymptomChance(0.45),
      digestiveProblems: Math.random() < getSymptomChance(0.35),
      lossOfAppetite: Math.random() < getSymptomChance(0.2),
      feelingSick: Math.random() < getSymptomChance(0.25),
      
      // General health symptoms
      migraines: Math.random() < getSymptomChance(0.3),
      depression: Math.random() < getSymptomChance(0.25),
      insomnia: Math.random() < getSymptomChance(0.3),
      anemia: Math.random() < getSymptomChance(0.15),
      
      // Reproductive health
      infertility: Math.random() < 0.1, // Less common
      fertilityIssues: Math.random() < 0.15,
      ovarianCysts: Math.random() < 0.2,
      cysts: Math.random() < 0.15,
      hormonalProblems: Math.random() < getSymptomChance(0.3),
      
      // Metadata
      date: dateString,
      timestamp: date.getTime(),
      notes: generateRandomNotes(dayOfCycle, isNearPeriod)
    };
    
    entries.push(entry);
  }
  
  return entries;
};

// Generate realistic notes based on symptoms
const generateRandomNotes = (dayOfCycle: number, isNearPeriod: boolean): string => {
  const notes = [
    "Feeling tired today",
    "Pain was manageable with heat therapy",
    "Had to take pain medication",
    "Symptoms worse in the morning",
    "Feeling better after rest",
    "Stress seems to make symptoms worse",
    "Good day overall",
    "Symptoms interfered with work",
    "Tried yoga, helped a bit",
    "Heavy flow today",
    "Cramps woke me up",
    "Feeling emotional",
    ""
  ];
  
  if (isNearPeriod) {
    const periodNotes = [
      "Heavy bleeding today",
      "Severe cramps, stayed in bed",
      "Used heating pad all day",
      "Flow lighter than usual",
      "Clots noticed",
      "Pain radiating to back",
      ""
    ];
    return periodNotes[Math.floor(Math.random() * periodNotes.length)];
  }
  
  return notes[Math.floor(Math.random() * notes.length)];
};

// Generate dummy user progress
export const generateDummyUserProgress = (completedDays: number): UserProgress => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - completedDays);
  
  const completedDates: string[] = [];
  for (let i = 0; i < completedDays; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    completedDates.push(date.toISOString().split('T')[0]);
  }
  
  return {
    completedDays,
    totalDays: 20,
    startDate: startDate.toISOString().split('T')[0],
    completedDates
  };
};

// Predefined user profiles for different scenarios
export const dummyUserProfiles = {
  highRisk: {
    name: "High Risk Profile",
    description: "User with many symptoms suggesting high endometriosis risk",
    entries: (userId: string) => {
      const entries = generateDummySymptomEntries(userId, 15);
      // Increase symptom frequency for high risk profile
      return entries.map(entry => ({
        ...entry,
        cramping: true,
        chronicPain: true,
        extremeBloating: Math.random() < 0.8,
        irregularPeriods: Math.random() < 0.7,
        painAfterIntercourse: Math.random() < 0.6,
        ovarianCysts: Math.random() < 0.5,
        depression: Math.random() < 0.6,
        migraines: Math.random() < 0.7
      }));
    }
  },
  
  moderateRisk: {
    name: "Moderate Risk Profile", 
    description: "User with some symptoms suggesting moderate risk",
    entries: (userId: string) => {
      const entries = generateDummySymptomEntries(userId, 12);
      return entries.map(entry => ({
        ...entry,
        cramping: Math.random() < 0.6,
        chronicPain: Math.random() < 0.4,
        extremeBloating: Math.random() < 0.5,
        irregularPeriods: Math.random() < 0.4
      }));
    }
  },
  
  lowRisk: {
    name: "Low Risk Profile",
    description: "User with minimal symptoms suggesting low risk", 
    entries: (userId: string) => {
      const entries = generateDummySymptomEntries(userId, 10);
      return entries.map(entry => ({
        ...entry,
        cramping: Math.random() < 0.3,
        chronicPain: Math.random() < 0.2,
        extremeBloating: Math.random() < 0.3,
        irregularPeriods: false,
        painAfterIntercourse: false,
        ovarianCysts: false
      }));
    }
  }
};

// Sample prediction results for different risk levels
export const dummyPredictionResults = {
  high: {
    prediction: 1,
    prediction_label: "Endometriosis",
    confidence: 0.85,
    probabilities: {
      no_endometriosis: 0.15,
      endometriosis: 0.85
    },
    risk_level: "High",
    message: "The model suggests a high risk of endometriosis. Please consult with a healthcare professional for proper diagnosis."
  },
  
  moderate: {
    prediction: 0,
    prediction_label: "No Endometriosis", 
    confidence: 0.55,
    probabilities: {
      no_endometriosis: 0.55,
      endometriosis: 0.45
    },
    risk_level: "Moderate",
    message: "The model suggests a moderate risk. Consider consulting with a healthcare professional to discuss your symptoms."
  },
  
  low: {
    prediction: 0,
    prediction_label: "No Endometriosis",
    confidence: 0.80,
    probabilities: {
      no_endometriosis: 0.80,
      endometriosis: 0.20
    },
    risk_level: "Low", 
    message: "The model suggests a low likelihood of endometriosis based on the provided symptoms."
  }
};