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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  
  // Logic: Set score to empty string so it doesn't show 0 by default
  const [scores, setScores] = useState<any>({
    quiz: { score: '', total: 100 },
    lab: { score: '', total: 100 },
    assign: { score: '', total: 100 },
    atten: { score: '', total: 100 },
    exam: { score: '', total: 100 },
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

  const resetForm = () => {
    setName('');
    setEditingId(null);
    setScores({
      quiz: { score: '', total: 100 },
      lab: { score: '', total: 100 },
      assign: { score: '', total: 100 },
      atten: { score: '', total: 100 },
      exam: { score: '', total: 100 },
    });
  };

  const addStudent = async () => {
    if (!name.trim()) return alert("Enter Student Name");
    
    const getP = (part: any) => (part.total > 0 ? (Number(part.score) / part.total) * 100 : 0);

    const payload = { 
      student_name: name, 
      quiz: getP(scores.quiz), 
      laboratory: getP(scores.lab), 
      assignment: getP(scores.assign), 
      attendance: getP(scores.atten), 
      major_exam: getP(scores.exam) 
    };

    let error;
    if (editingId) {
      const { error: updateError } = await supabase.from('student3_grades').update(payload).eq('id', editingId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('student3_grades').insert([payload]);
      error = insertError;
    }

    if (error) alert("Sync Error"); 
    else { resetForm(); fetchRecords(); }
  };

  const handleEdit = (r: StudentRecord) => {
    setEditingId(r.id);
    setName(r.student_name);
    setScores({
      quiz: { score: r.quiz, total: 100 },
      lab: { score: r.laboratory, total: 100 },
      assign: { score: r.assignment, total: 100 },
      atten: { score: r.attendance, total: 100 },
      exam: { score: r.major_exam, total: 100 },
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteRecord = async (id: string) => {
    if (confirm("Confirm Deletion?")) {
      const { error } = await supabase.from('student3_grades').delete().eq('id', id);
      if (!error) fetchRecords();
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-emerald-950">
      
      <aside className="w-full md:w-80 bg-emerald-950 md:min-h-screen p-8 flex flex-col border-r border-emerald-900 shadow-2xl z-10 sticky top-0">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-xl font-black text-white tracking-[0.2em] uppercase">Academic Portal</h1>
          <div className="h-1 w-12 bg-emerald-400 mt-3 rounded-full mx-auto md:mx-0"></div>
          {editingId && <p className="text-[10px] text-emerald-300 font-bold mt-3 uppercase animate-pulse tracking-widest text-center">Modifying Node</p>}
        </div>

        <div className="space-y-6 flex-grow overflow-y-auto pr-2 custom-scrollbar">
          <div>
            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3 block">Full Name</label>
            <input 
              className="w-full bg-emerald-900/40 border border-emerald-800 rounded-xl p-4 text-sm font-bold text-white focus:ring-2 focus:ring-emerald-400 outline-none transition-all placeholder:text-emerald-800"
              placeholder="e.g. John Doe" value={name} onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block">Grade Matrix</label>
            {Object.keys(scores).map((k) => (
              <div key={k} className="bg-emerald-900/20 p-4 rounded-2xl border border-emerald-800/30 group hover:border-emerald-500/50 transition-all">
                <span className="text-[10px] font-black text-emerald-400 uppercase block mb-3">{k} Input</span>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-[8px] text-emerald-600 font-bold uppercase mb-1">Raw</p>
                    <input 
                      type="number" className="w-full bg-emerald-950 border border-emerald-800 rounded-lg p-2 text-sm font-black text-white outline-none focus:border-emerald-400 placeholder:text-emerald-900"
                      placeholder="--"
                      value={scores[k].score}
                      onChange={(e) => setScores({...scores, [k]: {...scores[k], score: e.target.value}})}
                    />
                  </div>
                  <div className="text-emerald-800 font-black self-end pb-2">/</div>
                  <div className="flex-1">
                    <p className="text-[8px] text-emerald-600 font-bold uppercase mb-1">Base</p>
                    <input 
                      type="number" className="w-full bg-emerald-950 border border-emerald-800 rounded-lg p-2 text-xs font-black text-emerald-400 outline-none focus:border-emerald-400"
                      value={scores[k].total}
                      onChange={(e) => setScores({...scores, [k]: {...scores[k], total: e.target.value}})}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <button onClick={addStudent} className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black py-4 rounded-2xl transition-all shadow-lg text-xs uppercase tracking-widest active:scale-95">
            {editingId ? "Update System" : "Push to Database"}
          </button>
          {editingId && (
            <button onClick={resetForm} className="w-full text-[10px] font-black text-emerald-500 uppercase hover:text-white transition-colors py-2">Discard Changes</button>
          )}
        </div>
      </aside>

      <section className="flex-grow p-6 md:p-12 overflow-x-hidden">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 border-b border-slate-200 pb-10">
          <div>
            <h2 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-2">Central Management</h2>
            <p className="text-4xl font-light text-slate-800 tracking-tight">Active <span className="font-black text-emerald-950 underline decoration-emerald-400 underline-offset-8">Academic Records</span></p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase">System Status</p>
              <p className="text-xs font-bold text-emerald-600">Encrypted & Live</p>
            </div>
            <div className="h-12 w-[1px] bg-slate-200 mx-2"></div>
            <span className="text-lg font-black text-emerald-950 bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
              {records.length} <span className="text-[10px] text-slate-400 ml-1">UNITS</span>
            </span>
          </div>
        </header>

        <div className="bg-white rounded-[2rem] shadow-xl shadow-emerald-900/5 border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                <th className="px-10 py-7">Student Identity</th>
                <th className="px-6 py-7 text-center">Score Matrix</th>
                <th className="px-6 py-7 text-center">Finalized %</th>
                <th className="px-10 py-7 text-right">Administrative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-emerald-50/30 transition-all group">
                  <td className="px-10 py-8">
                    <p className="font-black text-slate-900 text-base uppercase tracking-tight">{r.student_name}</p>
                    <p className="text-[9px] text-emerald-600 font-bold uppercase mt-1">Node: {r.id.substring(0,8).toUpperCase()}</p>
                  </td>
                  <td className="px-6 py-8 text-center">
                    <div className="grid grid-cols-5 gap-1.5 max-w-[350px] mx-auto">
                      {(['quiz', 'laboratory', 'assignment', 'attendance', 'major_exam'] as const).map((key) => (
                        <div key={key} className="bg-slate-100 px-2 py-1.5 rounded-lg text-[8px] font-black text-slate-400 uppercase border border-slate-200">
                          <p className="text-[7px] mb-0.5">{key.substring(0, 3)}</p>
                          <span className="text-emerald-700 text-[10px]">{Number(r[key] || 0).toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-8 text-center">
                    <div className="inline-block bg-emerald-50 px-5 py-2.5 rounded-2xl border border-emerald-100 shadow-inner">
                      <span className="text-xl font-black text-emerald-700">
                        {Number(r.final_grade || 0).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right space-x-2">
                      <button onClick={() => handleEdit(r)} className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-slate-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={() => deleteRecord(r.id)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-slate-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="p-32 text-center font-black text-emerald-200 uppercase text-[10px] tracking-[0.8em] animate-pulse">Establishing Secure Stream...</div>}
        </div>
      </section>
    </main>
  );
}