import React, { useState, useEffect } from 'react';
import { SymptomEntry } from '../types';
import { X, Save } from 'lucide-react';
import ToggleSwitch from './ToggleSwitch';

interface SymptomModalProps {
  date: string;
  existingEntry: SymptomEntry | null;
  onSave: (entry: SymptomEntry) => void;
  onClose: () => void;
}

// Symptom categories based on your ML model
const symptomCategories = [
  {
    title: 'Menstrual Symptoms',
    symptoms: [
      { key: 'irregularPeriods', label: 'Irregular / Missed periods' },
      { key: 'menstrualClots', label: 'Menstrual clots' },
      { key: 'longMenstruation', label: 'Long menstruation' },
      { key: 'abnormalBleeding', label: 'Abnormal uterine bleeding' },
    ]
  },
  {
    title: 'Pain Symptoms',
    symptoms: [
      { key: 'cramping', label: 'Cramping' },
      { key: 'chronicPain', label: 'Pain / Chronic pain' },
      { key: 'legPain', label: 'Leg pain' },
      { key: 'hipPain', label: 'Hip pain' },
      { key: 'vaginalPain', label: 'Vaginal Pain/Pressure' },
      { key: 'painfulUrination', label: 'Painful urination' },
      { key: 'painAfterIntercourse', label: 'Pain after Intercourse' },
      { key: 'abdominalCrampsIntercourse', label: 'Abdominal Cramps during Intercourse' },
    ]
  },
  {
    title: 'Digestive & Physical',
    symptoms: [
      { key: 'diarrhea', label: 'Diarrhea' },
      { key: 'vomiting', label: 'Vomiting / constant vomiting' },
      { key: 'extremeBloating', label: 'Extreme Bloating' },
      { key: 'digestiveProblems', label: 'Digestive / GI problems' },
      { key: 'lossOfAppetite', label: 'Loss of appetite' },
      { key: 'feelingSick', label: 'Feeling sick' },
      { key: 'anemia', label: 'Anaemia / Iron deficiency' },
    ]
  },
  {
    title: 'General Health',
    symptoms: [
      { key: 'migraines', label: 'Migraines' },
      { key: 'depression', label: 'Depression' },
      { key: 'insomnia', label: 'Insomnia / Sleeplessness' },
      { key: 'hormonalProblems', label: 'Hormonal problems' },
    ]
  },
  {
    title: 'Reproductive Health',
    symptoms: [
      { key: 'infertility', label: 'Infertility' },
      { key: 'fertilityIssues', label: 'Fertility Issues' },
      { key: 'ovarianCysts', label: 'Ovarian cysts' },
      { key: 'cysts', label: 'Cysts (unspecified)' },
    ]
  }
];

const SymptomModal: React.FC<SymptomModalProps> = ({ date, existingEntry, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<SymptomEntry>>({
    irregularPeriods: false,
    cramping: false,
    menstrualClots: false,
    infertility: false,
    chronicPain: false,
    diarrhea: false,
    longMenstruation: false,
    vomiting: false,
    migraines: false,
    extremeBloating: false,
    legPain: false,
    depression: false,
    fertilityIssues: false,
    ovarianCysts: false,
    painfulUrination: false,
    painAfterIntercourse: false,
    digestiveProblems: false,
    anemia: false,
    hipPain: false,
    vaginalPain: false,
    cysts: false,
    abnormalBleeding: false,
    hormonalProblems: false,
    feelingSick: false,
    abdominalCrampsIntercourse: false,
    insomnia: false,
    lossOfAppetite: false,
    notes: '',
  });

  useEffect(() => {
    if (existingEntry) {
      setFormData(existingEntry);
    }
  }, [existingEntry]);

  const handleToggle = (key: string, value: boolean) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, notes: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entry: SymptomEntry = {
      ...formData as SymptomEntry,
      date,
      timestamp: Date.now(),
    };

    onSave(entry);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            Log Symptoms for {new Date(date).toLocaleDateString()}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            {symptomCategories.map((category) => (
              <div key={category.title} className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                  {category.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.symptoms.map((symptom) => (
                    <div key={symptom.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-700 flex-1">
                        {symptom.label}
                      </label>
                      <ToggleSwitch
                        checked={formData[symptom.key as keyof SymptomEntry] as boolean || false}
                        onChange={(checked) => handleToggle(symptom.key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Notes Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Additional Notes
              </h3>
              <textarea
                value={formData.notes || ''}
                onChange={handleNotesChange}
                placeholder="Any additional symptoms or notes for today..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-primary flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {existingEntry ? 'Update Entry' : 'Save Entry'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SymptomModal;