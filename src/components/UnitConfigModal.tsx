import { useState, useEffect } from 'react'
import { fetchDispatchUnitCodes } from '../utils/api'

interface UnitConfigModalProps {
  isOpen: boolean
  onClose: () => void
  selectedUnits: string[]
  onSave: (units: string[]) => void
}

const UnitConfigModal: React.FC<UnitConfigModalProps> = ({ isOpen, onClose, selectedUnits, onSave }) => {
  const [availableUnits, setAvailableUnits] = useState<string[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedUnits))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadUnits()
      setSelected(new Set(selectedUnits))
    }
  }, [isOpen, selectedUnits])

  const loadUnits = async () => {
    try {
      setLoading(true)
      setError(null)
      const units = await fetchDispatchUnitCodes()
      setAvailableUnits(units.sort())
    } catch (err) {
      setError('Failed to load dispatch units')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleUnit = (unit: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(unit)) {
      newSelected.delete(unit)
    } else {
      newSelected.add(unit)
    }
    setSelected(newSelected)
  }

  const handleSave = () => {
    onSave(Array.from(selected))
    onClose()
  }

  const filteredUnits = availableUnits.filter(unit =>
    unit.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Configure Units</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Select the units that constitute "our units" for dispatch tracking
          </p>
        </div>

        <div className="p-6 flex-1 overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse text-gray-600 dark:text-gray-400">Loading units...</div>
            </div>
          ) : error ? (
            <div className="text-red-600 dark:text-red-400">{error}</div>
          ) : (
            <>
              <input
                type="text"
                placeholder="Search units..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />

              <div className="flex-1 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-2">
                  {filteredUnits.map((unit) => (
                    <label
                      key={unit}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(unit)}
                        onChange={() => toggleUnit(unit)}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-800 dark:text-white font-mono">{unit}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Selected: {selected.size} unit{selected.size !== 1 ? 's' : ''}
              </div>
            </>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default UnitConfigModal
