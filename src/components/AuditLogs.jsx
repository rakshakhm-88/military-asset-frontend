import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth, API_URL } from '../context/AuthContext';

const AuditLogs = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        user_id: '',
        action: '',
        entity_type: '',
        start_date: '',
        end_date: ''
    });

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchLogs();
        }
    }, [user]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filters.user_id) params.user_id = filters.user_id;
            if (filters.action) params.action = filters.action;
            if (filters.entity_type) params.entity_type = filters.entity_type;
            if (filters.start_date) params.start_date = filters.start_date;
            if (filters.end_date) params.end_date = filters.end_date;

            const response = await axios.get(`${API_URL}/audit`, { params });
            setLogs(response.data.logs);
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleApplyFilters = () => {
        fetchLogs();
    };

    if (user?.role !== 'admin') {
        return (
            <div className="page-container">
                <div className="error-message">
                    Access Denied. Only administrators can view audit logs.
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>Audit Logs</h2>
                <p className="user-info">System Activity Tracking</p>
            </div>

            <div className="filters-section">
                <div className="filter-group">
                    <label>Action Type</label>
                    <select
                        name="action"
                        value={filters.action}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Actions</option>
                        <option value="LOGIN">Login</option>
                        <option value="CREATE_PURCHASE">Create Purchase</option>
                        <option value="CREATE_TRANSFER">Create Transfer</option>
                        <option value="CREATE_ASSIGNMENT">Create Assignment</option>
                        <option value="CREATE_EXPENDITURE">Create Expenditure</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Entity Type</label>
                    <select
                        name="entity_type"
                        value={filters.entity_type}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Types</option>
                        <option value="purchase">Purchase</option>
                        <option value="transfer">Transfer</option>
                        <option value="assignment">Assignment</option>
                        <option value="expenditure">Expenditure</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Start Date</label>
                    <input
                        type="date"
                        name="start_date"
                        value={filters.start_date}
                        onChange={handleFilterChange}
                    />
                </div>
                <div className="filter-group">
                    <label>End Date</label>
                    <input
                        type="date"
                        name="end_date"
                        value={filters.end_date}
                        onChange={handleFilterChange}
                    />
                </div>
                <button onClick={handleApplyFilters} className="btn-secondary">
                    Apply Filters
                </button>
                <button onClick={() => { setFilters({ user_id: '', action: '', entity_type: '', start_date: '', end_date: '' }); fetchLogs(); }} className="btn-text">
                    Clear
                </button>
            </div>

            <div className="table-container">
                <h3>Activity Log ({logs.length} entries)</h3>
                {loading ? (
                    <div className="loading">Loading audit logs...</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>User</th>
                                <th>Action</th>
                                <th>Entity Type</th>
                                <th>Entity ID</th>
                                <th>IP Address</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log.id}>
                                    <td>{new Date(log.created_at).toLocaleString()}</td>
                                    <td>{log.full_name}</td>
                                    <td>
                                        <span className="status-badge active">
                                            {log.action.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td>{log.entity_type}</td>
                                    <td>{log.entity_id || '-'}</td>
                                    <td>{log.ip_address || '-'}</td>
                                    <td>
                                        <details>
                                            <summary style={{ cursor: 'pointer', color: 'var(--accent-color)' }}>
                                                View Details
                                            </summary>
                                            <pre style={{ fontSize: '0.75rem', marginTop: '0.5rem', padding: '0.5rem', backgroundColor: 'var(--bg-color)', borderRadius: '4px', overflow: 'auto' }}>
                                                {JSON.stringify(typeof log.details === 'string' ? JSON.parse(log.details || '{}') : (log.details || {}), null, 2)}
                                            </pre>
                                        </details>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AuditLogs;
