import React, { useEffect, useState } from 'react';
import axiosInstance from '../../config/axios';

const EventNameCount = () => {
    const [period, setPeriod] = useState('30days');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    const getDateRange = (periodString) => {
        const endDate = new Date();
        const startDate = new Date();
        const days = parseInt(periodString);
        startDate.setDate(endDate.getDate() - days);

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
    };

    const fetchData = async (selectedPeriod, customStartDate, customEndDate) => {
        setLoading(true);
        try {
            let start, end;
            if (selectedPeriod === 'custom') {
                if (!customStartDate || !customEndDate) {
                    setError('Please select both start and end dates');
                    setLoading(false);
                    return;
                }
                start = customStartDate;
                end = customEndDate;
            } else {
                const { startDate, endDate } = getDateRange(selectedPeriod.replace('days', ''));
                start = startDate;
                end = endDate;
            }

            const response = await axiosInstance.get('/stats/event-name-counts', {
                params: { startDate: start, endDate: end },
            });
            
            // Process data to match the format shown in the image
            const processedData = response.data.data.map((item, index) => ({
                id: index + 1,
                eventName: item.eventName,
                eventCount: item.eventCount,
                totalUsers: Math.floor(item.eventCount * 0.75), // Sample calculation - replace with actual data
                countPerUser: (item.eventCount / (item.eventCount * 0.75)).toFixed(2) // Sample calculation
            }));

            setData(processedData);
            // Initially select all rows
            setSelectedRows(processedData.map(item => item.id));
            setSelectAll(true);
            setError(null);
        } catch (err) {
            setError('Failed to fetch analytics data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (period === 'custom') {
            if (!startDate || !endDate) return;
            fetchData(period, startDate, endDate);
        } else {
            fetchData(period, startDate, endDate);
        }
    }, [period, startDate, endDate]);

    const handlePeriodChange = (e) => {
        const newPeriod = e.target.value;
        setPeriod(newPeriod);
        if (newPeriod !== 'custom') {
            setStartDate('');
            setEndDate('');
        }
    };

    const handleCheckboxChange = (id) => {
        setSelectedRows(prevSelectedRows => {
            if (prevSelectedRows.includes(id)) {
                const newSelected = prevSelectedRows.filter(rowId => rowId !== id);
                setSelectAll(false);
                return newSelected;
            } else {
                const newSelected = [...prevSelectedRows, id];
                if (newSelected.length === data.length) {
                    setSelectAll(true);
                }
                return newSelected;
            }
        });
    };

    const handleSelectAllChange = () => {
        if (selectAll) {
            setSelectedRows([]);
        } else {
            setSelectedRows(data.map(item => item.id));
        }
        setSelectAll(!selectAll);
    };

    // Calculate totals for selected rows
    const calculateTotals = () => {
        if (!data.length) return { totalEvents: 0, totalUsers: 0, avgPerUser: 0 };
        
        const selectedData = data.filter(item => selectedRows.includes(item.id));
        const totalEvents = selectedData.reduce((sum, item) => sum + item.eventCount, 0);
        const totalUsers = selectedData.reduce((sum, item) => sum + item.totalUsers, 0);
        const avgPerUser = totalUsers ? (totalEvents / totalUsers).toFixed(2) : 0;
        
        return { totalEvents, totalUsers, avgPerUser };
    };

    const totals = calculateTotals();

    return (
        <div className="card bg-base-200 shadow-xl mt-8 w-full">
            <div className="card-body gap-4 min-h-[600px] max-h-[800px] overflow-y-auto scrollbar-none">
                {/* Header and Filter Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="card-title text-2xl">Event Name Analytics</h2>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <select
                            className="select select-bordered select-sm w-full md:w-48"
                            value={period}
                            onChange={handlePeriodChange}
                        >
                            <option value="7days">Last 7 days</option>
                            <option value="14days">Last 14 days</option>
                            <option value="30days">Last 30 days</option>
                            <option value="60days">Last 60 days</option>
                            <option value="90days">Last 90 days</option>
                            <option value="180days">Last 6 months</option>
                            <option value="365days">Last 12 months</option>
                            <option value="custom">Custom Range</option>
                        </select>
                        
                        {period === 'custom' && (
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="input input-bordered input-sm"
                                />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="input input-bordered input-sm"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="alert alert-error mt-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {/* Data Table */}
                {!loading && !error && (
                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full">
                            <thead>
                                <tr>
                                    <th className="text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectAll}
                                            onChange={handleSelectAllChange}
                                            className="checkbox checkbox-xs checkbox-primary"
                                        />
                                    </th>
                                    <th className="text-center">#</th>
                                    <th>Event name</th>
                                    <th className="text-right">Event count</th>
                                    <th className="text-right">Total users</th>
                                    <th className="text-right">Count per user</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Total Row */}
                                <tr className="bg-base-300 font-semibold">
                                    <td className="text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectAll}
                                            onChange={handleSelectAllChange}
                                            className="checkbox checkbox-xs checkbox-primary"
                                        />
                                    </td>
                                    <td className="text-center"></td>
                                    <td>Total</td>
                                    <td className="text-right">
                                        {totals.totalEvents}
                                        <div className="text-xs opacity-75">100% of total</div>
                                    </td>
                                    <td className="text-right">
                                        {totals.totalUsers}
                                        <div className="text-xs opacity-75">100% of total</div>
                                    </td>
                                    <td className="text-right">
                                        {totals.avgPerUser}
                                        <div className="text-xs opacity-75">Avg %</div>
                                    </td>
                                </tr>

                                {data.length > 0 ? (
                                    data.map((event, index) => (
                                        <tr key={event.id} className={selectedRows.includes(event.id) ? 'bg-primary/10' : ''}>
                                            <td className="text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.includes(event.id)}
                                                    onChange={() => handleCheckboxChange(event.id)}
                                                    className="checkbox checkbox-xs checkbox-primary"
                                                />
                                            </td>
                                            <td className="text-center">{event.id}</td>
                                            <td>
                                                <a className="link link-primary">{event.eventName}</a>
                                            </td>
                                            <td className="text-right">
                                                {event.eventCount} 
                                                <div className="text-xs opacity-75">
                                                    {((event.eventCount / totals.totalEvents) * 100).toFixed(2)}%
                                                </div>
                                            </td>
                                            <td className="text-right">
                                                {event.totalUsers}
                                                <div className="text-xs opacity-75">
                                                    {((event.totalUsers / totals.totalUsers) * 100).toFixed(2)}%
                                                </div>
                                            </td>
                                            <td className="text-right">{event.countPerUser}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-8">
                                            No event data available for the selected period
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};


export default EventNameCount;