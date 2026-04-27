import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  ShieldAlert, 
  IndianRupee, 
  PieChart, 
  BarChart3, 
  AlertTriangle,
  Info
} from 'lucide-react';

// --- MOCK DATA ---
const generateData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let baseValue = 100000;
  let benchmarkValue = 100000;
  
  return months.map((month, index) => {
    // Generate realistic looking fluctuations
    const trend = index * 1500;
    const volatility = (Math.random() - 0.4) * 8000;
    const benchVolatility = (Math.random() - 0.5) * 5000;
    
    baseValue = baseValue + trend + volatility;
    benchmarkValue = benchmarkValue + (index * 1200) + benchVolatility;
    
    return {
      month,
      portfolio: Math.round(baseValue),
      benchmark: Math.round(benchmarkValue),
    };
  });
};

const historicalData = generateData();

const assetAllocation = [
  { name: 'Domestic Equities', value: 45, color: '#2563EB' }, // Blue 600
  { name: 'International Equities', value: 25, color: '#3B82F6' }, // Blue
  { name: 'Fixed Income', value: 20, color: '#8B5CF6' }, // Purple
  { name: 'Alternatives', value: 5, color: '#F59E0B' }, // Amber
  { name: 'Cash equivalents', value: 5, color: '#10B981' }, // Emerald
];

const riskMetrics = [
  { label: 'Beta (1Y)', value: '1.15', status: 'warning', desc: 'Slightly more volatile than market' },
  { label: 'Sharpe Ratio', value: '1.42', status: 'good', desc: 'Good risk-adjusted return' },
  { label: 'Max Drawdown', value: '-12.4%', status: 'alert', desc: 'Highest drop from peak' },
  { label: 'Value at Risk (95%)', value: '₹4,250', status: 'neutral', desc: 'Max expected monthly loss' },
];

// --- COMPONENTS ---

// 1. Metric Card
const MetricCard = ({ title, value, change, isPositive, icon: Icon }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4 opacity-[0.03] transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform duration-500">
      <Icon size={80} />
    </div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <h3 className="text-slate-500 font-medium text-sm tracking-wider uppercase">{title}</h3>
      <div className={`p-2 rounded-lg ${isPositive ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
        <Icon size={20} />
      </div>
    </div>
    <div className="relative z-10">
      <h2 className="text-3xl font-bold text-slate-900 mb-2">{value}</h2>
      <div className="flex items-center text-sm">
        <span className={`flex items-center font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
          {isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
          {change}
        </span>
        <span className="text-slate-400 ml-2">vs last year</span>
      </div>
    </div>
  </div>
);

// 2. Custom Interactive SVG Line Chart
const InteractiveLineChart = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  // Chart dimensions
  const height = 300;
  const width = 800; // ViewBox width
  const padding = { top: 20, right: 20, bottom: 30, left: 70 }; // Slightly wider for INR formatting
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Scales
  const allValues = data.flatMap(d => [d.portfolio, d.benchmark]);
  const minValue = Math.min(...allValues) * 0.95; // Add some padding at the bottom
  const maxValue = Math.max(...allValues) * 1.05;

  const getX = (index) => padding.left + (index * (innerWidth / (data.length - 1)));
  const getY = (value) => padding.top + innerHeight - ((value - minValue) / (maxValue - minValue)) * innerHeight;

  // Path generators
  const createPath = (key) => {
    return data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d[key])}`).join(' ');
  };

  // Format currency to INR
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Portfolio Performance</h2>
          <p className="text-slate-500 text-sm">YTD Growth vs Benchmark</p>
        </div>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-blue-600 mr-2 shadow-[0_0_8px_rgba(37,99,235,0.4)]"></div> <span className="text-slate-600">Portfolio</span></div>
          <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-slate-400 mr-2"></div> <span className="text-slate-600">S&P 500 (Bench)</span></div>
        </div>
      </div>

      <div className="relative w-full h-[300px]" onMouseLeave={() => setHoveredIndex(null)}>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Grid lines & Y-Axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding.top + (innerHeight * ratio);
            const val = maxValue - ((maxValue - minValue) * ratio);
            return (
              <g key={i}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e2e8f0" strokeDasharray="4 4" />
                <text x={padding.left - 10} y={y + 4} fill="#64748b" fontSize="12" textAnchor="end">{formatCurrency(val)}</text>
              </g>
            );
          })}

          {/* X-Axis labels */}
          {data.map((d, i) => (
            <text key={i} x={getX(i)} y={height - 5} fill="#64748b" fontSize="12" textAnchor="middle">
              {d.month}
            </text>
          ))}

          {/* Trend Line (Linear Regression visual approximation) */}
          <line 
            x1={getX(0)} y1={getY(data[0].portfolio)} 
            x2={getX(data.length-1)} y2={getY(data[data.length-1].portfolio)} 
            stroke="#2563EB" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="10 5" 
          />

          {/* Benchmark Line */}
          <path d={createPath('benchmark')} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 5" />
          
          {/* Portfolio Line with Gradient Drop Shadow */}
          <defs>
             <linearGradient id="glow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path 
            d={`${createPath('portfolio')} L ${getX(data.length-1)} ${getY(minValue)} L ${getX(0)} ${getY(minValue)} Z`} 
            fill="url(#glow)" 
          />
          <path d={createPath('portfolio')} fill="none" stroke="#2563EB" strokeWidth="3" />

          {/* Interactive Hover Overlay */}
          {data.map((d, i) => (
            <g key={`interaction-${i}`}>
              <rect 
                x={getX(i) - (innerWidth / data.length) / 2} 
                y={padding.top} 
                width={innerWidth / data.length} 
                height={innerHeight} 
                fill="transparent" 
                onMouseEnter={() => setHoveredIndex(i)}
                className="cursor-crosshair"
              />
              {/* Hover indicators */}
              {hoveredIndex === i && (
                <>
                  <line x1={getX(i)} y1={padding.top} x2={getX(i)} y2={height - padding.bottom} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx={getX(i)} cy={getY(d.portfolio)} r="6" fill="#ffffff" stroke="#2563EB" strokeWidth="3" />
                  <circle cx={getX(i)} cy={getY(d.benchmark)} r="5" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" />
                </>
              )}
            </g>
          ))}
        </svg>

        {/* Custom Tooltip (HTML overlay for easier styling) */}
        {hoveredIndex !== null && (
          <div 
            className="absolute top-0 pointer-events-none bg-white border border-slate-200 p-3 rounded-lg shadow-xl text-sm transition-all duration-75"
            style={{ 
              left: `calc(${(hoveredIndex / (data.length - 1)) * 100}% - 70px)`, 
              transform: 'translateY(-10px)' 
            }}
          >
            <div className="font-semibold text-slate-800 mb-2 text-center">{data[hoveredIndex].month} 2024</div>
            <div className="flex justify-between space-x-4 mb-1">
              <span className="text-blue-600">Portfolio:</span>
              <span className="font-medium text-slate-900">{formatCurrency(data[hoveredIndex].portfolio)}</span>
            </div>
            <div className="flex justify-between space-x-4">
              <span className="text-slate-500">Benchmark:</span>
              <span className="font-medium text-slate-900">{formatCurrency(data[hoveredIndex].benchmark)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 3. Asset Allocation Bar Chart (Alternative to Pie for cleaner modern look)
const AssetAllocation = () => (
  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm h-full">
    <div className="flex items-center mb-6">
      <PieChart className="text-blue-600 mr-3" size={24} />
      <h2 className="text-xl font-bold text-slate-900">Asset Allocation</h2>
    </div>
    
    <div className="space-y-5">
      {assetAllocation.map((asset, i) => (
        <div key={i}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-700 font-medium">{asset.name}</span>
            <span className="text-slate-900 font-bold">{asset.value}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div 
              className="h-2.5 rounded-full" 
              style={{ width: `${asset.value}%`, backgroundColor: asset.color }}
            ></div>
          </div>
        </div>
      ))}
    </div>
    
    <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
      <div className="flex items-start">
        <Info className="text-blue-600 mr-2 flex-shrink-0 mt-0.5" size={16} />
        <p className="text-xs text-slate-600 leading-relaxed">
          Your portfolio is currently overweight in Domestic Equities (+5% vs target). Rebalancing is recommended to align with your moderate risk profile.
        </p>
      </div>
    </div>
  </div>
);

// 4. Risk Indicators Module
const RiskIndicators = () => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'good': return 'text-emerald-600 bg-emerald-100 border-emerald-200';
      case 'warning': return 'text-amber-600 bg-amber-100 border-amber-200';
      case 'alert': return 'text-rose-600 bg-rose-100 border-rose-200';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'good': return <Activity size={16} />;
      case 'warning': return <AlertTriangle size={16} />;
      case 'alert': return <ShieldAlert size={16} />;
      default: return <Info size={16} />;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm h-full">
      <div className="flex items-center mb-6">
        <Activity className="text-rose-600 mr-3" size={24} />
        <h2 className="text-xl font-bold text-slate-900">Risk Analysis</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {riskMetrics.map((metric, i) => (
          <div key={i} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <h3 className="text-slate-500 text-xs uppercase tracking-wider mb-2">{metric.label}</h3>
            <div className="flex items-end justify-between mb-2">
              <span className="text-2xl font-bold text-slate-900">{metric.value}</span>
              <div className={`flex items-center px-2 py-1 rounded border text-xs ${getStatusColor(metric.status)}`}>
                <span className="mr-1">{getStatusIcon(metric.status)}</span>
                <span className="capitalize">{metric.status}</span>
              </div>
            </div>
            <p className="text-slate-500 text-xs">{metric.desc}</p>
          </div>
        ))}
      </div>

      {/* Volatility Gauge Simulation */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700">Current Volatility Index</span>
          <span className="text-sm font-bold text-amber-600">Elevated</span>
        </div>
        <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-400 opacity-80"></div>
          {/* Indicator marker */}
          <div className="absolute top-0 h-full w-1.5 bg-white shadow-[0_0_5px_rgba(0,0,0,0.3)]" style={{ left: '65%' }}></div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD APP ---
export default function App() {
  const latestData = historicalData[historicalData.length - 1];
  
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans selection:bg-blue-500/30">
      
      {/* Header aligned with portfolio context */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-6">
        <div>
          <div className="text-blue-600 text-xs font-bold tracking-[0.2em] mb-2 uppercase">Client Dashboard // North Tech Solutions</div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Financial Data Visualizer</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Interactive portfolio performance tracking, dynamic asset allocation modeling, and risk indicators.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3 bg-white border border-slate-200 py-2 px-4 rounded-lg shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-sm font-medium text-slate-600">Live Market Data Sync: <span className="text-slate-900">Active</span></span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Level Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <MetricCard 
            title="Total Portfolio Value" 
            value="₹1,45,280.00" 
            change="+18.4%" 
            isPositive={true} 
            icon={IndianRupee} 
          />
          <MetricCard 
            title="Net Contributions" 
            value="₹24,000.00" 
            change="+5.0%" 
            isPositive={true} 
            icon={BarChart3} 
          />
          <MetricCard 
            title="Unrealized Gain/Loss" 
            value="₹21,280.00" 
            change="+12.2%" 
            isPositive={true} 
            icon={TrendingUp} 
          />
          <MetricCard 
            title="30-Day Volatility" 
            value="14.2%" 
            change="+2.1%" 
            isPositive={false} 
            icon={Activity} 
          />
        </div>

        {/* Main Charting Area */}
        <div className="w-full">
          <InteractiveLineChart data={historicalData} />
        </div>

        {/* Lower Modules: Allocation & Risk */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
          <AssetAllocation />
          <RiskIndicators />
        </div>
        
      </main>
    </div>
  );
}
