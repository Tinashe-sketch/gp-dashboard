// Replace import statements with global variables
const { useState, useEffect } = React;
const { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} = Recharts;
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function GPDashboard() {
  // Sample data with mass included
  const sampleData = [
    // Period 1
    { category: 'Beverages', channel: 'Hotels', salesperson: 'John Smith', revenue: 100000, cost: 60000, quantity: 2000, mass: 2500, period: 'Jan 2025' },
    { category: 'Beverages', channel: 'Retail', salesperson: 'Emma Johnson', revenue: 80000, cost: 48000, quantity: 1600, mass: 2000, period: 'Jan 2025' },
    { category: 'Food', channel: 'Hotels', salesperson: 'John Smith', revenue: 120000, cost: 72000, quantity: 2400, mass: 3000, period: 'Jan 2025' },
    { category: 'Food', channel: 'Retail', salesperson: 'Mike Williams', revenue: 90000, cost: 54000, quantity: 1800, mass: 2400, period: 'Jan 2025' },
    
    // Period 2
    { category: 'Beverages', channel: 'Hotels', salesperson: 'John Smith', revenue: 110000, cost: 63000, quantity: 2100, mass: 2600, period: 'Feb 2025' },
    { category: 'Beverages', channel: 'Retail', salesperson: 'Emma Johnson', revenue: 85000, cost: 50000, quantity: 1700, mass: 2100, period: 'Feb 2025' },
    { category: 'Food', channel: 'Hotels', salesperson: 'John Smith', revenue: 130000, cost: 75000, quantity: 2500, mass: 3100, period: 'Feb 2025' },
    { category: 'Food', channel: 'Retail', salesperson: 'Mike Williams', revenue: 95000, cost: 56000, quantity: 1900, mass: 2500, period: 'Feb 2025' }
  ];

  // States
  const [data] = useState(sampleData);
  const [period1, setPeriod1] = useState('Jan 2025');
  const [period2, setPeriod2] = useState('Feb 2025');
  const [drillLevel, setDrillLevel] = useState('main');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [availablePeriods] = useState(['Jan 2025', 'Feb 2025']);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPeriods, setFilteredPeriods] = useState(['Jan 2025', 'Feb 2025']);
  const [activeTab, setActiveTab] = useState('category'); // Options: category, channel, salesperson

  // Format functions
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value.toFixed(2)}%`;
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-ZA').format(value);
  };

  // Reset drill down
  const resetDrillDown = () => {
    setDrillLevel('main');
    setSelectedCategory(null);
    setSelectedChannel(null);
  };
  
  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    // Filter periods based on search term
    if (term.trim() === '') {
      setFilteredPeriods(availablePeriods);
    } else {
      const filtered = availablePeriods.filter(period => 
        period.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredPeriods(filtered);
      
      // If we have filtered results and current selections aren't in them, update selections
      if (filtered.length > 0) {
        if (!filtered.includes(period1)) {
          setPeriod1(filtered[0]);
        }
        if (!filtered.includes(period2)) {
          setPeriod2(filtered.length > 1 ? filtered[1] : filtered[0]);
        }
      }
    }
  };

  // Handle drill down
  const drillDown = (item) => {
    if (drillLevel === 'main') {
      setSelectedCategory(item.name);
      setDrillLevel('channel');
    } else if (drillLevel === 'channel') {
      setSelectedChannel(item.name);
      setDrillLevel('product');
    }
  };

  // Handle drill up
  const drillUp = () => {
    if (drillLevel === 'product') {
      setSelectedChannel(null);
      setDrillLevel('channel');
    } else if (drillLevel === 'channel') {
      setSelectedCategory(null);
      setDrillLevel('main');
    }
  };

  // Get filtered data
  const getFilteredData = (period) => {
    let filtered = data.filter(item => item.period === period);
    
    if (activeTab === 'category' && selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    if (activeTab === 'channel' && selectedChannel) {
      filtered = filtered.filter(item => item.channel === selectedChannel);
    }
    
    if (activeTab === 'salesperson' && selectedChannel) {
      // Using selectedChannel state to store selected salesperson for simplicity
      filtered = filtered.filter(item => item.salesperson === selectedChannel);
    }
    
    return filtered;
  };

  // Process data for charts and tables
  const processData = (periodData) => {
    const results = [];
    
    // Group data based on active tab and drill level
    const groupMap = {};
    
    periodData.forEach(item => {
      let key;
      if (activeTab === 'category') {
        if (drillLevel === 'main') key = item.category;
        else if (drillLevel === 'channel') key = item.channel;
        else key = item.product || 'Product';
      } else if (activeTab === 'channel') {
        if (drillLevel === 'main') key = item.channel;
        else if (drillLevel === 'channel') key = item.category;
        else key = item.product || 'Product';
      } else if (activeTab === 'salesperson') {
        if (drillLevel === 'main') key = item.salesperson;
        else if (drillLevel === 'channel') key = item.category;
        else key = item.channel;
      }
      
      if (!groupMap[key]) {
        groupMap[key] = {
          name: key,
          revenue: 0,
          cost: 0,
          quantity: 0,
          mass: 0
        };
      }
      
      groupMap[key].revenue += item.revenue;
      groupMap[key].cost += item.cost;
      groupMap[key].quantity += item.quantity;
      groupMap[key].mass += item.mass;
    });
    
    // Calculate total mass for sales mix
    const totalMass = Object.values(groupMap).reduce((sum, item) => sum + item.mass, 0);
    
          // Calculate metrics
    for (const key in groupMap) {
      const item = groupMap[key];
      const gp = item.revenue - item.cost;
      const gpMargin = item.revenue > 0 ? (gp / item.revenue) * 100 : 0;
      const gpPerKg = item.mass > 0 ? gp / item.mass : 0;
      const salesMixOnMass = totalMass > 0 ? (item.mass / totalMass) * 100 : 0;
      
      // Calculate new metrics
      const sellingPricePerKg = item.mass > 0 ? item.revenue / item.mass : 0;
      // Assuming a rebate percentage of 5% for demonstration purposes
      const rebatePercent = 5; 
      const revenueAfterRebate = item.revenue * (1 - (rebatePercent / 100));
      const sellingPriceAfterRebate = item.mass > 0 ? revenueAfterRebate / item.mass : 0;
      
      results.push({
        ...item,
        gp,
        gpMargin,
        gpPerKg,
        salesMixOnMass,
        sellingPricePerKg,
        rebatePercent,
        sellingPriceAfterRebate
      });
    }
    
    return results;
  };

  // Get comparison data for charts
  const getComparisonData = () => {
    const data1 = processData(getFilteredData(period1));
    const data2 = processData(getFilteredData(period2));
    
    return data1.map(item1 => {
      const item2 = data2.find(i => i.name === item1.name) || { gpMargin: 0, salesMixOnMass: 0 };
      
      return {
        name: item1.name,
        [`gp_${period1}`]: item1.gpMargin,
        [`gp_${period2}`]: item2.gpMargin,
        [`mix_${period1}`]: item1.salesMixOnMass,
        [`mix_${period2}`]: item2.salesMixOnMass
      };
    });
  };

  // Calculate summary
  const calculateSummary = (period) => {
    const periodData = getFilteredData(period);
    
    const totalRevenue = periodData.reduce((sum, item) => sum + item.revenue, 0);
    const totalCost = periodData.reduce((sum, item) => sum + item.cost, 0);
    const totalGP = totalRevenue - totalCost;
    const totalMass = periodData.reduce((sum, item) => sum + item.mass, 0);
    const avgMargin = totalRevenue > 0 ? (totalGP / totalRevenue) * 100 : 0;
    
    return {
      totalRevenue,
      totalCost,
      totalGP,
      totalMass,
      avgMargin
    };
  };

  // Get title
  const getDrillTitle = () => {
    if (activeTab === 'category') {
      if (drillLevel === 'main') return 'Categories';
      if (drillLevel === 'channel') return `Channels for ${selectedCategory}`;
      if (drillLevel === 'product') return `Products for ${selectedChannel}`;
    } else if (activeTab === 'channel') {
      if (drillLevel === 'main') return 'Channels';
      if (drillLevel === 'channel') return `Categories for ${selectedCategory}`;
      if (drillLevel === 'product') return `Products for ${selectedChannel}`;
    } else if (activeTab === 'salesperson') {
      if (drillLevel === 'main') return 'Salespersons';
      if (drillLevel === 'channel') return `Categories for ${selectedCategory}`;
      if (drillLevel === 'product') return `Channels for ${selectedChannel}`;
    }
    return '';
  };

  const period2Data = processData(getFilteredData(period2));
  const comparisonData = getComparisonData();
  const summary1 = calculateSummary(period1);
  const summary2 = calculateSummary(period2);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-gray-900 text-white p-4">
        <h1 className="text-2xl font-bold">GP Dashboard</h1>
        <p className="text-sm opacity-80">With Mass and Sales Mix Data</p>
      </header>

      <main className="flex-grow p-4">
        {/* Import/Export Controls */}
        <div className="mb-4 bg-white p-4 rounded shadow">
          <h3 className="mb-2 text-sm font-medium">Import/Export Data</h3>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-grow">
              <label className="block text-xs text-gray-600 mb-1">Import CSV File</label>
              <input
                type="file"
                accept=".csv"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-1 text-xs text-green-500">
                Import your own data or use the sample data
              </p>
            </div>
            <div>
              <button
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export to Excel
              </button>
            </div>
          </div>
        </div>

        {/* Period Controls */}
        <div className="mb-4 bg-white p-4 rounded shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="mb-2 text-sm font-medium">Compare Periods</h3>
              <div className="mb-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search periods..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full border rounded px-3 py-2 pl-8 text-sm"
                  />
                  <svg 
                    className="w-4 h-4 absolute left-2 top-2.5 text-gray-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                  </svg>
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilteredPeriods(availablePeriods);
                      }}
                      className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {filteredPeriods.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">No matching periods found</p>
                )}
              </div>
              <div className="flex gap-2">
                <select 
                  value={period1}
                  onChange={(e) => setPeriod1(e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  {filteredPeriods.map(period => (
                    <option key={`p1-${period}`} value={period}>{period}</option>
                  ))}
                </select>
                <span className="self-center">vs</span>
                <select 
                  value={period2}
                  onChange={(e) => setPeriod2(e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  {filteredPeriods.map(period => (
                    <option key={`p2-${period}`} value={period}>{period}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              {/* View Tabs */}
              <div className="mb-4">
                <h3 className="mb-2 text-sm font-medium">View By</h3>
                <div className="flex border rounded overflow-hidden">
                  <button
                    onClick={() => {
                      setActiveTab('category');
                      resetDrillDown();
                    }}
                    className={`flex-1 py-2 px-4 text-center text-sm ${
                      activeTab === 'category' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Category
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('channel');
                      resetDrillDown();
                    }}
                    className={`flex-1 py-2 px-4 text-center text-sm ${
                      activeTab === 'channel' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Channel
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('salesperson');
                      resetDrillDown();
                    }}
                    className={`flex-1 py-2 px-4 text-center text-sm ${
                      activeTab === 'salesperson' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Salesperson
                  </button>
                </div>
              </div>

              {/* Breadcrumbs */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Current View: {getDrillTitle()}</h3>
                {drillLevel !== 'main' && (
                  <button 
                    onClick={drillUp}
                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded flex items-center text-sm"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                    </svg>
                    Up
                  </button>
                )}
              </div>
              <div className="flex items-center text-sm">
                <button
                  onClick={resetDrillDown}
                  className={`px-2 py-1 rounded ${drillLevel === 'main' ? 'bg-blue-100 text-blue-800' : 'text-blue-600 hover:underline'}`}
                >
                  All {activeTab === 'category' ? 'Categories' : activeTab === 'channel' ? 'Channels' : 'Salespersons'}
                </button>
                
                {selectedCategory && (
                  <>
                    <span className="mx-2 text-gray-400">/</span>
                    <button
                      className={`px-2 py-1 rounded ${drillLevel === 'channel' ? 'bg-blue-100 text-blue-800' : 'text-blue-600 hover:underline'}`}
                    >
                      {selectedCategory}
                    </button>
                  </>
                )}
                
                {selectedChannel && (
                  <>
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                      {selectedChannel}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-xs text-gray-500">Gross Profit</h3>
            <p className="text-2xl font-bold">{formatCurrency(summary2.totalGP)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {summary2.totalGP > summary1.totalGP ? '+' : ''}
              {formatPercent((summary2.totalGP - summary1.totalGP) / summary1.totalGP * 100)} vs {period1}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-xs text-gray-500">Mass (kg)</h3>
            <p className="text-2xl font-bold">{formatNumber(summary2.totalMass)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {summary2.totalMass > summary1.totalMass ? '+' : ''}
              {formatPercent((summary2.totalMass - summary1.totalMass) / summary1.totalMass * 100)} vs {period1}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-xs text-gray-500">GP Margin</h3>
            <p className="text-2xl font-bold">{formatPercent(summary2.avgMargin)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {summary2.avgMargin > summary1.avgMargin ? '+' : ''}
              {formatPercent(summary2.avgMargin - summary1.avgMargin)} pts vs {period1}
            </p>
          </div>
        </div>

        {/* GP% and Sales Mix% Chart */}
        <div className="mb-4 bg-white p-4 rounded shadow">
          <h3 className="mb-2 text-sm font-medium">GP% and Sales Mix% by {getDrillTitle()}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => formatPercent(value)} />
                <Legend />
                <Bar dataKey={`gp_${period1}`} name={`GP% (${period1})`} fill="#4F46E5" />
                <Bar dataKey={`gp_${period2}`} name={`GP% (${period2})`} fill="#818CF8" />
                <Bar dataKey={`mix_${period1}`} name={`Mix% (${period1})`} fill="#10B981" />
                <Bar dataKey={`mix_${period2}`} name={`Mix% (${period2})`} fill="#6EE7B7" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium">Details by {getDrillTitle()} ({period2})</h3>
            <button
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export This View
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left border-b">Name</th>
                  <th className="px-4 py-2 text-right border-b">Revenue</th>
                  <th className="px-4 py-2 text-right border-b">Cost</th>
                  <th className="px-4 py-2 text-right border-b">GP</th>
                  <th className="px-4 py-2 text-right border-b">GP %</th>
                  <th className="px-4 py-2 text-right border-b">Selling Price/kg</th>
                  <th className="px-4 py-2 text-right border-b">Rebate %</th>
                  <th className="px-4 py-2 text-right border-b">SP After Rebate/kg</th>
                  <th className="px-4 py-2 text-right border-b">Quantity</th>
                  <th className="px-4 py-2 text-right border-b">Mass (kg)</th>
                  <th className="px-4 py-2 text-right border-b">Sales Mix %</th>
                  <th className="px-4 py-2 text-center border-b">Action</th>
                </tr>
              </thead>
              <tbody>
                {period2Data.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(item.revenue)}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(item.cost)}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(item.gp)}</td>
                    <td className="px-4 py-2 text-right">{formatPercent(item.gpMargin)}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(item.sellingPricePerKg)}</td>
                    <td className="px-4 py-2 text-right">{formatPercent(item.rebatePercent)}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(item.sellingPriceAfterRebate)}</td>
                    <td className="px-4 py-2 text-right">{formatNumber(item.quantity)}</td>
                    <td className="px-4 py-2 text-right">{formatNumber(item.mass)}</td>
                    <td className="px-4 py-2 text-right">{formatPercent(item.salesMixOnMass)}</td>
                    <td className="px-4 py-2 text-center">
                      {drillLevel !== 'product' && (
                        <button
                          onClick={() => drillDown(item)}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                        >
                          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                          Drill Down
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-white p-4 text-center">
        <p className="text-sm">GP Dashboard • Created {new Date().toLocaleDateString()}</p>
      </footer>
    </div>
  );
}

export default GPDashboard;
// Render the app
ReactDOM.render(
  React.createElement(GPDashboard),
  document.getElementById('root')
);
