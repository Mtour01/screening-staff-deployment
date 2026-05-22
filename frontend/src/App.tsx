import React, { useState } from 'react';
import { Users, MapPin, Calendar, Zap } from 'lucide-react';
import StaffManagement from './pages/StaffManagement';
import LocationManagement from './pages/LocationManagement';
import ScheduleGenerator from './pages/ScheduleGenerator';

type Page = 'dashboard' | 'staff' | 'locations' | 'schedule';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'staff':
        return <StaffManagement />;
      case 'locations':
        return <LocationManagement />;
      case 'schedule':
        return <ScheduleGenerator />;
      default:
        return (
          <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🛂 Screening Staff Deployment System</h1>
            <p className="text-gray-600 mb-8">Intelligent staff scheduling for airport screening operations</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <Users className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="font-bold text-lg mb-2">Staff Management</h3>
                <p className="text-gray-700 text-sm">Manage X-Ray operators and PDS staff</p>
              </div>
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <MapPin className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="font-bold text-lg mb-2">10 Locations</h3>
                <p className="text-gray-700 text-sm">3 X-Ray, 6 PDS per location</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                <Calendar className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="font-bold text-lg mb-2">12-Hour Shifts</h3>
                <p className="text-gray-700 text-sm">Day & Night rotations</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                <Zap className="w-12 h-12 text-orange-600 mb-4" />
                <h3 className="font-bold text-lg mb-2">Smart Rotation</h3>
                <p className="text-gray-700 text-sm">6 days work, 1 day off</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
              <ol className="space-y-3 list-decimal list-inside text-gray-700">
                <li>Add staff members in <button onClick={() => setCurrentPage('staff')} className="text-blue-600 hover:underline">Staff Management</button></li>
                <li>Configure locations in <button onClick={() => setCurrentPage('locations')} className="text-blue-600 hover:underline">Locations</button></li>
                <li>Generate optimal schedule in <button onClick={() => setCurrentPage('schedule')} className="text-blue-600 hover:underline">Schedule Generator</button></li>
              </ol>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">🛂 Screening Deployment</h1>
          <div className="flex gap-4">
            <button onClick={() => setCurrentPage('dashboard')} className={`px-4 py-2 rounded ${
              currentPage === 'dashboard' ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}>Dashboard</button>
            <button onClick={() => setCurrentPage('staff')} className={`px-4 py-2 rounded ${
              currentPage === 'staff' ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}>Staff</button>
            <button onClick={() => setCurrentPage('locations')} className={`px-4 py-2 rounded ${
              currentPage === 'locations' ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}>Locations</button>
            <button onClick={() => setCurrentPage('schedule')} className={`px-4 py-2 rounded ${
              currentPage === 'schedule' ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}>Schedule</button>
          </div>
        </div>
      </nav>

      <main className="py-8">
        {renderPage()}
      </main>

      <footer className="bg-gray-900 text-gray-400 text-center py-4 mt-12">
        <p>Screening Staff Deployment System v1.0 | Built with React, Node.js, PostgreSQL</p>
      </footer>
    </div>
  );
}

export default App;
