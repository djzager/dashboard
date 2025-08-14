import React from "react";
import { getIncidentTypeColor, formatDispatchTime } from "../types/dispatch";
import { Incident } from "../types/incident";
import { isOurUnit } from "../utils/api";
import { parseDispatchComments, getStatusColor, getUnitLatestStatus } from "../utils/dispatch-status";

interface DispatchCardProps {
  incident: Incident;
  className?: string;
  onClick?: () => void;
}

const DispatchCard: React.FC<DispatchCardProps> = ({
  incident,
  className = "",
  onClick,
}) => {
  const { dispatch, fireIncident, unitDispatch } = incident;
  const isOurUnitInvolved = isOurUnit(dispatch.unit_codes);
  const isClosed = dispatch.status_code === "closed";
  
  // Parse dispatch comments to get unit statuses (only for open dispatches)
  const unitStatuses = dispatch.status_code === 'open' && fireIncident?.dispatch_comment
    ? parseDispatchComments(fireIncident.dispatch_comment, dispatch.unit_codes)
    : new Map();

  // Helper function to get the latest status for a unit
  const getLatestStatus = (unit: any) => {
    if (!unit.statuses || unit.statuses.length === 0) return null;
    // Sort by created_at descending and take the first (most recent)
    const sortedStatuses = [...unit.statuses].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return sortedStatuses[0];
  };

  // Helper function to format time from ISO string
  const formatStatusTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div
      className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isClosed
          ? "bg-gray-50 dark:bg-gray-800 opacity-75"
          : "bg-white dark:bg-gray-700"
      } ${
        isOurUnitInvolved 
          ? "border-blue-500 dark:border-blue-400 hover:border-blue-600 dark:hover:border-blue-300" 
          : isClosed
            ? "border-gray-300 dark:border-gray-600"
            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex gap-4 h-full">
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900 dark:text-white">
                  {dispatch.type}
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium border ${getIncidentTypeColor(
                    dispatch.incident_type_code
                  )}`}
                >
                  {dispatch.incident_type_code}
                </span>
                <span className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs font-mono">
                  Dispatch ID: {dispatch.id}
                </span>
                {fireIncident?.incident_number && (
                  <span className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs font-mono">
                    Incident: {fireIncident.incident_number}
                  </span>
                )}
                {isOurUnitInvolved && (
                  <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                    OUR UNITS
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              {formatDispatchTime(dispatch.created_at)}
            </span>
          </div>

          <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            <div className="font-medium">{dispatch.address}</div>
            <div>
              {dispatch.city}, {dispatch.state_code}
            </div>
            {dispatch.cross_streets && (
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Near: {dispatch.cross_streets}
              </div>
            )}
          </div>

          {/* Responders Information */}
          {unitDispatch && unitDispatch.units && unitDispatch.units.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Responders
              </h4>
              <div className="space-y-1">
                {unitDispatch.units.map((unit) => {
                  const latestStatus = getLatestStatus(unit);
                  return (
                    <div key={unit.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">
                        {unit.name}
                      </span>
                      {latestStatus && (
                        <div className="flex items-center gap-2">
                          <span 
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              latestStatus.status_code === 'on_scene' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' :
                              latestStatus.status_code === 'enroute' || latestStatus.status_code === 'responding' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200' :
                              latestStatus.status_code === 'complete' || latestStatus.status_code === 'cancel' ? 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200' :
                              'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
                            }`}
                          >
                            {latestStatus.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatStatusTime(latestStatus.created_at)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-1 mt-auto">
            {dispatch.unit_codes.map((unit) => {
              const latestStatus = getUnitLatestStatus(unit, unitStatuses);
              const statusColor = latestStatus ? getStatusColor(latestStatus.status) : null;
              const isOur = isOurUnit([unit]);
              
              return (
                <span
                  key={unit}
                  className={`px-2 py-1 rounded text-xs font-medium border ${
                    isOur
                      ? statusColor 
                        ? `${statusColor.className} border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800`
                        : "bg-blue-500 text-white border-blue-600"
                      : statusColor
                        ? statusColor.className
                        : "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-500"
                  }`}
                  title={latestStatus ? `${latestStatus.status}: ${latestStatus.timestamp}${latestStatus.location ? ` at ${latestStatus.location}` : ''}` : undefined}
                >
                  <div className="flex flex-col items-center">
                    <div>{unit}</div>
                    {latestStatus && statusColor && (
                      <div className="text-xs opacity-90 mt-0.5">
                        {statusColor.label}
                      </div>
                    )}
                  </div>
                </span>
              );
            })}
          </div>
        </div>

        {/* Dispatch Comments - Right Side, Fixed Height with Scroll */}
        {fireIncident?.dispatch_comment && (
          <div className="flex-1 border-l border-gray-200 dark:border-gray-600 pl-4 min-w-0 flex flex-col">
            <div className="h-40 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm text-gray-700 dark:text-gray-300">
              {fireIncident.dispatch_comment
                .split("\n")
                .map((line, index) => (
                  <div key={index} className="mb-1 last:mb-0">
                    {line}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DispatchCard;
