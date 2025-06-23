import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  updateDoc 
} from 'firebase/firestore';
import { db } from './config';
import { SymptomEntry, UserProgress } from '../types';

// Save symptom entry
export const saveSymptomEntry = async (userId: string, entry: SymptomEntry): Promise<void> => {
  const docRef = doc(db, 'users', userId, 'logs', entry.date);
  await setDoc(docRef, entry, { merge: true });
};

// Get symptom entry for a specific date
export const getSymptomEntry = async (userId: string, date: string): Promise<SymptomEntry | null> => {
  const docRef = doc(db, 'users', userId, 'logs', date);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as SymptomEntry;
  }
  return null;
};

// Get all symptom entries for a user
export const getAllSymptomEntries = async (userId: string): Promise<SymptomEntry[]> => {
  const q = query(collection(db, 'users', userId, 'logs'));
  const querySnapshot = await getDocs(q);
  
  const entries: SymptomEntry[] = [];
  querySnapshot.forEach((doc) => {
    entries.push(doc.data() as SymptomEntry);
  });
  
  return entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Update user progress
export const updateUserProgress = async (userId: string, progress: UserProgress): Promise<void> => {
  const docRef = doc(db, 'users', userId, 'metadata', 'progress');
  await setDoc(docRef, progress, { merge: true });
};

// Get user progress
export const getUserProgress = async (userId: string): Promise<UserProgress | null> => {
  const docRef = doc(db, 'users', userId, 'metadata', 'progress');
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as UserProgress;
  }
  
  // Initialize default progress if none exists
  const defaultProgress: UserProgress = {
    completedDays: 0,
    totalDays: 20,
    startDate: new Date().toISOString().split('T')[0],
    completedDates: []
  };
  
  await updateUserProgress(userId, defaultProgress);
  return defaultProgress;
};

// Get symptom entries for ML prediction
export const getSymptomEntriesForPrediction = async (userId: string): Promise<any[]> => {
  const entries = await getAllSymptomEntries(userId);
  
  // Transform entries to match ML model format
  return entries.map(entry => ({
    'Irregular / Missed periods': entry.irregularPeriods ? 1 : 0,
    'Cramping': entry.cramping ? 1 : 0,
    'Menstrual clots': entry.menstrualClots ? 1 : 0,
    'Infertility': entry.infertility ? 1 : 0,
    'Pain / Chronic pain': entry.chronicPain ? 1 : 0,
    'Diarrhea': entry.diarrhea ? 1 : 0,
    'Long menstruation': entry.longMenstruation ? 1 : 0,
    'Vomiting / constant vomiting': entry.vomiting ? 1 : 0,
    'Migraines': entry.migraines ? 1 : 0,
    'Extreme Bloating': entry.extremeBloating ? 1 : 0,
    'Leg pain': entry.legPain ? 1 : 0,
    'Depression': entry.depression ? 1 : 0,
    'Fertility Issues': entry.fertilityIssues ? 1 : 0,
    'Ovarian cysts': entry.ovarianCysts ? 1 : 0,
    'Painful urination': entry.painfulUrination ? 1 : 0,
    'Pain after Intercourse': entry.painAfterIntercourse ? 1 : 0,
    'Digestive / GI problems': entry.digestiveProblems ? 1 : 0,
    'Anaemia / Iron deficiency': entry.anemia ? 1 : 0,
    'Hip pain': entry.hipPain ? 1 : 0,
    'Vaginal Pain/Pressure': entry.vaginalPain ? 1 : 0,
    'Cysts (unspecified)': entry.cysts ? 1 : 0,
    'Abnormal uterine bleeding': entry.abnormalBleeding ? 1 : 0,
    'Hormonal problems': entry.hormonalProblems ? 1 : 0,
    'Feeling sick': entry.feelingSick ? 1 : 0,
    'Abdominal Cramps during Intercourse': entry.abdominalCrampsIntercourse ? 1 : 0,
    'Insomnia / Sleeplessness': entry.insomnia ? 1 : 0,
    'Loss of appetite': entry.lossOfAppetite ? 1 : 0,
    date: entry.date,
    notes: entry.notes
  }));
};