import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';

const MovementBreakdown = ({ item, filters, onClose }) => {
    const [breakdown, setBreakdown] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBreakdown();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchBreakdown = async () => {
        try {
            const params = {
                base_id: item.base_id,
                asset_id: item.asset_id
            };
            if (filters.start_date) params.start_date = filters.start_date;
            if (filters.end_date) params.end_date = filters.end_date;

            const response = await axios.get(`${API_URL}/dashboard/movement-breakdown`, { params });
            setBreakdown(response.data.breakdown);
        } catch (error) {
            console.error('Failed to fetch breakdown:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Movement Breakdown</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                {loading ? (
                    <div className="loading">Loading breakdown...</div>
                ) : breakdown ? (
                    <div className="modal-body">
                        <div className="breakdown-item">
                            <span className="breakdown-label">Purchases:</span>
                            <span className="breakdown-value positive">+{parseFloat(breakdown.purchases).toFixed(2)}</span>
                        </div>
                        <div className="breakdown-item">
                            <span className="breakdown-label">Transfers In:</span>
                            <span className="breakdown-value positive">+{parseFloat(breakdown.transfers_in).toFixed(2)}</span>
                        </div>
                        <div className="breakdown-item">
                            <span className="breakdown-label">Transfers Out:</span>
                            <span className="breakdown-value negative">-{parseFloat(breakdown.transfers_out).toFixed(2)}</span>
                        </div>
                        <div className="breakdown-divider"></div>
                        <div className="breakdown-item total">
                            <span className="breakdown-label">Net Movement:</span>
                            <span className={`breakdown-value ${breakdown.net_movement >= 0 ? 'positive' : 'negative'}`}>
                                {breakdown.net_movement >= 0 ? '+' : ''}{parseFloat(breakdown.net_movement).toFixed(2)}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="error-message">Failed to load breakdown</div>
                )}
            </div>
        </div>
    );
};

export default MovementBreakdown;
