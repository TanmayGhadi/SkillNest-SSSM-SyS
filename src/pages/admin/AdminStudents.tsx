import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, ArrowLeft, ShieldCheck, Mail, GraduationCap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Profile } from '../../types/database';

export const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.full_name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.enrollment_no && s.enrollment_no.toLowerCase().includes(q)) ||
      s.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C6A60] hover:text-[#1B382B] mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Admin Overview
          </Link>
          <h1 className="font-serif text-3xl font-bold text-[#1B382B]">GPM Students Directory</h1>
          <p className="text-xs sm:text-sm text-[#5C6A60] mt-0.5">
            Institutional verification & student roster for Government Polytechnic Malvan ({students.length} students).
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#ECE7DC] p-5 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA59D]" />
          <input
            type="text"
            placeholder="Search by student name, enrollment number, department, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-full border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] text-xs focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#ECE7DC] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#717E73]">Loading student database...</div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#ECE7DC] bg-[#FBF9F4] text-[#5C6A60] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Student Name</th>
                  <th className="py-3.5 px-5">Enrollment No.</th>
                  <th className="py-3.5 px-5">Department</th>
                  <th className="py-3.5 px-5">Year</th>
                  <th className="py-3.5 px-5">Email Address</th>
                  <th className="py-3.5 px-5">Freelancer</th>
                  <th className="py-3.5 px-5">Registration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE7DC]">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-[#FBF9F4] transition">
                    <td className="py-4 px-5 font-semibold text-[#1B382B]">{s.full_name}</td>
                    <td className="py-4 px-5 font-mono text-[#2D5A43] font-medium">{s.enrollment_no || '—'}</td>
                    <td className="py-4 px-5 text-[#5C6A60]">{s.department}</td>
                    <td className="py-4 px-5 text-[#5C6A60] font-medium">{s.year}</td>
                    <td className="py-4 px-5 text-[#5C6A60]">{s.email}</td>
                    <td className="py-4 px-5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        s.is_freelancer ? 'bg-[#E5ECE6] text-[#2D5A43]' : 'bg-[#F6F2E9] text-[#717E73]'
                      }`}>
                        {s.is_freelancer ? 'Active Freelancer' : 'Student Only'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-[#717E73]">
                      {new Date(s.created_at).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-[#717E73]">
            No students found in the database.
          </div>
        )}
      </div>
    </div>
  );
};
