import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await api.getAdminActivityLogs();
        setLogs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Security & Audit Activity Logs</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Real-time audit trail of administrator fleet commands and security modifications
          </p>
        </div>
      </div>

      <div className="table-3d-wrap">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-cyan-400">
            <i className="fas fa-circle-notch fa-spin mr-3 text-2xl"></i> Querying security audit log...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-3d">
              <thead>
                <tr>
                  <th>Audit ID</th>
                  <th>Admin Principal</th>
                  <th>Action</th>
                  <th>Target Component</th>
                  <th>Event Details</th>
                  <th>IP Address</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td className="font-mono text-cyan-400 text-xs">#LOG-{l.id}</td>
                    <td>
                      <span className="font-semibold text-white bg-slate-800/80 px-2 py-1 rounded text-xs">
                        {l.admin}
                      </span>
                    </td>
                    <td className="font-bold text-white text-sm">{l.action}</td>
                    <td className="font-mono text-xs text-slate-400">{l.model_name || 'System Core'}</td>
                    <td className="text-xs text-slate-300 max-w-sm">{l.details}</td>
                    <td className="font-mono text-xs text-cyan-400">{l.ip_address || '127.0.0.1'}</td>
                    <td className="font-mono text-xs text-slate-400">{l.created_at || 'Just now'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
