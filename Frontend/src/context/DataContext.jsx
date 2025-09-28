
import React, { createContext, useState, useEffect } from 'react';
import { healthCheck } from '../services/api'; // Using healthCheck as a placeholder for the new endpoint
import sampleData from '../../../Backend/sample_frontend_response.json';

export const DataContext = createContext();

const priorityOrder = {
  high: 1,
  medium: 2,
  low: 3,
};

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use sample JSON data for AI recommendations, but get live data for other parts
        const response = await fetch('http://localhost:8000/api/intelligence/dashboard');
        const liveData = await response.json();
        
        // Fetch actual inventory data
        const inventoryResponse = await fetch('http://localhost:8000/api/inventory-items/');
        const inventoryData = await inventoryResponse.json();
        
        // Fetch intelligence signals for Intelligence Hub (with fallback)
        let intelligenceSignals = [];
        try {
          const intelligenceResponse = await fetch('http://localhost:8000/api/intelligence-signals/');
          if (intelligenceResponse.ok) {
            intelligenceSignals = await intelligenceResponse.json();
          }
        } catch (intelligenceError) {
          console.warn('Failed to fetch intelligence signals, using sample data only:', intelligenceError);
        }

        // Sort sample recommendations by priority and impact
        const sortedRecommendations = [...sampleData.recommendations].sort((a, b) => {
          // First sort by priority (high=1, medium=2, low=3)
          const priorityA = priorityOrder[a.priority?.toLowerCase()] || 4;
          const priorityB = priorityOrder[b.priority?.toLowerCase()] || 4;
          
          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }
          
          // If same priority, sort by profit impact (highest first)
          return (b.profit_impact || 0) - (a.profit_impact || 0);
        });

        // Create hybrid intelligence signals: backend + sample fallback
        const mappedIntelligenceSignals = intelligenceSignals.map(signal => ({
          name: signal.name,
          category: signal.category,
          summary: signal.impact_description,
          impactPct: signal.impact_value,
          trend: signal.impact_value > 0 ? 'up' : 'down',
          // Keep original for additional data
          ...signal
        }));

        // Combine backend intelligence signals with sample data as fallback
        const hybridIntelligenceSignals = [
          ...mappedIntelligenceSignals,
          // Add sample alerts as additional intelligence signals if backend is limited
          ...sampleData.alerts.map(alert => ({
            name: alert.title || alert.message,
            category: alert.category,
            summary: alert.message,
            type: alert.type,
            priority: alert.priority,
            // Keep original alert data
            ...alert
          }))
        ];

        // Combine live data with sample recommendations and inventory data
        const combinedData = {
          ...liveData,
          recommendations: sortedRecommendations,
          // Use hybrid intelligence signals for Intelligence Hub
          intelligenceSignals: hybridIntelligenceSignals,
          // Keep original sample alerts for Inventory page
          alerts: sampleData.alerts,
          // Add actual inventory data
          inventory: inventoryData,
          summary: {
            ...liveData.summary,
            total_recommendations: sortedRecommendations.length,
            total_profit_impact: sampleData.summary.total_profit_impact
          }
        };

        setData(combinedData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{ data, loading, error }}>
      {children}
    </DataContext.Provider>
  );
};
