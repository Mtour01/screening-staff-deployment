import React, { useState, useEffect } from 'react';
import { Calendar, Play } from 'lucide-react';

interface DeploymentResult {
  success: boolean;
  message: string;
  deploymentsCreated?: number;
  conflicts?: string[];
}

const ScheduleGenerator: React.FC = () => {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DeploymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:3000/api/deployments/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate })
      });

      if (!response.ok) throw new Error('Failed to generate schedule');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Generate Schedule</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
            <Play size={20} /> {loading ? 'Generating...' : 'Generate Schedule'}
          </button>
        </form>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {result && (
        <div className={`rounded-lg p-6 ${
          result.success ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <h2 className={`text-2xl font-bold mb-4 ${
            result.success ? 'text-green-800' : 'text-yellow-800'
          }`}>
            {result.success ? '✅ Success!' : '⚠️ Completed with Issues'}
          </h2>
          <p className={`mb-4 ${
            result.success ? 'text-green-700' : 'text-yellow-700'
          }`}>{result.message}</p>
          {result.deploymentsCreated && (
            <p className={`font-semibold ${
              result.success ? 'text-green-700' : 'text-yellow-700'
            }`}>Deployments Created: {result.deploymentsCreated}</p>
          )}
          {result.conflicts && result.conflicts.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold text-yellow-800 mb-2">Conflicts:</h3>
              <ul className="list-disc list-inside space-y-1 text-yellow-700">
                {result.conflicts.map((conflict, i) => <li key={i}>{conflict}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScheduleGenerator;
