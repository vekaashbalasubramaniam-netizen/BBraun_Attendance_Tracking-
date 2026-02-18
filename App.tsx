
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { 
  ROA_Type, 
  ROA_OPTIONS, 
  MonthlyReport, 
  ViewType, 
  MONTHS, 
  YEARS, 
  Employee,
  ShiftType,
  SHIFT_OPTIONS,
  MONTH_SHORTS
} from './types';
import { extractAttendanceData } from './services/geminiService';
import { 
  FileUp, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  TrendingDown,
  User,
  BrainCircuit,
  Database,
  TableProperties,
  Layers,
  BarChart3,
  Download,
  FileSpreadsheet,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const App: React.FC = () => {
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & State
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(YEARS[0]);
  const [uploadShift, setUploadShift] = useState<ShiftType>('A');
  const [selectedROAs, setSelectedROAs] = useState<ROA_Type[]>(ROA_OPTIONS);
  const [filterShift, setFilterShift] = useState<ShiftType>('A');
  const [compareShifts, setCompareShifts] = useState<ShiftType[]>(['A', 'B', 'C', 'D']);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Track which employees are expanded in Cross-Examine
  const [expandedEmployees, setExpandedEmployees] = useState<Record<string, boolean>>({});

  // Persistence Logic (SQL-like persistence via LocalStorage)
  useEffect(() => {
    const saved = localStorage.getItem('bb_attendance_db');
    if (saved) {
      try {
        setReports(JSON.parse(saved));
      } catch (e) {
        console.error("Database initialization failed", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bb_attendance_db', JSON.stringify(reports));
  }, [reports]);

  const toggleROA = (roa: ROA_Type) => {
    setSelectedROAs(prev => 
      prev.includes(roa) ? prev.filter(r => r !== roa) : [...prev, roa]
    );
  };

  const toggleCompareShift = (shift: ShiftType) => {
    setCompareShifts(prev => 
      prev.includes(shift) ? prev.filter(s => s !== shift) : [...prev, shift]
    );
  };

  const toggleEmployeeDetails = (name: string) => {
    setExpandedEmployees(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const data = await extractAttendanceData(base64, file.type);
        
        const newReport: MonthlyReport = {
          id: `rep-${Date.now()}`,
          month: selectedMonth,
          year: selectedYear,
          shift: uploadShift,
          fileName: file.name,
          uploadDate: Date.now(),
          data
        };

        setReports(prev => [newReport, ...prev]);
        setIsLoading(false);
        setActiveView('extraction');
      };
    } catch (err: any) {
      setError(err.message || 'Failed to extract data');
      setIsLoading(false);
    }
  };

  const deleteReport = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
  };

  const updateEmployeeData = (reportId: string, employeeId: string, roaType: ROA_Type, newCount: number) => {
    setReports(prev => prev.map(report => {
      if (report.id !== reportId) return report;
      return {
        ...report,
        data: report.data.map(emp => {
          if (emp.id !== employeeId) return emp;
          const updatedAbsences = emp.absences.map(abs => 
            abs.type === roaType ? { ...abs, count: newCount } : abs
          );
          if (!updatedAbsences.find(a => a.type === roaType)) {
             updatedAbsences.push({ type: roaType, count: newCount });
          }
          return { ...emp, absences: updatedAbsences };
        })
      };
    }));
  };

  const exportToExcel = (data: any[]) => {
    const headers = ["Employee Name", "Shift", "Summary", ...ROA_OPTIONS, "Total Absences"];
    const csvContent = [
      headers.join(","),
      ...data.map(emp => [
        `"${emp.name}"`,
        `"${emp.shift}"`,
        `"${emp.reports} Months Recorded"`,
        ...ROA_OPTIONS.map(roa => emp[roa] || 0),
        emp.total
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `B_Braun_Shift_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-50 p-2 rounded-lg"><Calendar className="text-blue-600 h-5 w-5" /></div>
            <span className="text-xs text-[#00A97A] bg-emerald-50 px-2 py-1 rounded-full font-bold">Database Active</span>
          </div>
          <h3 className="text-gray-900 text-xs font-bold uppercase tracking-widest">Global Reports</h3>
          <p className="text-3xl font-black text-gray-900 mt-1">{reports.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-amber-50 p-2 rounded-lg"><User className="text-amber-600 h-5 w-5" /></div>
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full font-bold">All Shifts</span>
          </div>
          <h3 className="text-gray-900 text-xs font-bold uppercase tracking-widest">Active Staff</h3>
          <p className="text-3xl font-black text-gray-900 mt-1">
            {new Set(reports.flatMap(r => r.data.map(e => e.name))).size}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-emerald-50 p-2 rounded-lg"><CheckCircle2 className="text-[#00A97A] h-5 w-5" /></div>
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-bold">Verified</span>
          </div>
          <h3 className="text-gray-900 text-xs font-bold uppercase tracking-widest">Total Days Recorded</h3>
          <p className="text-3xl font-black text-gray-900 mt-1">
            {reports.reduce((acc, r) => acc + r.data.reduce((eAcc, e) => eAcc + e.absences.reduce((aAcc, a) => aAcc + a.count, 0), 0), 0)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-black text-lg text-gray-900 uppercase tracking-tight">Report Repository</h3>
          <button onClick={() => setActiveView('upload')} className="text-[#00A97A] text-xs font-black uppercase tracking-widest border-b-2 border-[#00A97A]">Upload Report</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-900">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Month/Year</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Shift</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">File Details</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.map(report => (
                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-black text-gray-900">{report.month} {report.year}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-900 rounded-lg text-[10px] font-black uppercase tracking-widest border border-gray-200">Shift {report.shift}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{report.fileName}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => deleteReport(report.id)} className="text-red-500 hover:text-red-700 text-[10px] font-black uppercase tracking-tight">Delete</button>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    <Database className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm font-bold uppercase tracking-widest opacity-40">Repository Empty</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderUpload = () => (
    <div className="max-w-2xl mx-auto space-y-8 py-10 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50">
        <div className="text-center mb-8 text-gray-900">
          <h3 className="text-3xl font-black mb-2 uppercase tracking-tight">Data Ingestion</h3>
          <p className="font-semibold text-sm">Target Shift: <span className="text-[#00A97A] font-black uppercase">{uploadShift}</span></p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-900 uppercase tracking-widest">Month</label>
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-gray-100 text-gray-900 border-none font-black text-xs uppercase tracking-widest focus:ring-2 focus:ring-[#00A97A] transition-all appearance-none"
            >
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-900 uppercase tracking-widest">Year</label>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-gray-100 text-gray-900 border-none font-black text-xs uppercase tracking-widest focus:ring-2 focus:ring-[#00A97A] transition-all appearance-none"
            >
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-900 uppercase tracking-widest">Select Shift</label>
            <select 
              value={uploadShift}
              onChange={(e) => setUploadShift(e.target.value as ShiftType)}
              className="w-full px-4 py-3 rounded-2xl bg-emerald-50 text-[#00A97A] border-none font-black text-xs uppercase tracking-widest focus:ring-2 focus:ring-[#00A97A] transition-all appearance-none"
            >
              {SHIFT_OPTIONS.map(s => <option key={s} value={s}>Shift {s}</option>)}
            </select>
          </div>
        </div>

        <div className="relative group">
          <input 
            type="file" 
            accept="application/pdf,image/*" 
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={isLoading}
          />
          <div className={`border-2 border-dashed rounded-[2rem] p-12 text-center transition-all ${isLoading ? 'border-gray-200 bg-gray-50' : 'border-[#00A97A]/20 group-hover:border-[#00A97A] group-hover:bg-emerald-50/50'}`}>
            {isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 text-[#00A97A] animate-spin" />
                <p className="font-black text-gray-900 text-lg">AI Extracting Data...</p>
                <p className="text-xs text-gray-900 font-bold uppercase tracking-widest italic opacity-60">Optimizing for Shift {uploadShift}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="bg-[#00A97A] p-6 rounded-3xl group-hover:scale-110 transition-transform shadow-lg shadow-emerald-100">
                  <FileUp className="h-10 w-10 text-white" />
                </div>
                <div>
                  <p className="font-black text-xl text-gray-900 uppercase">Upload Attendance PDF</p>
                  <p className="text-xs text-gray-900 mt-1 font-bold uppercase tracking-widest italic opacity-60">Persistent Database Storage Enabled</p>
                </div>
              </div>
            )}
          </div>
        </div>
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3 border border-red-100">
            <AlertCircle className="h-5 w-5" />
            <span className="text-xs font-black uppercase tracking-tight">{error}</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderExtraction = () => {
    const report = reports.find(r => r.month === selectedMonth && r.year === selectedYear && r.shift === filterShift);
    const filteredData = report ? report.data.map(emp => ({
      ...emp,
      absences: emp.absences.filter(a => selectedROAs.includes(a.type))
    })).filter(emp => emp.absences.some(a => a.count > 0)) : [];

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm items-end text-gray-900">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Query Month</label>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-100 text-gray-900 border-none rounded-xl font-black outline-none text-xs uppercase focus:ring-2 focus:ring-[#00A97A]"
            >
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Query Year</label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-100 text-gray-900 border-none rounded-xl font-black outline-none text-xs uppercase focus:ring-2 focus:ring-[#00A97A]"
            >
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Filter Shift</label>
            <select 
              value={filterShift} 
              onChange={(e) => setFilterShift(e.target.value as ShiftType)} 
              className="w-full px-4 py-2.5 bg-emerald-50 text-[#00A97A] border-none rounded-xl font-black outline-none text-xs uppercase focus:ring-2 focus:ring-[#00A97A]"
            >
              {SHIFT_OPTIONS.map(s => <option key={s} value={s}>Shift {s}</option>)}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            {ROA_OPTIONS.map(roa => (
              <button 
                key={roa}
                onClick={() => toggleROA(roa)}
                className={`px-3 py-2.5 rounded-xl text-[10px] font-black transition-all border uppercase tracking-widest ${selectedROAs.includes(roa) ? 'bg-[#00A97A] text-white border-[#00A97A]' : 'bg-white text-gray-900 border-gray-100'}`}
              >
                {roa}
              </button>
            ))}
          </div>
        </div>

        {!report ? (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight">Data Unavailable</h4>
            <p className="text-gray-400 mt-2 font-bold uppercase text-[10px] tracking-widest">Please upload a report for Shift {filterShift} in {selectedMonth}</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-900">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Employee Profile</th>
                    {selectedROAs.map(roa => (
                      <th key={roa} className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-center">{roa}</th>
                    ))}
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Sum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredData.map(emp => {
                    const total = emp.absences.reduce((acc, a) => acc + a.count, 0);
                    return (
                      <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-gray-900 text-white flex items-center justify-center text-xs font-black">
                              {emp.name.charAt(0)}
                            </div>
                            <span className="font-black text-gray-900 text-sm uppercase tracking-tight">{emp.name}</span>
                          </div>
                        </td>
                        {selectedROAs.map(roa => (
                          <td key={roa} className="px-6 py-5 text-center">
                            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black ${emp.absences.find(a => a.type === roa)?.count ? 'bg-[#00A97A] text-white' : 'text-gray-900 opacity-20'}`}>
                              {emp.absences.find(a => a.type === roa)?.count || '-'}
                            </span>
                          </td>
                        ))}
                        <td className="px-8 py-5 text-right font-black text-gray-900 text-lg">{total}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAnalysis = () => {
    if (reports.length === 0) {
      return (
        <div className="text-center py-32 bg-white rounded-[2.5rem] border border-dashed border-gray-100">
          <TableProperties className="h-20 w-20 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-gray-900 uppercase">Analysis Offline</h3>
          <p className="text-gray-400 mt-2 font-black uppercase text-[10px] tracking-widest">Please upload data to begin cross-examination</p>
        </div>
      );
    }

    const employeeAggregation: Record<string, { 
      name: string, 
      total: number, 
      reports: number, 
      months: Set<string>, 
      shift: ShiftType, 
      monthlyLogs: Record<string, Record<ROA_Type, number>>,
      [key: string]: any 
    }> = {};

    const filteredReports = reports.filter(r => r.shift === filterShift);

    filteredReports.forEach(report => {
      const monthKey = `${report.month} ${report.year}`;
      report.data.forEach(emp => {
        if (!employeeAggregation[emp.name]) {
          employeeAggregation[emp.name] = { 
            name: emp.name,
            total: 0, 
            reports: 0, 
            months: new Set(),
            shift: report.shift,
            monthlyLogs: {}
          };
          ROA_OPTIONS.forEach(roa => employeeAggregation[emp.name][roa] = 0);
        }
        
        const relevantAbsences = emp.absences.filter(a => selectedROAs.includes(a.type));
        const count = relevantAbsences.reduce((acc, a) => acc + a.count, 0);
        
        if (count > 0) {
          employeeAggregation[emp.name].reports += 1;
          employeeAggregation[emp.name].months.add(monthKey);
          
          if (!employeeAggregation[emp.name].monthlyLogs[monthKey]) {
            employeeAggregation[emp.name].monthlyLogs[monthKey] = { AL: 0, EL: 0, MC: 0, ABS: 0, HP: 0 };
          }

          relevantAbsences.forEach(a => {
            employeeAggregation[emp.name][a.type] += a.count;
            employeeAggregation[emp.name].total += a.count;
            employeeAggregation[emp.name].monthlyLogs[monthKey][a.type] += a.count;
          });
        }
      });
    });

    const results = Object.entries(employeeAggregation)
      .map(([name, stats]) => ({ ...stats }))
      .filter(e => e.total > 0 && e.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => (b.reports - a.reports) || (b.total - a.total));

    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm gap-6">
          <div className="space-y-2 flex-1 w-full lg:w-auto">
            <h3 className="font-black text-2xl text-gray-900 uppercase tracking-tight">Recurring Behavior Analysis</h3>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative w-full lg:w-64 text-gray-900">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search Employee..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 text-gray-900 border-none rounded-xl font-black outline-none text-xs uppercase focus:ring-2 focus:ring-[#00A97A] transition-all"
                />
              </div>
              <div className="flex items-center gap-3">
                <select 
                  value={filterShift} 
                  onChange={(e) => setFilterShift(e.target.value as ShiftType)} 
                  className="px-4 py-2 bg-gray-100 text-gray-900 border-none rounded-xl font-black outline-none text-[10px] uppercase tracking-widest focus:ring-2 focus:ring-[#00A97A]"
                >
                  {SHIFT_OPTIONS.map(s => <option key={s} value={s}>Shift {s} Only</option>)}
                </select>
                <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Aggregated from {filteredReports.length} Reports</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex gap-2">
              {ROA_OPTIONS.map(roa => (
                <button 
                  key={roa}
                  onClick={() => toggleROA(roa)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border uppercase tracking-widest ${selectedROAs.includes(roa) ? 'bg-[#00A97A] text-white' : 'bg-white text-gray-900 border-gray-100'}`}
                >
                  {roa}
                </button>
              ))}
            </div>
            <button 
              onClick={() => exportToExcel(results)}
              className="flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
            >
              <FileSpreadsheet className="h-5 w-5 text-[#00A97A]" /> Export Analysis
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((emp) => {
            const isExpanded = expandedEmployees[emp.name];
            return (
              <div key={emp.name} className={`bg-white p-8 rounded-[2.5rem] border-2 transition-all group ${emp.reports > 1 ? 'border-red-100 shadow-xl shadow-red-50/20' : 'border-gray-50 hover:border-emerald-100'}`}>
                <div className="flex justify-between items-start mb-6 text-gray-900">
                  <div className="flex items-center gap-5">
                    <div className={`h-14 w-14 rounded-[1.5rem] flex items-center justify-center font-black text-xl shadow-inner ${emp.reports > 2 ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 text-xl uppercase tracking-tight group-hover:text-[#00A97A] transition-colors">{emp.name}</h4>
                      <span className={`text-[11px] font-black uppercase px-3 py-1 rounded-lg mt-1 inline-block ${emp.reports > 1 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-900'}`}>
                        Found in {emp.reports} Months
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleEmployeeDetails(emp.name)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isExpanded ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                  >
                    {isExpanded ? <><ChevronUp className="h-4 w-4" /> Compact</> : <><ChevronDown className="h-4 w-4" /> View Details</>}
                  </button>
                </div>

                {!isExpanded ? (
                  /* Compact View */
                  <div className="mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in duration-300">
                    <p className="text-[9px] font-black text-gray-900 uppercase tracking-widest mb-1 opacity-60 italic">Activity Timeline</p>
                    <div className="flex flex-wrap gap-1 mt-2 text-gray-900">
                       {Array.from(emp.months).sort((a,b) => new Date(a).getTime() - new Date(b).getTime()).map(m => (
                         <span key={m} className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-black text-gray-900">{m}</span>
                       ))}
                    </div>
                  </div>
                ) : (
                  /* Expanded Granular Monthly Log View */
                  <div className="space-y-4 mb-8 animate-in slide-in-from-top-2 fade-in duration-300">
                    <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-2 flex items-center gap-2">
                        <Clock className="h-3 w-3" /> Granular Monthly Log
                    </h5>
                    <div className="grid grid-cols-1 gap-2 text-gray-900">
                        {Object.entries(emp.monthlyLogs).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()).map(([month, logs]) => (
                          <div key={month} className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl border border-gray-100">
                            <span className="text-[10px] font-black text-gray-900 uppercase tracking-tight">{month}</span>
                            <div className="flex gap-3">
                              {ROA_OPTIONS.map(roa => (
                                logs[roa] > 0 && (
                                  <div key={roa} className="flex flex-col items-center">
                                    <span className="text-[8px] font-black text-gray-900 opacity-60 uppercase leading-none mb-1">{roa}</span>
                                    <span className="text-sm font-black text-gray-900 leading-none">{logs[roa]}</span>
                                  </div>
                                )
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                
                {/* Summary Grid (Always Visible) */}
                <div className="grid grid-cols-5 gap-3 mb-8">
                  {ROA_OPTIONS.map(roa => (
                    <div key={roa} className={`text-center p-3 rounded-2xl border ${emp[roa] > 0 ? 'bg-emerald-50 border-emerald-100 shadow-sm' : 'bg-white border-gray-50 opacity-40'}`}>
                      <p className="text-[9px] text-gray-900 font-black uppercase tracking-tighter mb-1">{roa}</p>
                      <p className={`text-sm font-black ${emp[roa] > 0 ? 'text-[#00A97A]' : 'text-gray-900'}`}>{emp[roa] || 0}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-between items-center bg-gray-50 -mx-8 -mb-8 p-8 rounded-b-[2.5rem]">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-900 font-black uppercase tracking-widest opacity-60 italic">Total Combined Record</span>
                  </div>
                  <span className="text-3xl font-black text-gray-900">{emp.total} <span className="text-xs text-gray-900 opacity-40 uppercase">Days</span></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Summary Stats Table */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden mt-12">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h4 className="font-black text-lg text-gray-900 uppercase tracking-tight">Global Absence Distribution</h4>
                <div className="px-4 py-2 bg-white border border-gray-200 rounded-xl">
                  <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Aggregated Matrix</span>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-gray-900">
                    <thead className="bg-white border-b border-gray-100 text-gray-900">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Shift Identity</th>
                            {ROA_OPTIONS.map(roa => (
                                <th key={roa} className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-center">{roa} Total</th>
                            ))}
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Sum Impact</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {SHIFT_OPTIONS.map(shift => {
                            const shiftReports = reports.filter(r => r.shift === shift);
                            const totals: Record<string, number> = { total: 0 };
                            ROA_OPTIONS.forEach(roa => totals[roa] = 0);
                            
                            shiftReports.forEach(r => r.data.forEach(e => e.absences.forEach(a => {
                                totals[a.type] += a.count;
                                totals.total += a.count;
                            })));

                            return (
                                <tr key={shift} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3 text-gray-900">
                                            <div className="h-8 w-8 rounded-lg bg-gray-900 text-white flex items-center justify-center text-xs font-black">
                                                {shift}
                                            </div>
                                            <span className="font-black text-gray-900 uppercase text-xs">Shift {shift} Team</span>
                                        </div>
                                    </td>
                                    {ROA_OPTIONS.map(roa => (
                                        <td key={roa} className="px-6 py-5 text-center">
                                            <span className={`text-sm font-black ${totals[roa] > 0 ? 'text-gray-900' : 'text-gray-900 opacity-20'}`}>
                                                {totals[roa]}
                                            </span>
                                        </td>
                                    ))}
                                    <td className="px-8 py-5 text-right font-black text-gray-900 text-lg">
                                        {totals.total} <span className="text-[10px] uppercase font-bold text-gray-900">Days</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    if (reports.length === 0) return (
      <div className="text-center py-32 bg-white rounded-[2.5rem] border border-dashed border-gray-100">
        <TrendingDown className="h-20 w-20 text-gray-300 mx-auto mb-6" />
        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Analytics Sync Required</h3>
      </div>
    );

    const timelineMap: Record<string, any> = {};
    const sortedReports = [...reports].sort((a, b) => new Date(`${a.month} ${a.year}`).getTime() - new Date(`${b.month} ${b.year}`).getTime());
    
    sortedReports.forEach(report => {
      const key = `${report.month.slice(0, 3)} ${report.year}`;
      if (!timelineMap[key]) {
        timelineMap[key] = { name: key };
        SHIFT_OPTIONS.forEach(s => ROA_OPTIONS.forEach(roa => timelineMap[key][`${s}_${roa}`] = 0));
      }
      report.data.forEach(emp => emp.absences.forEach(abs => timelineMap[key][`${report.shift}_${abs.type}`] += abs.count));
    });

    const finalChartData = Object.values(timelineMap);
    const roaColors: Record<ROA_Type, string> = { AL: '#00A97A', EL: '#FF9500', MC: '#5856D6', ABS: '#FF3B30', HP: '#32ADE6' };

    // Enforce sequence A, B, C, D
    const sortedCompareShifts = SHIFT_OPTIONS.filter(s => compareShifts.includes(s));

    return (
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 text-gray-900">
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden text-gray-900">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 gap-8">
            <div>
              <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Shift Comparison Matrix</h3>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1 shadow-inner">
                {SHIFT_OPTIONS.map(s => (
                  <button 
                    key={s} 
                    onClick={() => toggleCompareShift(s)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${compareShifts.includes(s) ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Shift {s}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {ROA_OPTIONS.map(roa => (
                  <button 
                    key={roa}
                    onClick={() => toggleROA(roa)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${selectedROAs.includes(roa) ? 'bg-white border-gray-200 text-gray-900 shadow-md' : 'bg-gray-50 border-transparent text-gray-900 opacity-40'}`}
                  >
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: roaColors[roa] }} />
                    {roa}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-[550px] w-full text-gray-900">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={finalChartData} margin={{ top: 50, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#000000', fontSize: 10, fontWeight: '900'}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#000000', fontSize: 10, fontWeight: '900'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '20px' }}
                  itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#000000' }}
                  formatter={(value: any, name: string) => [`${value} Days`, `Shift ${name.split('_')[0]} - ${name.split('_')[1]}`]}
                />
                
                {sortedCompareShifts.map(shift => (
                   selectedROAs.map((roa, rIdx) => (
                    <Bar 
                      key={`${shift}_${roa}`}
                      dataKey={`${shift}_${roa}`} 
                      stackId={shift} 
                      fill={roaColors[roa]} 
                      radius={rIdx === selectedROAs.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                      maxBarSize={40}
                      // Labelling: Each bar stack now has its shift label (A, B, C, D) at the TOP
                      label={rIdx === selectedROAs.length - 1 ? { 
                        position: 'top', 
                        content: (props: any) => {
                          const { x, y, width } = props;
                          return (
                            <text x={x + width / 2} y={y - 12} fill="#000000" fontSize={11} fontWeight={900} textAnchor="middle" className="uppercase font-black">
                              {shift}
                            </text>
                          );
                        }
                      } : undefined}
                    />
                   ))
                ))}
                
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '60px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }} 
                        formatter={(value) => <span className="text-gray-900">{value.split('_')[1] || value}</span>} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderTraining = () => {
    const report = reports.find(r => r.month === selectedMonth && r.year === selectedYear && r.shift === filterShift);
    return (
      <div className="space-y-6 animate-in fade-in duration-500 text-gray-900">
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex gap-8 items-center">
            <div className="bg-emerald-50 p-6 rounded-3xl text-[#00A97A] shadow-inner shadow-emerald-100/50"><BrainCircuit className="h-10 w-10" /></div>
            <div>
              <h3 className="font-black text-2xl text-gray-900 uppercase tracking-tight">Manual Override Lab</h3>
              <p className="text-xs font-black text-gray-900 mt-1 uppercase tracking-widest italic opacity-60">Adjust persistent data records</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
             <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="px-6 py-3 bg-gray-100 text-gray-900 border-none rounded-2xl font-black outline-none text-[10px] uppercase tracking-widest focus:ring-2 focus:ring-[#00A97A]">
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
             </select>
             <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="px-6 py-3 bg-gray-100 text-gray-900 border-none rounded-2xl font-black outline-none text-[10px] uppercase tracking-widest focus:ring-2 focus:ring-[#00A97A]">
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
             </select>
             <select value={filterShift} onChange={(e) => setFilterShift(e.target.value as ShiftType)} className="px-6 py-3 bg-emerald-50 text-[#00A97A] border-none rounded-2xl font-black outline-none text-[10px] uppercase tracking-widest focus:ring-2 focus:ring-[#00A97A]">
                {SHIFT_OPTIONS.map(s => <option key={s} value={s}>Shift {s}</option>)}
             </select>
          </div>
        </div>

        {!report ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-100 text-gray-900">
            <Database className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">No record found in persistence</p>
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden text-gray-900">
             <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-900">
                  <tr>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest">Employee Profile</th>
                    {ROA_OPTIONS.map(roa => (
                      <th key={roa} className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-center">{roa}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {report.data.map(emp => (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-10 py-6">
                        <span className="font-black text-gray-900 uppercase text-sm tracking-tight">{emp.name}</span>
                      </td>
                      {ROA_OPTIONS.map(roa => {
                        const val = emp.absences.find(a => a.type === roa)?.count || 0;
                        return (
                          <td key={roa} className="px-6 py-6 text-center">
                            <input type="number" min="0" value={val} onChange={(e) => updateEmployeeData(report.id, emp.id, roa, parseInt(e.target.value) || 0)}
                              className="w-16 px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-center font-black text-gray-900 text-sm focus:bg-white focus:ring-2 focus:ring-[#00A97A] transition-all" />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        )}
      </div>
    );
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard': return renderDashboard();
      case 'upload': return renderUpload();
      case 'extraction': return renderExtraction();
      case 'analysis': return renderAnalysis();
      case 'analytics': return renderAnalytics();
      case 'training': return renderTraining();
      default: return renderDashboard();
    }
  };

  return (
    <Layout activeView={activeView} setView={setActiveView}>
      {renderActiveView()}
    </Layout>
  );
};

export default App;
