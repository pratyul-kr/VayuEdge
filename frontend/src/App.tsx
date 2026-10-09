import React, { useState, useEffect, useCallback } from 'react';
import {
  NavigationTab,
  OverviewData,
  SensorDetail,
  SensorFusionData,
  ForecastDetailData,
  SourceAttributionData,
  PredictionsData,
  DecisionsPageData,
  EventsData,
  NodesData,
  LocalMapData,
  SystemStatusData
} from './types';
import { api } from './services/api';

// Layout
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { DemoScenarioBar } from './components/common/DemoScenarioBar';

// Pages
import { OverviewPage } from './components/pages/OverviewPage';
import { LiveMonitorPage } from './components/pages/LiveMonitorPage';
import { SensorFusionPage } from './components/pages/SensorFusionPage';
import { ForecastPage } from './components/pages/ForecastPage';
import { SourcesPage } from './components/pages/SourcesPage';
import { PredictionsPage } from './components/pages/PredictionsPage';
import { DecisionsPage } from './components/pages/DecisionsPage';
import { MapPage } from './components/pages/MapPage';
import { EventsPage } from './components/pages/EventsPage';
import { NodesPage } from './components/pages/NodesPage';
import { SystemPage } from './components/pages/SystemPage';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentScenario, setCurrentScenario] = useState('road_dust');

  // App data states
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [sensorsData, setSensorsData] = useState<SensorDetail[] | null>(null);
  const [fusionData, setFusionData] = useState<SensorFusionData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastDetailData | null>(null);
  const [sourcesData, setSourcesData] = useState<SourceAttributionData | null>(null);
  const [predictionsData, setPredictionsData] = useState<PredictionsData | null>(null);
  const [decisionsData, setDecisionsData] = useState<DecisionsPageData | null>(null);
  const [eventsData, setEventsData] = useState<EventsData | null>(null);
  const [nodesData, setNodesData] = useState<NodesData | null>(null);
  const [mapData, setMapData] = useState<LocalMapData | null>(null);
  const [systemData, setSystemData] = useState<SystemStatusData | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  // Sync state
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [unsyncedCount, setUnsyncedCount] = useState(0);

  // Load active tab data
  const loadData = useCallback(async () => {
    try {
      // Always load overview to maintain top-level header metrics
      const ov = await api.getOverview();
      setOverviewData(ov);
      setIsOnline(ov.air_quality.is_online);

      // Load specific view data
      if (currentTab === 'monitor') {
        const sensors = await api.getSensors();
        setSensorsData(sensors);
      } else if (currentTab === 'sensors') {
        const fusion = await api.getSensorFusion();
        setFusionData(fusion);
      } else if (currentTab === 'forecast') {
        const fc = await api.getForecast();
        setForecastData(fc);
      } else if (currentTab === 'sources') {
        const src = await api.getSources();
        setSourcesData(src);
      } else if (currentTab === 'predictions') {
        const pred = await api.getPredictions();
        setPredictionsData(pred);
      } else if (currentTab === 'decisions') {
        const dec = await api.getDecisions();
        setDecisionsData(dec);
      } else if (currentTab === 'events') {
        const evts = await api.getEvents();
        setEventsData(evts);
      } else if (currentTab === 'nodes') {
        const nds = await api.getNodes();
        setNodesData(nds);
      } else if (currentTab === 'map') {
        const mp = await api.getLocalMap();
        setMapData(mp);
      } else if (currentTab === 'system') {
        const sys = await api.getSystemStatus();
        setSystemData(sys);
        setUnsyncedCount(sys.unsynced_readings_queued);
      }
    } catch (err: any) {
      console.warn('Network request failed, serving offline cache or state:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sensor cards fallback polling if WebSocket is not delivering
  useEffect(() => {
    if (currentTab !== 'monitor') return;
    let cancelled = false;
    // Initial fetch for the tab
    api.getSensors().then(sensors => {
      if (!cancelled) setSensorsData(sensors);
    }).catch(() => {});

    return () => { cancelled = true; };
  }, [currentTab]);

  // Live WebSocket streaming with automatic reconnection and smooth state updates
  useEffect(() => {
    let ws: WebSocket | null = null;
    let fallbackInterval: any = null;
    let reconnectTimeout: any = null;
    let isSubscribed = true;

    const connectWs = () => {
      if (!isSubscribed) return;
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        ws = new WebSocket(`${protocol}//${host}/ws/sensors`);

        ws.onopen = () => {
          if (fallbackInterval) {
            clearInterval(fallbackInterval);
            fallbackInterval = null;
          }
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'TELEMETRY_UPDATE' && msg.payload) {
              setOverviewData(msg.payload);
              setIsOnline(msg.payload.air_quality.is_online);
              if (msg.sensors && Array.isArray(msg.sensors)) {
                setSensorsData(msg.sensors);
              }
            }
          } catch (e) {
            console.error('Error parsing WS message:', e);
          }
        };

        ws.onerror = () => {
          if (!fallbackInterval && isSubscribed) {
            fallbackInterval = setInterval(loadData, 2000);
          }
        };

        ws.onclose = () => {
          if (!fallbackInterval && isSubscribed) {
            fallbackInterval = setInterval(loadData, 2000);
          }
          if (isSubscribed) {
            reconnectTimeout = setTimeout(connectWs, 2000);
          }
        };
      } catch {
        if (!fallbackInterval && isSubscribed) {
          fallbackInterval = setInterval(loadData, 2000);
        }
        if (isSubscribed) {
          reconnectTimeout = setTimeout(connectWs, 2000);
        }
      }
    };

    connectWs();

    return () => {
      isSubscribed = false;
      if (ws) ws.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [loadData]);

  // Handle Demo Scenario Switch
  const handleSelectScenario = async (scenarioId: string) => {
    try {
      setCurrentScenario(scenarioId);
      await api.activateScenario(scenarioId);
      await loadData();
    } catch (err) {
      console.error('Error activating scenario:', err);
    }
  };

  // Handle Toggle Offline Simulation
  const handleToggleOffline = async () => {
    try {
      const res = await api.toggleOffline();
      setIsOnline(res.is_internet_connected);
      setUnsyncedCount(res.unsynced_records_queued);
      await loadData();
    } catch (err) {
      console.error('Error toggling offline:', err);
    }
  };

  // Handle Synchronize Telemetry Trigger
  const handleSync = async () => {
    try {
      setIsSyncing(true);
      await api.triggerSync();
      setUnsyncedCount(0);
      setIsSyncing(false);
      await loadData();
    } catch (err) {
      setIsSyncing(false);
      console.error('Error syncing:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-12 md:pb-0">
      {/* Demo Scenario Controller Bar at the very top */}
      <DemoScenarioBar
        currentScenario={currentScenario}
        onSelectScenario={handleSelectScenario}
        isOnline={isOnline}
        onToggleOffline={handleToggleOffline}
        onSync={handleSync}
      />

      {/* Main Sticky Header */}
      <Header
        nodeName={overviewData?.node_name || 'NODE-01: Main Gate'}
        location={overviewData?.location || 'North Campus'}
        isOnline={isOnline}
        isSyncing={isSyncing}
        unsyncedCount={unsyncedCount}
        lastUpdated={overviewData?.air_quality.last_updated || 'Live'}
        onSync={handleSync}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Layout Shell: Sidebar + Main Content */}
      <div className="flex-1 flex">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {isLoading && !overviewData ? (
            <div className="max-w-7xl mx-auto py-20 text-center">
              <div className="inline-block p-4 neo-card bg-white">
                <div className="font-bold text-sm text-slate-900">
                  Loading sensor telemetry...
                </div>
                <div className="text-xs text-slate-500 font-mono mt-1">
                  Connecting to Arduino UNO Q edge service
                </div>
              </div>
            </div>
          ) : (
            <>
              {currentTab === 'overview' && overviewData && (
                <OverviewPage data={overviewData} onNavigate={setCurrentTab} />
              )}

              {currentTab === 'monitor' && (
                sensorsData ? (
                  <LiveMonitorPage sensors={sensorsData} />
                ) : (
                  <div className="p-8 text-center text-slate-500 font-bold">Loading sensor channels...</div>
                )
              )}

              {currentTab === 'sensors' && (
                fusionData ? (
                  <SensorFusionPage data={fusionData} />
                ) : (
                  <div className="p-8 text-center text-slate-500 font-bold">Loading fusion pipeline...</div>
                )
              )}

              {currentTab === 'forecast' && (
                forecastData ? (
                  <ForecastPage data={forecastData} />
                ) : (
                  <div className="p-8 text-center text-slate-500 font-bold">Loading forecast model...</div>
                )
              )}

              {currentTab === 'sources' && (
                sourcesData ? (
                  <SourcesPage data={sourcesData} />
                ) : (
                  <div className="p-8 text-center text-slate-500 font-bold">Loading source attribution...</div>
                )
              )}

              {currentTab === 'predictions' && (
                predictionsData ? (
                  <PredictionsPage data={predictionsData} />
                ) : (
                  <div className="p-8 text-center text-slate-500 font-bold">Loading predictions...</div>
                )
              )}

              {currentTab === 'decisions' && (
                decisionsData ? (
                  <DecisionsPage data={decisionsData} />
                ) : (
                  <div className="p-8 text-center text-slate-500 font-bold">Loading decision traces...</div>
                )
              )}

              {currentTab === 'map' && (
                mapData ? (
                  <MapPage data={mapData} />
                ) : (
                  <div className="p-8 text-center text-slate-500 font-bold">Loading local map...</div>
                )
              )}

              {currentTab === 'events' && (
                eventsData ? (
                  <EventsPage data={eventsData} />
                ) : (
                  <div className="p-8 text-center text-slate-500 font-bold">Loading event log...</div>
                )
              )}

              {currentTab === 'nodes' && (
                nodesData ? (
                  <NodesPage data={nodesData} />
                ) : (
                  <div className="p-8 text-center text-slate-500 font-bold">Loading edge nodes...</div>
                )
              )}

              {currentTab === 'system' && (
                systemData ? (
                  <SystemPage
                    data={systemData}
                    onSelectScenario={handleSelectScenario}
                    onToggleOffline={handleToggleOffline}
                    onSync={handleSync}
                  />
                ) : (
                  <div className="p-8 text-center text-slate-500 font-bold">Loading diagnostics...</div>
                )
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />
    </div>
  );
}

export default App;
