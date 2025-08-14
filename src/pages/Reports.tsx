import { useState } from 'react'
import Header from '../components/Header'

interface ReportType {
  id: string
  name: string
  description: string
}

interface DateRange {
  start: string
  end: string
}

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string>('')
  const [dateRange, setDateRange] = useState<DateRange>({ start: '', end: '' })

  const reportTypes: ReportType[] = [
    { id: 'incidents', name: 'Incident Reports', description: 'All fire and emergency incidents' },
    { id: 'personnel', name: 'Personnel Reports', description: 'Staffing and availability data' },
    { id: 'apparatus', name: 'Apparatus Reports', description: 'Equipment status and maintenance' },
    { id: 'training', name: 'Training Reports', description: 'Training sessions and certifications' },
    { id: 'response-times', name: 'Response Time Analysis', description: 'Response time statistics' },
    { id: 'monthly', name: 'Monthly Summary', description: 'Complete monthly department activity' }
  ]

  const handleGenerateReport = () => {
    if (!selectedReport) {
      alert('Please select a report type')
      return
    }
    alert(`Generating ${reportTypes.find(r => r.id === selectedReport)?.name} report...`)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <Header />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          
          {/* Report Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Generate Report</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {reportTypes.map((report) => (
                <div
                  key={report.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedReport === report.id
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <div className="font-medium text-gray-800 dark:text-white mb-1">{report.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{report.description}</div>
                </div>
              ))}
            </div>

            {/* Date Range Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateReport}
              className="bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white px-6 py-2 rounded-md transition-colors font-medium"
            >
              Generate Report
            </button>
          </div>

          {/* Recent Reports */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Recent Reports</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-600 rounded">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Monthly Summary - November 2024</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Generated 2 days ago</div>
                </div>
                <button className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white px-3 py-1 rounded text-sm transition-colors">
                  Download
                </button>
              </div>
              
              <div className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-600 rounded">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Incident Reports - Week 48</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Generated 5 days ago</div>
                </div>
                <button className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white px-3 py-1 rounded text-sm transition-colors">
                  Download
                </button>
              </div>
              
              <div className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-600 rounded">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Response Time Analysis - Q4 2024</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Generated 1 week ago</div>
                </div>
                <button className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white px-3 py-1 rounded text-sm transition-colors">
                  Download
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

export default Reports