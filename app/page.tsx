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
    <main className="min-h-screen bg-white flex flex-col md:flex-row font-sans text-emerald-950">
      
      {/* SIDEBAR: Emerald Navigation */}
      <aside className="w-full md:w-80 bg-emerald-950 md:min-h-screen p-8 flex flex-col border-r border-emerald-800">
        <div className="mb-10">
          <h1 className="text-xl font-black text-white tracking-widest uppercase">Academic Portal</h1>
          <div className="h-1.5 w-10 bg-emerald-400 mt-2 rounded-full"></div>
        </div>

        <div className="space-y-6 flex-grow overflow-y-auto pr-2 custom-scrollbar">
          <div>
            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3 block">Identity</label>
            <input 
              className="w-full bg-emerald-900/50 border border-emerald-700/50 rounded-xl p-4 text-sm font-bold text-white focus:ring-2 focus:ring-emerald-400 outline-none transition-all placeholder:text-emerald-700"
              placeholder="Full Student Name" value={name} onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block">Performance Matrix</label>
            {Object.keys(scores).map((k) => (
              <div key={k} className="bg-emerald-900/30 p-4 rounded-2xl border border-emerald-800/40">
                <span className="text-[10px] font-black text-emerald-400 uppercase block mb-3">{k}</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <p className="text-[9px] text-emerald-600 font-bold uppercase mb-1">Score</p>
                    <input 
                      type="number" className="w-full bg-emerald-950 border border-emerald-700 rounded-lg p-2 text-xs font-black text-white outline-none focus:border-emerald-400"
                      onChange={(e) => setScores({...scores, [k]: {...scores[k as keyof typeof scores], score: Number(e.target.value)}})}
                    />
                  </div>
                  <div className="flex-1 text-center self-end pb-2 font-black text-emerald-700">/</div>
                  <div className="flex-1">
                    <p className="text-[9px] text-emerald-600 font-bold uppercase mb-1">Total</p>
                    <input 
                      type="number" className="w-full bg-emerald-950 border border-emerald-700 rounded-lg p-2 text-xs font-black text-emerald-400 outline-none focus:border-emerald-400"
                      defaultValue={100} onChange={(e) => setScores({...scores, [k]: {...scores[k as keyof typeof scores], total: Number(e.target.value)}})}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={addStudent}
          className="mt-8 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black py-4 rounded-2xl transition-all shadow-lg text-xs uppercase tracking-widest active:scale-95"
        >
          Commit to Database
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <section className="flex-grow p-6 md:p-12 bg-emerald-50/30">
        <header className="flex justify-between items-end mb-10 border-b border-emerald-100 pb-8">
          <div>
            <h2 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Management Console</h2>
            <p className="text-3xl font-light text-emerald-900">Registered <span className="font-black">Records</span></p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-5 py-2.5 rounded-full border border-emerald-200 uppercase tracking-widest">
              {records.length} Active Nodes
            </span>
          </div>
        </header>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-emerald-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-emerald-900 text-[10px] font-black text-emerald-400 uppercase">
                <th className="px-10 py-6">Student Information</th>
                <th className="px-6 py-6 text-center">Data Points</th>
                <th className="px-6 py-6 text-center">Evaluation</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-emerald-50/50 transition-all group">
                  <td className="px-10 py-8">
                    <p className="font-black text-emerald-950 text-base uppercase tracking-tight">{r.student_name}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 self-center"></span>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase">System Verified</p>
                    </div>
                  </td>
                  <td className="px-6 py-8 text-center">
                    <div className="grid grid-cols-3 gap-1 max-w-[180px] mx-auto">
                      {['quiz', 'laboratory', 'assignment'].map(key => (
                        <div key={key} className="bg-white px-2 py-1 rounded text-[8px] font-black text-emerald-800 uppercase border border-emerald-100 shadow-sm">
                          {key[0]}{key[1]}: {r[key as keyof StudentRecord]?.toFixed(0)}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-8 text-center">
                    <div className="inline-block bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                      <span className="text-xl font-black text-emerald-600">
                        {r.final_grade?.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button onClick={() => deleteRecord(r.id)} className="p-3 text-emerald-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="p-24 text-center font-black text-emerald-200 uppercase text-[10px] tracking-[0.5em] animate-pulse">Establishing Cloud Link...</div>}
        </div>
      </section>
    </main>
  );
}