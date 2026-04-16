"use client";
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase'; 

interface StudentRecord {
  id: string;
  student_name: string;
  quiz: number; laboratory: number; assignment: number;
  attendance: number; major_exam: number; final_grade: number;
}

export default function Home() {
  const [name, setName] = useState('');
  const [scores, setScores] = useState({
    quiz: { score: 0, total: 100 },
    lab: { score: 0, total: 100 },
    assign: { score: 0, total: 100 },
    atten: { score: 0, total: 100 },
    exam: { score: 0, total: 100 },
  });
  
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('student3_grades').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setRecords((data as StudentRecord[]) || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const getPercent = (part: { score: number; total: number }) => (part.total > 0 ? (part.score / part.total) * 100 : 0);

  const addStudent = async () => {
    if (!name.trim()) return alert("Enter Name");
    const { error } = await supabase.from('student3_grades').insert([{ 
      student_name: name, 
      quiz: getPercent(scores.quiz), laboratory: getPercent(scores.lab), 
      assignment: getPercent(scores.assign), attendance: getPercent(scores.atten), 
      major_exam: getPercent(scores.exam) 
    }]);
    if (error) alert("Error saving"); else { setName(''); fetchRecords(); }
  };

  const deleteRecord = async (id: string) => {
    if (confirm("Delete?")) {
      const { error } = await supabase.from('student3_grades').delete().eq('id', id);
      if (!error) fetchRecords();
    }
  };

  return (
    <main className="min-h-screen bg-[#f0f9f6] p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="bg-emerald-900 rounded-3xl p-8 shadow-xl mb-8 text-white border-b-4 border-emerald-500">
          <h1 className="text-3xl font-black tracking-tighter uppercase">Batch 103 Academic Portal</h1>
          <p className="text-emerald-400 font-bold mt-1 uppercase tracking-[0.2em] text-[10px]">Data Management • Section C</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-1 bg-white rounded-3xl p-6 shadow-md border border-emerald-100 h-fit">
            <h3 className="text-sm font-black text-emerald-900 uppercase mb-6 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span> Input Record
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Student Name</label>
                <input className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-emerald-500 outline-none font-bold text-black" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              {Object.keys(scores).map((k) => (
                <div key={k} className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase">{k}</span>
                  <div className="flex items-center bg-white rounded-xl px-3 py-2 border-2 border-slate-50 focus-within:border-emerald-500 transition-all">
                    <input type="number" className="w-full bg-transparent text-left font-bold text-black outline-none text-sm" placeholder="Score" onChange={(e) => setScores({...scores, [k]: {...scores[k as keyof typeof scores], score: Number(e.target.value)}})} />
                    <span className="text-slate-300 font-black mx-2">/</span>
                    <input type="number" className="w-10 bg-transparent text-center font-black text-emerald-600 outline-none text-sm" defaultValue={100} onChange={(e) => setScores({...scores, [k]: {...scores[k as keyof typeof scores], total: Number(e.target.value)}})} />
                  </div>
                </div>
              ))}
              <button onClick={addStudent} className="w-full bg-emerald-600 hover:bg-emerald-900 text-white font-black py-4 rounded-xl transition-all shadow-lg uppercase text-xs">Save Batch 103</button>
            </div>
          </div>

          <div className="xl:col-span-3 bg-white rounded-3xl shadow-md border border-emerald-50 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-emerald-50/30 flex justify-between items-center">
              <h3 className="text-sm font-black text-emerald-900 uppercase tracking-widest">Student Summary Table</h3>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full uppercase">Database 3 Active</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-[9px] font-black text-slate-400 uppercase">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-4 py-4 text-center">QZ</th><th className="px-4 py-4 text-center">LB</th>
                    <th className="px-4 py-4 text-center">AS</th><th className="px-4 py-4 text-center">AT</th>
                    <th className="px-4 py-4 text-center">EX</th><th className="px-6 py-4 text-center">Final</th>
                    <th className="px-6 py-4 text-right">Del</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-black">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-emerald-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-sm uppercase">{r.student_name}</td>
                      <td className="px-4 py-4 text-center font-bold text-slate-500 text-xs">{r.quiz?.toFixed(1)}</td>
                      <td className="px-4 py-4 text-center font-bold text-slate-500 text-xs">{r.laboratory?.toFixed(1)}</td>
                      <td className="px-4 py-4 text-center font-bold text-slate-500 text-xs">{r.assignment?.toFixed(1)}</td>
                      <td className="px-4 py-4 text-center font-bold text-slate-500 text-xs">{r.attendance?.toFixed(1)}</td>
                      <td className="px-4 py-4 text-center font-bold text-slate-500 text-xs">{r.major_exam?.toFixed(1)}</td>
                      <td className="px-6 py-4 text-center font-black text-emerald-700 bg-emerald-50/50">{r.final_grade?.toFixed(1)}%</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => deleteRecord(r.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}