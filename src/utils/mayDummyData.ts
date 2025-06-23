import { SymptomEntry, UserProgress } from '../types';

// Generate comprehensive dummy data for May 2024
export const generateMayDummyData = (userId: string): { entries: SymptomEntry[], progress: UserProgress } => {
  const entries: SymptomEntry[] = [];
  const year = 2024;
  const month = 4; // May (0-indexed)
  const daysInMay = 31;
  
  // Simulate a realistic menstrual cycle starting around May 3rd
  const cycleStartDay = 3;
  const cycleLength = 28;
  
  for (let day = 1; day <= daysInMay; day++) {
    const date = new Date(year, month, day);
    const dateString = date.toISOString().split('T')[0];
    
    // Calculate cycle day
    const daysSinceCycleStart = day >= cycleStartDay ? day - cycleStartDay : day + (cycleLength - cycleStartDay);
    const cycleDay = (daysSinceCycleStart % cycleLength) + 1;
    
    // Define cycle phases
    const isMenstrualPhase = cycleDay <= 7; // Days 1-7
    const isFollicularPhase = cycleDay >= 8 && cycleDay <= 13; // Days 8-13
    const isOvulationPhase = cycleDay >= 14 && cycleDay <= 16; // Days 14-16
    const isLutealPhase = cycleDay >= 17; // Days 17-28
    
    // Symptom probabilities based on cycle phase
    const getSymptomProbability = (baseProb: number, menstrualMultiplier = 2, ovulationMultiplier = 1.3, lutealMultiplier = 1.5) => {
      if (isMenstrualPhase) return Math.min(0.9, baseProb * menstrualMultiplier);
      if (isOvulationPhase) return Math.min(0.8, baseProb * ovulationMultiplier);
      if (isLutealPhase) return Math.min(0.7, baseProb * lutealMultiplier);
      return baseProb;
    };
    
    // Generate realistic notes based on cycle phase and symptoms
    const generateNotes = (): string => {
      const notes: string[] = [];
      
      if (isMenstrualPhase) {
        const menstrualNotes = [
          "Heavy flow today, using extra protection",
          "Severe cramps in the morning, better after pain relief",
          "Feeling very tired, took a nap",
          "Lower back pain radiating down legs",
          "Mood swings, feeling emotional",
          "Bloating and water retention",
          "Headache with period",
          "Clots noticed during heavy flow",
          "Pain worse at night",
          "Used heating pad for relief"
        ];
        return menstrualNotes[Math.floor(Math.random() * menstrualNotes.length)];
      }
      
      if (isOvulationPhase) {
        const ovulationNotes = [
          "Sharp pain on right side - ovulation?",
          "Increased energy today",
          "Mild cramping mid-cycle",
          "Feeling more positive",
          "Some bloating but manageable",
          "Clear discharge noticed",
          "Slight breast tenderness",
          "Good day overall"
        ];
        return ovulationNotes[Math.floor(Math.random() * ovulationNotes.length)];
      }
      
      if (isLutealPhase) {
        const lutealNotes = [
          "PMS symptoms starting",
          "Feeling irritable and anxious",
          "Breast tenderness increasing",
          "Craving sweets and carbs",
          "Trouble sleeping, restless",
          "Mild cramping, period approaching",
          "Skin breaking out",
          "Feeling bloated and uncomfortable",
          "Mood dips in afternoon",
          "Fatigue setting in"
        ];
        return lutealNotes[Math.floor(Math.random() * lutealNotes.length)];
      }
      
      // Follicular phase
      const follicularNotes = [
        "Feeling good today, energy returning",
        "Mood improving after period",
        "Skin looking clearer",
        "Minimal symptoms today",
        "Good sleep last night",
        "Exercise felt easier",
        "Positive outlook",
        "No significant symptoms"
      ];
      return follicularNotes[Math.floor(Math.random() * follicularNotes.length)];
    };
    
    const entry: SymptomEntry = {
      // Menstrual symptoms - highest during menstrual phase
      irregularPeriods: Math.random() < 0.15, // Occasional irregularity
      menstrualClots: isMenstrualPhase && Math.random() < 0.7,
      longMenstruation: isMenstrualPhase && Math.random() < 0.4,
      abnormalBleeding: Math.random() < getSymptomProbability(0.2, 1.5, 1, 1),
      
      // Pain symptoms - vary by cycle phase
      cramping: Math.random() < getSymptomProbability(0.3, 3, 1.5, 2),
      chronicPain: Math.random() < getSymptomProbability(0.25, 2.5, 1.2, 1.8),
      legPain: Math.random() < getSymptomProbability(0.2, 2, 1, 1.5),
      hipPain: Math.random() < getSymptomProbability(0.18, 2.2, 1, 1.3),
      vaginalPain: Math.random() < getSymptomProbability(0.15, 2, 1.3, 1.2),
      painfulUrination: Math.random() < getSymptomProbability(0.12, 1.8, 1, 1),
      painAfterIntercourse: Math.random() < getSymptomProbability(0.2, 1.5, 1.2, 1.3),
      abdominalCrampsIntercourse: Math.random() < getSymptomProbability(0.15, 1.5, 1.2, 1.2),
      
      // Digestive symptoms - often worse during menstruation
      diarrhea: Math.random() < getSymptomProbability(0.2, 2.5, 1, 1.3),
      vomiting: Math.random() < getSymptomProbability(0.08, 3, 1, 1.2),
      extremeBloating: Math.random() < getSymptomProbability(0.4, 2, 1.2, 2.2),
      digestiveProblems: Math.random() < getSymptomProbability(0.3, 2.2, 1.1, 1.8),
      lossOfAppetite: Math.random() < getSymptomProbability(0.15, 2, 1, 1.5),
      feelingSick: Math.random() < getSymptomProbability(0.2, 2.5, 1, 1.4),
      
      // General health symptoms
      migraines: Math.random() < getSymptomProbability(0.25, 2.5, 1.2, 1.8),
      depression: Math.random() < getSymptomProbability(0.2, 2, 1, 2.5),
      insomnia: Math.random() < getSymptomProbability(0.25, 1.8, 1.1, 2.2),
      anemia: Math.random() < getSymptomProbability(0.1, 1.5, 1, 1),
      
      // Reproductive health symptoms
      infertility: Math.random() < 0.05, // Rare, consistent
      fertilityIssues: Math.random() < 0.1, // Slightly more common
      ovarianCysts: Math.random() < getSymptomProbability(0.15, 1.2, 1.5, 1.3),
      cysts: Math.random() < getSymptomProbability(0.12, 1.2, 1.4, 1.2),
      hormonalProblems: Math.random() < getSymptomProbability(0.3, 1.5, 1.2, 2),
      
      // Metadata
      date: dateString,
      timestamp: date.getTime(),
      notes: Math.random() < 0.7 ? generateNotes() : '' // 70% chance of notes
    };
    
    entries.push(entry);
  }
  
  // Generate progress data
  const completedDates = entries.map(e => e.date);
  const progress: UserProgress = {
    completedDays: entries.length,
    totalDays: 31, // May has 31 days
    startDate: '2024-05-01',
    completedDates
  };
  
  return { entries, progress };
};

// Generate specific May scenarios
export const mayScenarios = {
  highRisk: {
    name: "May 2024 - High Risk Pattern",
    description: "Complete May data showing high endometriosis risk with severe symptoms",
    generator: (userId: string) => {
      const { entries, progress } = generateMayDummyData(userId);
      
      // Enhance entries for high risk pattern
      const enhancedEntries = entries.map(entry => {
        const date = new Date(entry.date);
        const day = date.getDate();
        const cycleDay = ((day - 3 + 28) % 28) + 1;
        const isMenstrualPhase = cycleDay <= 7;
        const isLutealPhase = cycleDay >= 17;
        
        return {
          ...entry,
          // Increase core endometriosis symptoms
          cramping: entry.cramping || Math.random() < 0.8,
          chronicPain: entry.chronicPain || Math.random() < 0.7,
          extremeBloating: entry.extremeBloating || Math.random() < 0.6,
          painAfterIntercourse: entry.painAfterIntercourse || Math.random() < 0.5,
          ovarianCysts: entry.ovarianCysts || Math.random() < 0.4,
          depression: entry.depression || (isLutealPhase && Math.random() < 0.6),
          migraines: entry.migraines || (isMenstrualPhase && Math.random() < 0.7),
          digestiveProblems: entry.digestiveProblems || Math.random() < 0.5,
          notes: entry.notes || (Math.random() < 0.5 ? "Severe pain day, had to rest" : "")
        };
      });
      
      return { entries: enhancedEntries, progress };
    }
  },
  
  moderateRisk: {
    name: "May 2024 - Moderate Risk Pattern", 
    description: "Complete May data showing moderate symptoms with some concerning patterns",
    generator: (userId: string) => {
      const { entries, progress } = generateMayDummyData(userId);
      
      // Moderate enhancement - some symptoms but not overwhelming
      const enhancedEntries = entries.map(entry => {
        const date = new Date(entry.date);
        const day = date.getDate();
        const cycleDay = ((day - 3 + 28) % 28) + 1;
        const isMenstrualPhase = cycleDay <= 7;
        
        return {
          ...entry,
          cramping: entry.cramping || (isMenstrualPhase && Math.random() < 0.6),
          chronicPain: entry.chronicPain || Math.random() < 0.4,
          extremeBloating: entry.extremeBloating || Math.random() < 0.4,
          irregularPeriods: Math.random() < 0.2,
          migraines: entry.migraines || Math.random() < 0.3,
        };
      });
      
      return { entries: enhancedEntries, progress };
    }
  },
  
  lowRisk: {
    name: "May 2024 - Low Risk Pattern",
    description: "Complete May data with minimal symptoms, mostly normal cycle",
    generator: (userId: string) => {
      const { entries, progress } = generateMayDummyData(userId);
      
      // Reduce symptoms for low risk
      const enhancedEntries = entries.map(entry => {
        const date = new Date(entry.date);
        const day = date.getDate();
        const cycleDay = ((day - 3 + 28) % 28) + 1;
        const isMenstrualPhase = cycleDay <= 7;
        
        return {
          ...entry,
          // Keep only mild, normal cycle symptoms
          cramping: isMenstrualPhase && Math.random() < 0.3,
          chronicPain: false,
          extremeBloating: Math.random() < 0.2,
          painAfterIntercourse: false,
          ovarianCysts: false,
          depression: Math.random() < 0.1,
          migraines: Math.random() < 0.15,
          digestiveProblems: Math.random() < 0.2,
          notes: entry.notes && Math.random() < 0.3 ? "Mild symptoms, manageable" : ""
        };
      });
      
      return { entries: enhancedEntries, progress };
    }
  }
};

// Quick access function for May data
export const getMayDummyData = (scenario: 'highRisk' | 'moderateRisk' | 'lowRisk' = 'moderateRisk', userId: string) => {
  return mayScenarios[scenario].generator(userId);
};