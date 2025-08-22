import Header from '../components/Header'
import ActiveDispatches from '../components/ActiveDispatches'
import Weather from '../components/Weather'
import ApparatusStatus from '../components/ApparatusStatus'
import Staffing from '../components/Staffing'
import Events from '../components/Events'

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen lg:h-screen bg-gray-100 dark:bg-gray-900">
      <Header />

      {/* Main Dashboard Grid */}
      <main className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-4 h-screen overflow-hidden">
        
        {/* Upcoming Events */}
        <Events />

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