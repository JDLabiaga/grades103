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
    if (!name.trim()) return alert("Enter Student Name");
    const { error } = await supabase.from('student3_grades').insert([{ 
      student_name: name, 
      quiz: getPercent(scores.quiz), laboratory: getPercent(scores.lab), 
      assignment: getPercent(scores.assign), attendance: getPercent(scores.atten), 
      major_exam: getPercent(scores.exam) 
    }]);
    if (error) alert("Sync Error"); else { setName(''); fetchRecords(); }
  };

  const deleteRecord = async (id: string) => {
    if (confirm("Confirm Deletion?")) {
      const { error } = await supabase.from('student3_grades').delete().eq('id', id);
      if (!error) fetchRecords();
    }
  };

  return (
    <main className="min-h-screen bg-white flex flex-col md:flex-row font-sans text-slate-900">
      
      {/* SIDEBAR: Dark Minimalist Navigation */}
      <aside className="w-full md:w-72 bg-slate-900 md:min-h-screen p-8 flex flex-col">
        <div className="mb-12">
          <h1 className="text-xl font-black text-white tracking-widest uppercase">Academic Portal</h1>
          <div className="h-1 w-12 bg-blue-500 mt-2"></div>
        </div>

        <div className="space-y-8 flex-grow">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 block">Main Entry</label>
            <input 
              className="w-full bg-slate-800 border-none rounded-lg p-3 text-sm font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Student Name" value={name} onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block">Grade Weights</label>
            {Object.keys(scores).map((k) => (
              <div key={k} className="flex items-center justify-between group">
                <span className="text-xs font-bold text-slate-400 uppercase group-hover:text-white transition-colors">{k}</span>
                <input 
                  type="number" className="w-16 bg-slate-800 text-center rounded-md p-1 text-xs font-black text-blue-400 outline-none"
                  placeholder="0" onChange={(e) => setScores({...scores, [k]: {...scores[k as keyof typeof scores], score: Number(e.target.value)}})}
                />
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={addStudent}
          className="mt-8 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all shadow-lg text-xs uppercase tracking-widest active:scale-95"
        >
          Push to Cloud
        </button>
      </aside>

      {/* MAIN CONTENT: Clean Data Display */}
      <section className="flex-grow p-6 md:p-12 bg-slate-50">
        <header className="flex justify-between items-end mb-10 border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Active Records</h2>
            <p className="text-3xl font-light text-slate-800">Database <span className="font-black">Batch 03</span></p>
          </div>
          <div className="text-right">
            <span className="text-xs font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 uppercase">
              {records.length} Total Students
            </span>
          </div>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase">
                <th className="px-8 py-5">Full Identity</th>
                <th className="px-6 py-5 text-center">Score Matrix</th>
                <th className="px-6 py-5 text-center">Finalized</th>
                <th className="px-8 py-5 text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-all">
                  <td className="px-8 py-6">
                    <p className="font-black text-slate-800 text-sm uppercase">{r.student_name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Status: Enrolled</p>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="flex justify-center gap-2">
                      {['quiz', 'laboratory'].map(key => (
                        <div key={key} className="bg-slate-100 px-3 py-1 rounded text-[9px] font-black text-slate-600 uppercase border border-slate-200">
                          {key[0]}: {r[key as keyof StudentRecord]}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className="text-lg font-black text-slate-900">
                      {r.final_grade?.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => deleteRecord(r.id)} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="p-20 text-center font-black text-slate-300 uppercase text-xs animate-pulse">Establishing Connection...</div>}
        </div>
      </section>
    </main>
  );
}