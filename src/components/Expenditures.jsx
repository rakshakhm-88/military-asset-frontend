import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth, API_URL } from '../context/AuthContext';

const Expenditures = () => {
    const { user } = useAuth();
    const [expenditures, setExpenditures] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        base_id: user?.base_id || '',
        asset_id: '',
        assignment_id: '',
        quantity: '',
        expenditure_date: new Date().toISOString().split('T')[0],
        reason: '',
        operation_name: '',
        authorized_by: ''
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchExpenditures();
    }, []);

    const fetchExpenditures = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/expenditures`);
            setExpenditures(response.data.expenditures);
        } catch (error) {
            console.error('Failed to fetch expenditures:', error);
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
            await axios.post(`${API_URL}/expenditures`, formData);
            setMessage('Expenditure recorded successfully');
            setShowForm(false);
            setFormData({
                base_id: user?.base_id || '',
                asset_id: '',
                assignment_id: '',
                quantity: '',
                expenditure_date: new Date().toISOString().split('T')[0],
                reason: '',
                operation_name: '',
                authorized_by: ''
            });
            fetchExpenditures();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(error.response?.data?.error || 'Failed to record expenditure');
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>Expenditure Tracking</h2>
                {(user?.role === 'admin' || user?.role === 'base_commander') && (
                    <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                        {showForm ? 'Cancel' : 'Record Expenditure'}
                    </button>
                )}
            </div>

            {message && <div className={message.includes('success') ? 'success-message' : 'error-message'}>{message}</div>}

            {showForm && (
                <div className="form-container">
                    <h3>Record New Expenditure</h3>
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
                                <label>Assignment ID (Optional)</label>
                                <input type="number" name="assignment_id" value={formData.assignment_id} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Expenditure Date *</label>
                                <input type="date" name="expenditure_date" value={formData.expenditure_date} onChange={handleInputChange} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Operation Name</label>
                                <input type="text" name="operation_name" value={formData.operation_name} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Authorized By</label>
                                <input type="text" name="authorized_by" value={formData.authorized_by} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Reason *</label>
                            <textarea name="reason" value={formData.reason} onChange={handleInputChange} rows="3" required></textarea>
                        </div>
                        <button type="submit" className="btn-primary">Record Expenditure</button>
                    </form>
                </div>
            )}

            <div className="table-container">
                <h3>Expenditure History</h3>
                {loading ? (
                    <div className="loading">Loading expenditures...</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Base</th>
                                <th>Asset</th>
                                <th>Quantity</th>
                                <th>Operation</th>
                                <th>Personnel</th>
                                <th>Authorized By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenditures.map((expenditure) => (
                                <tr key={expenditure.id}>
                                    <td>{new Date(expenditure.expenditure_date).toLocaleDateString()}</td>
                                    <td>{expenditure.base_name}</td>
                                    <td>{expenditure.asset_name}</td>
                                    <td>{parseFloat(expenditure.quantity).toFixed(2)}</td>
                                    <td>{expenditure.operation_name || '-'}</td>
                                    <td>{expenditure.assigned_to_personnel || '-'}</td>
                                    <td>{expenditure.authorized_by || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Expenditures;
