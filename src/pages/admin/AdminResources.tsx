import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft, Download, Trash2, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AcademicResource, Profile } from '../../types/database';

export const AdminResources: React.FC = () => {
  const [resources, setResources] = useState<(AcademicResource & { uploader?: Profile })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('academic_resources')
        .select('*, uploader:profiles(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (err) {
      console.error('Error fetching admin resources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this academic resource from the campus vault?')) return;
    try {
      await supabase.from('academic_resources').delete().eq('id', id);
      loadResources();
    } catch (err) {
      console.error('Error deleting resource:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C6A60] hover:text-[#1B382B] mb-2">
          <ArrowLeft className="w-4 h-4" /> Back to Admin Overview
        </Link>
        <h1 className="font-serif text-3xl font-bold text-[#1B382B]">Academic Vault Administration</h1>
        <p className="text-xs sm:text-sm text-[#5C6A60] mt-0.5">
          MSBTE study materials, manuals, and syllabi shared by students ({resources.length} resources).
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#ECE7DC] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#717E73]">Loading resources...</div>
        ) : resources.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#ECE7DC] bg-[#FBF9F4] text-[#5C6A60] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Resource Title</th>
                  <th className="py-3.5 px-5">Department</th>
                  <th className="py-3.5 px-5">Sem</th>
                  <th className="py-3.5 px-5">Type</th>
                  <th className="py-3.5 px-5">Downloads</th>
                  <th className="py-3.5 px-5">Uploaded By</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE7DC]">
                {resources.map((r) => (
                  <tr key={r.id} className="hover:bg-[#FBF9F4] transition">
                    <td className="py-4 px-5 font-semibold text-[#1B382B] max-w-sm truncate">{r.title}</td>
                    <td className="py-4 px-5 text-[#5C6A60]">{r.department}</td>
                    <td className="py-4 px-5 text-[#5C6A60] font-medium">{r.semester}</td>
                    <td className="py-4 px-5 text-[#5C6A60]">{r.resource_type}</td>
                    <td className="py-4 px-5 text-[#2D5A43] font-bold">{r.downloads || 0}</td>
                    <td className="py-4 px-5 text-[#5C6A60]">{r.uploader?.full_name || 'GPM Student'}</td>
                    <td className="py-4 px-5 text-right space-x-2">
                      <a
                        href={r.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg border border-[#ECE7DC] hover:bg-[#F3EFE6] text-[#1B382B] inline-block"
                        title="Open File"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 rounded-lg border border-[#ECE7DC] hover:bg-rose-50 text-rose-600 inline-block"
                        title="Delete Resource"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-[#717E73]">
            No academic resources uploaded in the database yet.
          </div>
        )}
      </div>
    </div>
  );
};
