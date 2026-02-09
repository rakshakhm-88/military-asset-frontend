import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth, API_URL } from '../context/AuthContext';
import MovementBreakdown from './MovementBreakdown';

const Dashboard = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState([]);
    const [bases, setBases] = useState([]);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        base_id: '',
        asset_id: '',
        start_date: '',
        end_date: ''
    });
    const [selectedItem, setSelectedItem] = useState(null);
    const [showBreakdown, setShowBreakdown] = useState(false);

    useEffect(() => {
        fetchDashboard();
        fetchBasesAndAssets();
    }, []);

    const fetchBasesAndAssets = async () => {
        try {
            // Extract unique bases and assets from dashboard data
            const dashResponse = await axios.get(`${API_URL}/dashboard`);
            const data = dashResponse.data.dashboard;

            // Get unique bases
            const uniqueBases = [...new Map(data.map(item => [item.base_id, { id: item.base_id, name: item.base_name }])).values()];
            setBases(uniqueBases);

            // Get unique assets
            const uniqueAssets = [...new Map(data.map(item => [item.asset_id, { id: item.asset_id, name: item.asset_name, category: item.category }])).values()];
            setAssets(uniqueAssets);
        } catch (error) {
            console.error('Failed to fetch bases and assets:', error);
        }
    };

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filters.base_id) params.base_id = filters.base_id;
            if (filters.asset_id) params.asset_id = filters.asset_id;
            if (filters.start_date) params.start_date = filters.start_date;
            if (filters.end_date) params.end_date = filters.end_date;

            const response = await axios.get(`${API_URL}/dashboard`, { params });
            setDashboardData(response.data.dashboard);
        } catch (error) {
            console.error('Failed to fetch dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleApplyFilters = () => {
        fetchDashboard();
    };

    const handleShowBreakdown = (item) => {
        setSelectedItem(item);
        setShowBreakdown(true);
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h2>Asset Dashboard</h2>
                <p className="user-info">
                    {user?.full_name} - {user?.role.replace('_', ' ').toUpperCase()}
                </p>
            </div>

            <div className="filters-section">
                {user?.role === 'admin' && (
                    <div className="filter-group">
                        <label>Base</label>
                        <select
                            name="base_id"
                            value={filters.base_id}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Bases</option>
                            {bases.map(base => (
                                <option key={base.id} value={base.id}>{base.name}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="filter-group">
                    <label>Equipment Type</label>
                    <select
                        name="asset_id"
                        value={filters.asset_id}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Equipment</option>
                        {assets.map(asset => (
                            <option key={asset.id} value={asset.id}>
                                {asset.name} ({asset.category})
                            </option>
                        ))}
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
                <button onClick={() => { setFilters({ base_id: '', asset_id: '', start_date: '', end_date: '' }); fetchDashboard(); }} className="btn-text">
                    Clear
                </button>
            </div>

            {loading ? (
                <div className="loading">Loading dashboard data...</div>
            ) : (
                <div className="dashboard-grid">
                    {dashboardData.map((item) => (
                        <div key={item.id} className="dashboard-card">
                            <div className="card-header">
                                <h3>{item.asset_name}</h3>
                                <span className="category-badge">{item.category}</span>
                            </div>
                            <div className="card-body">
                                <div className="stat-row">
                                    <span className="stat-label">Base:</span>
                                    <span className="stat-value">{item.base_name}</span>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label">Opening Balance:</span>
                                    <span className="stat-value">{parseFloat(item.opening_balance).toFixed(2)} {item.unit_of_measure}</span>
                                </div>
                                <div className="stat-row clickable" onClick={() => handleShowBreakdown(item)}>
                                    <span className="stat-label">Net Movement:</span>
                                    <span className={`stat-value ${item.net_movement >= 0 ? 'positive' : 'negative'}`}>
                                        {item.net_movement >= 0 ? '+' : ''}{parseFloat(item.net_movement).toFixed(2)} {item.unit_of_measure}
                                    </span>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label">Closing Balance:</span>
                                    <span className="stat-value strong">{parseFloat(item.current_quantity).toFixed(2)} {item.unit_of_measure}</span>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label">Assigned:</span>
                                    <span className="stat-value">{parseFloat(item.total_assigned).toFixed(2)} {item.unit_of_measure}</span>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label">Expended:</span>
                                    <span className="stat-value">{parseFloat(item.total_expended).toFixed(2)} {item.unit_of_measure}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showBreakdown && selectedItem && (
                <MovementBreakdown
                    item={selectedItem}
                    filters={filters}
                    onClose={() => setShowBreakdown(false)}
                />
            )}
        </div>
    );
};

export default Dashboard;
