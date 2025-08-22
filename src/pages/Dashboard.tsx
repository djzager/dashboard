import { useState } from 'react'
import Header from '../components/Header'
import ActiveDispatches from '../components/ActiveDispatches'
import Today from '../components/Today'
import Events from '../components/Events'

const Dashboard: React.FC = () => {
  const [isHeaderVisible, setIsHeaderVisible] = useState(false)

  return (
    <div className="min-h-screen lg:h-screen bg-gray-100 dark:bg-gray-900">
      <Header onVisibilityChange={setIsHeaderVisible} />

      {/* Main Dashboard Grid */}
      <main className={`p-4 grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-2 gap-4 h-screen overflow-hidden transition-all duration-300 ${
        isHeaderVisible ? 'pt-20' : 'pt-4'
      }`}>
        
        {/* Today - Top Left */}
        <Today />

        {/* Active Dispatches - Right 2/3 */}
        <ActiveDispatches className="lg:col-span-2 lg:row-span-2" />

        {/* Upcoming Events - Bottom Left */}
        <Events />

      </main>
    </div>
  )
}

export default Dashboard