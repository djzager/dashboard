import Header from '../components/Header'
import ActiveDispatches from '../components/ActiveDispatches'
import Weather from '../components/Weather'
import ApparatusStatus from '../components/ApparatusStatus'
import Staffing from '../components/Staffing'

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <Header />

      {/* Main Dashboard Grid */}
      <main className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-4 lg:overflow-hidden">
        
        {/* Upcoming Events */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Upcoming Events</h2>
          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-3">
              <div className="font-medium text-gray-900 dark:text-white">Training Drill</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Today, 7:00 PM</div>
            </div>
            <div className="border-l-4 border-green-500 pl-3">
              <div className="font-medium text-gray-900 dark:text-white">Equipment Check</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Tomorrow, 6:00 PM</div>
            </div>
            <div className="border-l-4 border-yellow-500 pl-3">
              <div className="font-medium text-gray-900 dark:text-white">Monthly Meeting</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Next Week, Mon 7:30 PM</div>
            </div>
          </div>
        </div>

        {/* Current Staffing */}
        <Staffing />

        {/* Weather */}
        <Weather />

        {/* Apparatus Status */}
        <ApparatusStatus className="md:col-span-2 lg:col-span-1" />

        {/* Active Dispatches */}
        <ActiveDispatches className="md:col-span-2" />

      </main>
    </div>
  )
}

export default Dashboard