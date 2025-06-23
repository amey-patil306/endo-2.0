import React, { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { SymptomEntry } from '../types';
import { getSymptomEntriesForPrediction, getAllSymptomEntries, getSymptomEntriesForMonth } from '../lib/database';
import { dummyPredictionResults } from '../utils/dummyData';
import PredictionExplanation from './PredictionExplanation';
import { Brain, TrendingUp, Calendar, AlertCircle, CheckCircle, Database, Clock, BarChart3, PieChart, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

interface PredictionResult {
  prediction: number;
  prediction_label: string;
  confidence: number;
  probabilities: {
    no_endometriosis: number;
    endometriosis: number;
  };
  risk_level: string;
  message: string;
}

interface PredictionDashboardProps {
  user: User;
  completedDays: number;
  isComplete: boolean;
  selectedMonth: string;
}

const PredictionDashboard: React.FC<PredictionDashboardProps> = ({ user, completedDays, isComplete, selectedMonth }) => {
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingDummyData, setUsingDummyData] = useState(false);
  const [symptomStats, setSymptomStats] = useState<any>(null);

  const canPredict = completedDays >= 5; // Minimum days for prediction
  const maxDays = 20; // Maximum tracking days
  const effectiveCompletedDays = Math.min(completedDays, maxDays);

  // Format month display
  const formatMonthDisplay = (monthKey: string): string => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const transformSymptomData = (entries: SymptomEntry[]) => {
    // Only use the first 20 days of data
    const limitedEntries = entries.slice(0, maxDays);
    
    // Aggregate symptoms across all days
    const aggregated: any = {};
    const symptomKeys = [
      'irregularPeriods', 'cramping', 'menstrualClots', 'infertility', 'chronicPain',
      'diarrhea', 'longMenstruation', 'vomiting', 'migraines', 'extremeBloating',
      'legPain', 'depression', 'fertilityIssues', 'ovarianCysts', 'painfulUrination',
      'painAfterIntercourse', 'digestiveProblems', 'anemia', 'hipPain', 'vaginalPain',
      'cysts', 'abnormalBleeding', 'hormonalProblems', 'feelingSick',
      'abdominalCrampsIntercourse', 'insomnia', 'lossOfAppetite'
    ];

    // Map frontend keys to API keys
    const keyMapping: { [key: string]: string } = {
      'irregularPeriods': 'Irregular_Missed_periods',
      'cramping': 'Cramping',
      'menstrualClots': 'Menstrual_clots',
      'infertility': 'Infertility',
      'chronicPain': 'Pain_Chronic_pain',
      'diarrhea': 'Diarrhea',
      'longMenstruation': 'Long_menstruation',
      'vomiting': 'Vomiting_constant_vomiting',
      'migraines': 'Migraines',
      'extremeBloating': 'Extreme_Bloating',
      'legPain': 'Leg_pain',
      'depression': 'Depression',
      'fertilityIssues': 'Fertility_Issues',
      'ovarianCysts': 'Ovarian_cysts',
      'painfulUrination': 'Painful_urination',
      'painAfterIntercourse': 'Pain_after_Intercourse',
      'digestiveProblems': 'Digestive_GI_problems',
      'anemia': 'Anaemia_Iron_deficiency',
      'hipPain': 'Hip_pain',
      'vaginalPain': 'Vaginal_Pain_Pressure',
      'cysts': 'Cysts_unspecified',
      'abnormalBleeding': 'Abnormal_uterine_bleeding',
      'hormonalProblems': 'Hormonal_problems',
      'feelingSick': 'Feeling_sick',
      'abdominalCrampsIntercourse': 'Abdominal_Cramps_during_Intercourse',
      'insomnia': 'Insomnia_Sleeplessness',
      'lossOfAppetite': 'Loss_of_appetite'
    };

    // Calculate frequency of each symptom (0-1 scale)
    symptomKeys.forEach(key => {
      const apiKey = keyMapping[key];
      if (apiKey) {
        const count = limitedEntries.filter(entry => entry[key as keyof SymptomEntry] === true).length;
        aggregated[apiKey] = count / limitedEntries.length; // Frequency as decimal
      }
    });

    return aggregated;
  };

  const generateSymptomStats = (entries: SymptomEntry[]) => {
    const limitedEntries = entries.slice(0, maxDays);
    
    if (limitedEntries.length === 0) {
      console.log('No entries found for stats generation');
      return null;
    }

    console.log(`🔍 Generating stats for ${formatMonthDisplay(selectedMonth)} - ${limitedEntries.length} entries`);
    console.log('📊 Sample entry structure:', limitedEntries[0]);

    // Log all boolean fields in first entry to see what we're working with
    const firstEntry = limitedEntries[0];
    const booleanFields = Object.keys(firstEntry).filter(key => 
      typeof firstEntry[key as keyof SymptomEntry] === 'boolean'
    );
    console.log('🔢 Boolean fields found:', booleanFields);

    const symptomCategories = {
      'Pain Symptoms': ['cramping', 'chronicPain', 'legPain', 'hipPain', 'vaginalPain', 'painfulUrination', 'painAfterIntercourse', 'abdominalCrampsIntercourse'],
      'Menstrual Symptoms': ['irregularPeriods', 'menstrualClots', 'longMenstruation', 'abnormalBleeding'],
      'Digestive Symptoms': ['diarrhea', 'vomiting', 'extremeBloating', 'digestiveProblems', 'lossOfAppetite', 'feelingSick'],
      'General Health': ['migraines', 'depression', 'insomnia', 'anemia'],
      'Reproductive Health': ['infertility', 'fertilityIssues', 'ovarianCysts', 'cysts', 'hormonalProblems']
    };

    const categoryStats = Object.entries(symptomCategories).map(([category, symptoms]) => {
      console.log(`\n📋 Processing category: ${category}`);
      console.log(`🎯 Symptoms to check: ${symptoms.join(', ')}`);
      
      // Count total days where ANY symptom in this category occurred
      let categoryDaysWithSymptoms = 0;
      let totalOccurrences = 0;
      
      // For each day, check if any symptom in this category occurred
      limitedEntries.forEach((entry, dayIndex) => {
        let dayHasSymptom = false;
        let daySymptoms: string[] = [];
        
        symptoms.forEach(symptom => {
          const symptomValue = entry[symptom as keyof SymptomEntry];
          console.log(`  Day ${dayIndex + 1}, ${symptom}: ${symptomValue} (type: ${typeof symptomValue})`);
          
          if (symptomValue === true) {
            totalOccurrences++;
            dayHasSymptom = true;
            daySymptoms.push(symptom);
          }
        });
        
        if (dayHasSymptom) {
          categoryDaysWithSymptoms++;
          console.log(`  ✅ Day ${dayIndex + 1} has symptoms: ${daySymptoms.join(', ')}`);
        } else {
          console.log(`  ❌ Day ${dayIndex + 1} has no symptoms in this category`);
        }
      });
      
      // Calculate percentage of days where this category had symptoms
      const percentage = limitedEntries.length > 0 ? Math.round((categoryDaysWithSymptoms / limitedEntries.length) * 100) : 0;
      
      console.log(`📊 ${category} FINAL STATS for ${formatMonthDisplay(selectedMonth)}:`);
      console.log(`   - Days with symptoms: ${categoryDaysWithSymptoms}/${limitedEntries.length}`);
      console.log(`   - Total occurrences: ${totalOccurrences}`);
      console.log(`   - Percentage: ${percentage}%`);
      
      return {
        category,
        percentage,
        occurrences: totalOccurrences,
        daysWithSymptoms: categoryDaysWithSymptoms,
        color: getCategoryColor(category)
      };
    });

    // Most frequent individual symptoms
    const allSymptoms = [
      { key: 'cramping', label: 'Cramping' },
      { key: 'chronicPain', label: 'Chronic Pain' },
      { key: 'extremeBloating', label: 'Bloating' },
      { key: 'migraines', label: 'Migraines' },
      { key: 'depression', label: 'Mood Changes' },
      { key: 'irregularPeriods', label: 'Irregular Periods' },
      { key: 'digestiveProblems', label: 'Digestive Issues' },
      { key: 'insomnia', label: 'Sleep Issues' },
      { key: 'painAfterIntercourse', label: 'Pain After Intercourse' },
      { key: 'ovarianCysts', label: 'Ovarian Cysts' }
    ];

    console.log('\n🔍 Analyzing individual symptoms:');
    const topSymptoms = allSymptoms
      .map(symptom => {
        const count = limitedEntries.filter(entry => {
          const value = entry[symptom.key as keyof SymptomEntry];
          console.log(`  ${symptom.key}: ${value} (type: ${typeof value})`);
          return value === true;
        }).length;
        
        const percentage = limitedEntries.length > 0 ? Math.round((count / limitedEntries.length) * 100) : 0;
        
        console.log(`  ${symptom.label}: ${count}/${limitedEntries.length} days = ${percentage}%`);
        
        return {
          ...symptom,
          count,
          percentage
        };
      })
      .filter(symptom => symptom.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Overall statistics
    const totalSymptomDays = limitedEntries.filter(entry => {
      // Check if this day has any symptoms
      const hasSymptoms = Object.keys(entry).some(key => {
        const value = entry[key as keyof SymptomEntry];
        const isSymptomField = typeof value === 'boolean' && 
          key !== 'date' && key !== 'timestamp' && key !== 'notes';
        return isSymptomField && value === true;
      });
      
      return hasSymptoms;
    }).length;

    const overallSymptomRate = limitedEntries.length > 0 ? Math.round((totalSymptomDays / limitedEntries.length) * 100) : 0;

    console.log(`\n📈 OVERALL STATISTICS for ${formatMonthDisplay(selectedMonth)}:`);
    console.log(`   - Total days analyzed: ${limitedEntries.length}`);
    console.log(`   - Days with any symptoms: ${totalSymptomDays}`);
    console.log(`   - Symptom-free days: ${limitedEntries.length - totalSymptomDays}`);
    console.log(`   - Overall symptom rate: ${overallSymptomRate}%`);

    const finalStats = {
      categoryStats,
      topSymptoms,
      totalDays: limitedEntries.length,
      totalSymptomDays,
      symptomFreeDays: limitedEntries.length - totalSymptomDays,
      overallSymptomRate,
      monthDisplayName: formatMonthDisplay(selectedMonth)
    };

    console.log('\n🎯 FINAL STATS OBJECT:', finalStats);
    return finalStats;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Pain Symptoms': 'bg-red-500',
      'Menstrual Symptoms': 'bg-pink-500',
      'Digestive Symptoms': 'bg-orange-500',
      'General Health': 'bg-blue-500',
      'Reproductive Health': 'bg-purple-500'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  const generateDummyPrediction = (entries: SymptomEntry[]): PredictionResult => {
    // Only analyze first 20 days
    const limitedEntries = entries.slice(0, maxDays);
    
    // Analyze symptom frequency to determine risk level
    const symptomCounts = limitedEntries.reduce((acc, entry) => {
      Object.keys(entry).forEach(key => {
        if (typeof entry[key as keyof SymptomEntry] === 'boolean' && entry[key as keyof SymptomEntry]) {
          acc[key] = (acc[key] || 0) + 1;
        }
      });
      return acc;
    }, {} as Record<string, number>);

    const totalSymptoms = Object.values(symptomCounts).reduce((sum, count) => sum + count, 0);
    const avgSymptomsPerDay = totalSymptoms / limitedEntries.length;

    // Determine risk level based on symptom frequency
    let riskLevel: 'low' | 'moderate' | 'high';
    if (avgSymptomsPerDay >= 6) {
      riskLevel = 'high';
    } else if (avgSymptomsPerDay >= 3) {
      riskLevel = 'moderate';
    } else {
      riskLevel = 'low';
    }

    return dummyPredictionResults[riskLevel];
  };

  const runPrediction = async () => {
    setLoading(true);
    setError(null);
    setUsingDummyData(false);

    try {
      console.log(`🚀 Starting prediction analysis for ${formatMonthDisplay(selectedMonth)}...`);
      
      // Get user's symptom entries for current month
      const entries = await getAllSymptomEntries(user.id);
      console.log(`📥 Raw entries from database for ${formatMonthDisplay(selectedMonth)}:`, entries);
      
      if (entries.length === 0) {
        throw new Error(`No symptom data found for ${formatMonthDisplay(selectedMonth)}. Please log some symptoms first.`);
      }

      // Limit to 20 days for prediction
      const limitedEntries = entries.slice(0, maxDays);
      console.log('📊 Limited entries for analysis:', limitedEntries);
      
      if (limitedEntries.length < 5) {
        throw new Error(`Need at least 5 days of data for analysis. You have ${limitedEntries.length} days for ${formatMonthDisplay(selectedMonth)}.`);
      }

      // Generate symptom statistics
      console.log('📈 Generating symptom statistics...');
      const stats = generateSymptomStats(limitedEntries);
      console.log('✅ Generated stats:', stats);
      setSymptomStats(stats);

      // Try to call the real API first
      try {
        const transformedData = transformSymptomData(limitedEntries);
        console.log('🔄 Transformed data for API:', transformedData);
        
        const response = await fetch('http://localhost:8000/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transformedData)
        });

        if (response.ok) {
          const result = await response.json();
          setPredictionResult(result);
          toast.success(`Analysis completed for ${formatMonthDisplay(selectedMonth)} using ${limitedEntries.length} days of data!`);
          return;
        }
      } catch (apiError) {
        console.warn('Analysis service not available, using demo results:', apiError);
      }

      // Fallback to dummy prediction
      const dummyResult = generateDummyPrediction(limitedEntries);
      setPredictionResult(dummyResult);
      setUsingDummyData(true);
      toast.success(`Demo analysis generated for ${formatMonthDisplay(selectedMonth)} using ${limitedEntries.length} days!`);

    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to generate analysis');
      toast.error('Failed to generate analysis');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return <AlertCircle className="h-6 w-6" />;
      case 'moderate': return <TrendingUp className="h-6 w-6" />;
      case 'low': return <CheckCircle className="h-6 w-6" />;
      default: return <Activity className="h-6 w-6" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Activity className="h-8 w-8 text-primary-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Monthly Health Analysis
              </h2>
              <p className="text-sm text-gray-600">
                Analyze your symptom patterns for {formatMonthDisplay(selectedMonth)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Database className="h-4 w-4" />
              <span>Monthly Data</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{effectiveCompletedDays}/20 days</span>
            </div>
            {isComplete && (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Complete</span>
              </div>
            )}
          </div>
        </div>

        {/* Monthly tracking info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-blue-800 font-medium">Monthly Analysis - {formatMonthDisplay(selectedMonth)}</p>
              <p className="text-blue-700 text-sm">
                Analysis is based on up to 20 days of symptom data from this month for accurate insights. 
                {effectiveCompletedDays < maxDays && ` You have ${maxDays - effectiveCompletedDays} days remaining this month.`}
                {isComplete && ' This month\'s tracking is complete!'}
              </p>
            </div>
          </div>
        </div>

        {!canPredict && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-yellow-800 font-medium">More data needed for {formatMonthDisplay(selectedMonth)}</p>
                <p className="text-yellow-700 text-sm">
                  Track at least 5 days of symptoms to generate a monthly analysis. 
                  You currently have {effectiveCompletedDays} days logged for this month.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {usingDummyData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-yellow-800 font-medium">Demo Analysis</p>
                <p className="text-yellow-700 text-sm">
                  Using sample analysis based on {effectiveCompletedDays} days of data from {formatMonthDisplay(selectedMonth)}. 
                  Your monthly data is being read securely from our database.
                </p>
              </div>
            </div>
          </div>
        )}

        {!predictionResult && canPredict && (
          <div className="text-center py-8">
            <Activity className="h-16 w-16 text-primary-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ready for Monthly Analysis
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Analyze your {effectiveCompletedDays} days of symptom patterns from {formatMonthDisplay(selectedMonth)} 
              to get personalized insights about your health.
            </p>
            <button
              onClick={runPrediction}
              disabled={loading || !canPredict}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing {formatMonthDisplay(selectedMonth)}...
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4 mr-2" />
                  Analyze {formatMonthDisplay(selectedMonth)} ({effectiveCompletedDays} days)
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Symptom Statistics Visualization */}
      {symptomStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Symptom Categories - {symptomStats.monthDisplayName}
              </h3>
            </div>
            <div className="space-y-4">
              {symptomStats.categoryStats.map((category: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{category.category}</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900">{category.percentage}%</span>
                      <div className="text-xs text-gray-500">{category.daysWithSymptoms} of {symptomStats.totalDays} days</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${category.color}`}
                      style={{ width: `${Math.max(category.percentage, 2)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Overall Stats */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-blue-600">{symptomStats.overallSymptomRate}%</div>
                  <div className="text-xs text-blue-800">Days with symptoms</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-green-600">{symptomStats.symptomFreeDays}</div>
                  <div className="text-xs text-green-800">Symptom-free days</div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Symptoms */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <PieChart className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Most Frequent Symptoms - {symptomStats.monthDisplayName}
              </h3>
            </div>
            {symptomStats.topSymptoms.length > 0 ? (
              <div className="space-y-3">
                {symptomStats.topSymptoms.map((symptom: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold text-sm">{index + 1}</span>
                      </div>
                      <span className="font-medium text-gray-900">{symptom.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{symptom.count} days</div>
                      <div className="text-xs text-gray-600">{symptom.percentage}% of days</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No frequent symptoms detected</p>
                <p className="text-xs">This indicates mostly symptom-free days this month</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {predictionResult && (
        <div className="space-y-6">
          {/* Main Result Card */}
          <div className={`rounded-lg border p-6 ${getRiskColor(predictionResult.risk_level)}`}>
            <div className="flex items-center space-x-4 mb-4">
              {getRiskIcon(predictionResult.risk_level)}
              <div className="flex-1">
                <h3 className="text-lg font-semibold">
                  Monthly Health Analysis Results
                </h3>
                <p className="text-sm opacity-90">
                  {predictionResult.risk_level} Risk Level for {formatMonthDisplay(selectedMonth)}
                  {usingDummyData && <span className="ml-2">(Demo)</span>}
                </p>
                <p className="text-xs opacity-75 mt-1">
                  Based on {effectiveCompletedDays} days of symptom data from this month
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {Math.round(predictionResult.probabilities.endometriosis * 100)}%
                </div>
                <div className="text-xs opacity-75">
                  Risk Score
                </div>
              </div>
            </div>
            
            <p className="text-sm mb-4">{predictionResult.message}</p>
            
            {/* Visual Risk Indicator */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Monthly Risk Assessment</span>
                <span>{Math.round(predictionResult.probabilities.endometriosis * 100)}%</span>
              </div>
              <div className="w-full bg-white bg-opacity-30 rounded-full h-3">
                <div 
                  className="bg-current h-3 rounded-full transition-all duration-500"
                  style={{ width: `${predictionResult.probabilities.endometriosis * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => setShowExplanation(true)}
              className="flex-1 btn-primary"
            >
              <Brain className="h-4 w-4 mr-2" />
              Get Detailed Explanation
            </button>
            <button
              onClick={runPrediction}
              disabled={loading}
              className="btn-secondary"
            >
              {loading ? 'Updating...' : 'Update Analysis'}
            </button>
          </div>

          {/* Important Disclaimer */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Important Information</h4>
            <p className="text-sm text-gray-600">
              This monthly analysis is based on your symptom patterns over {effectiveCompletedDays} days 
              from {formatMonthDisplay(selectedMonth)} and is for informational purposes only. It does not constitute medical advice 
              or diagnosis. Please consult with a healthcare professional for proper 
              medical evaluation and diagnosis.
            </p>
          </div>
        </div>
      )}

      {/* Explanation Modal */}
      {showExplanation && predictionResult && (
        <PredictionExplanation
          predictionResult={predictionResult}
          onClose={() => setShowExplanation(false)}
        />
      )}
    </div>
  );
};

export default PredictionDashboard;