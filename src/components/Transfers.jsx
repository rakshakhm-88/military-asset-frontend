import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth, API_URL } from '../context/AuthContext';

const Transfers = () => {
    const { user } = useAuth();
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        source_base_id: user?.base_id || '',
        destination_base_id: '',
        asset_id: '',
        quantity: '',
        transfer_date: new Date().toISOString().split('T')[0],
        transfer_order_number: '',
        reason: ''
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchTransfers();
    }, []);

    const fetchTransfers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/transfers`);
            setTransfers(response.data.transfers);
        } catch (error) {
            console.error('Failed to fetch transfers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.source_base_id === formData.destination_base_id) {
            setMessage('Source and destination bases must be different');
            return;
        }

        try {
            await axios.post(`${API_URL}/transfers`, formData);
            setMessage('Transfer completed successfully');
            setShowForm(false);
            setFormData({
                source_base_id: user?.base_id || '',
                destination_base_id: '',
                asset_id: '',
                quantity: '',
                transfer_date: new Date().toISOString().split('T')[0],
                transfer_order_number: '',
                reason: ''
            });
            fetchTransfers();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(error.response?.data?.error || 'Failed to create transfer');
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>Transfer Management</h2>
                {(user?.role === 'admin' || user?.role === 'logistics_officer') && (
                    <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                        {showForm ? 'Cancel' : 'Create Transfer'}
                    </button>
                )}
            </div>

            {message && <div className={message.includes('success') ? 'success-message' : 'error-message'}>{message}</div>}

            {showForm && (
                <div className="form-container">
                    <h3>Create New Transfer</h3>
                    <form onSubmit={handleSubmit} className="data-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Source Base ID *</label>
                                <input type="number" name="source_base_id" value={formData.source_base_id} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Destination Base ID *</label>
                                <input type="number" name="destination_base_id" value={formData.destination_base_id} onChange={handleInputChange} required />
                            </div>
                        </div>
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
                                <label>Transfer Date *</label>
                                <input type="date" name="transfer_date" value={formData.transfer_date} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Transfer Order Number</label>
                                <input type="text" name="transfer_order_number" value={formData.transfer_order_number} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Reason</label>
                            <textarea name="reason" value={formData.reason} onChange={handleInputChange} rows="3"></textarea>
                        </div>
                        <button type="submit" className="btn-primary">Create Transfer</button>
                    </form>
                </div>
            )}

            <div className="table-container">
                <h3>Transfer History</h3>
                {loading ? (
                    <div className="loading">Loading transfers...</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>From</th>
                                <th>To</th>
                                <th>Asset</th>
                                <th>Quantity</th>
                                <th>Status</th>
                                <th>Created By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transfers.map((transfer) => (
                                <tr key={transfer.id}>
                                    <td>{new Date(transfer.transfer_date).toLocaleDateString()}</td>
                                    <td>{transfer.source_base_name}</td>
                                    <td>{transfer.destination_base_name}</td>
                                    <td>{transfer.asset_name}</td>
                                    <td>{parseFloat(transfer.quantity).toFixed(2)}</td>
                                    <td><span className={`status-badge ${transfer.status}`}>{transfer.status}</span></td>
                                    <td>{transfer.created_by_name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Transfers;
