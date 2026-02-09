import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth, API_URL } from '../context/AuthContext';

const Purchases = () => {
    const { user } = useAuth();
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        base_id: user?.base_id || '',
        asset_id: '',
        quantity: '',
        unit_price: '',
        supplier_name: '',
        purchase_order_number: '',
        purchase_date: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/purchases`);
            setPurchases(response.data.purchases);
        } catch (error) {
            console.error('Failed to fetch purchases:', error);
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
            await axios.post(`${API_URL}/purchases`, formData);
            setMessage('Purchase recorded successfully');
            setShowForm(false);
            setFormData({
                base_id: user?.base_id || '',
                asset_id: '',
                quantity: '',
                unit_price: '',
                supplier_name: '',
                purchase_order_number: '',
                purchase_date: new Date().toISOString().split('T')[0],
                notes: ''
            });
            fetchPurchases();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(error.response?.data?.error || 'Failed to record purchase');
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>Purchase Management</h2>
                {(user?.role === 'admin' || user?.role === 'logistics_officer') && (
                    <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                        {showForm ? 'Cancel' : 'Record Purchase'}
                    </button>
                )}
            </div>

            {message && <div className={message.includes('success') ? 'success-message' : 'error-message'}>{message}</div>}

            {showForm && (
                <div className="form-container">
                    <h3>Record New Purchase</h3>
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
                                <label>Unit Price</label>
                                <input type="number" step="0.01" name="unit_price" value={formData.unit_price} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Purchase Date *</label>
                                <input type="date" name="purchase_date" value={formData.purchase_date} onChange={handleInputChange} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Supplier Name</label>
                                <input type="text" name="supplier_name" value={formData.supplier_name} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>PO Number</label>
                                <input type="text" name="purchase_order_number" value={formData.purchase_order_number} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Notes</label>
                            <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="3"></textarea>
                        </div>
                        <button type="submit" className="btn-primary">Save Purchase</button>
                    </form>
                </div>
            )}

            <div className="table-container">
                <h3>Purchase History</h3>
                {loading ? (
                    <div className="loading">Loading purchases...</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Base</th>
                                <th>Asset</th>
                                <th>Quantity</th>
                                <th>Supplier</th>
                                <th>PO Number</th>
                                <th>Created By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchases.map((purchase) => (
                                <tr key={purchase.id}>
                                    <td>{new Date(purchase.purchase_date).toLocaleDateString()}</td>
                                    <td>{purchase.base_name}</td>
                                    <td>{purchase.asset_name}</td>
                                    <td>{parseFloat(purchase.quantity).toFixed(2)}</td>
                                    <td>{purchase.supplier_name || '-'}</td>
                                    <td>{purchase.purchase_order_number || '-'}</td>
                                    <td>{purchase.created_by_name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Purchases;
