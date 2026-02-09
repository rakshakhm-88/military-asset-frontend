import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth, API_URL } from '../context/AuthContext';

const Assignments = () => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        base_id: user?.base_id || '',
        asset_id: '',
        quantity: '',
        assigned_to_personnel: '',
        assigned_to_unit: '',
        assignment_date: new Date().toISOString().split('T')[0],
        purpose: ''
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/assignments`);
            setAssignments(response.data.assignments);
        } catch (error) {
            console.error('Failed to fetch assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/assignments`, formData);
            setMessage('Assignment created successfully');
            setShowForm(false);
            setFormData({
                base_id: user?.base_id || '',
                asset_id: '',
                quantity: '',
                assigned_to_personnel: '',
                assigned_to_unit: '',
                assignment_date: new Date().toISOString().split('T')[0],
                purpose: ''
            });
            fetchAssignments();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(error.response?.data?.error || 'Failed to create assignment');
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>Assignment Management</h2>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                    {showForm ? 'Cancel' : 'Create Assignment'}
                </button>
            </div>

            {message && <div className={message.includes('success') ? 'success-message' : 'error-message'}>{message}</div>}

            {showForm && (
                <div className="form-container">
                    <h3>Create New Assignment</h3>
                    <form onSubmit={handleSubmit} className="data-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Asset ID *</label>
                                <input type="number" name="asset_id" value={formData.asset_id} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Quantity *</label>
                                <input type="number" step="0.01" name="quantity" value={formData.quantity} onChange={handleInputChange} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Assigned To (Personnel) *</label>
                                <input type="text" name="assigned_to_personnel" value={formData.assigned_to_personnel} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Unit</label>
                                <input type="text" name="assigned_to_unit" value={formData.assigned_to_unit} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Assignment Date *</label>
                                <input type="date" name="assignment_date" value={formData.assignment_date} onChange={handleInputChange} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Purpose</label>
                            <textarea name="purpose" value={formData.purpose} onChange={handleInputChange} rows="3"></textarea>
                        </div>
                        <button type="submit" className="btn-primary">Create Assignment</button>
                    </form>
                </div>
            )}

            <div className="table-container">
                <h3>Assignment History</h3>
                {loading ? (
                    <div className="loading">Loading assignments...</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Base</th>
                                <th>Asset</th>
                                <th>Quantity</th>
                                <th>Personnel</th>
                                <th>Unit</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignments.map((assignment) => (
                                <tr key={assignment.id}>
                                    <td>{new Date(assignment.assignment_date).toLocaleDateString()}</td>
                                    <td>{assignment.base_name}</td>
                                    <td>{assignment.asset_name}</td>
                                    <td>{parseFloat(assignment.quantity).toFixed(2)}</td>
                                    <td>{assignment.assigned_to_personnel}</td>
                                    <td>{assignment.assigned_to_unit || '-'}</td>
                                    <td><span className={`status-badge ${assignment.status}`}>{assignment.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Assignments;
