// src/components/RecentActivityComponent.jsx
import React, { useState, useEffect } from 'react';
import RecentActivityCard from './RecentActivityCard';
import { fetchRecentActivity } from '../utils/requests/expense';

export default function RecentActivityComponent() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch recent activities on component mount
  const loadRecentActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchRecentActivity();
      
      if (response && response.activities) {
        setActivities(response.activities);
      } else {
        setActivities([]);
      }
    } catch (err) {
      console.error('Error loading recent activities:', err);
      setError(err.message || 'Failed to load recent activities');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecentActivities();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {/* Compact loading skeleton */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center p-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse mr-3"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-2 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mx-auto mb-2">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-xs text-gray-600">{error}</p>
        <button
          onClick={loadRecentActivities}
          className="text-xs text-blue-600 hover:text-blue-800 mt-2"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Activities List - No header since it's handled by parent */}
      {activities.length === 0 ? (
        <div className="text-center py-6">
          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-xs text-gray-600 mb-1">No recent activity</p>
          <p className="text-xs text-gray-400">Your activities will appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-100">
          {activities.map((activity, index) => (
            <RecentActivityCard
              key={activity.id || index}
              activityType={activity.activityType}
              id={activity.id}
              timestamp={activity.timestamp}
              description={activity.description}
            />
          ))}
        </div>
      )}
    </div>
  );
}