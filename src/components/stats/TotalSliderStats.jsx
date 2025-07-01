import React, { useEffect, useState } from 'react';
import StatCard from '../ui/StatCard';
import { SlidersHorizontal } from 'lucide-react';
import axiosInstance from '../../config/axios';
import { SkeletonCard } from '../skeleton/Skeleton';

const TotalSliderStats = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get("/stats/slider-count");
                const result = response.data.data;
                setData(result);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="w-full  animate-fade-in-down">
            {loading ? (
                <SkeletonCard />
            ) : (
                <StatCard
                    title="Total Sliders"
                    value={data}
                    description="/ 8"
                    icon={SlidersHorizontal}
                    iconColor="text-green-500"
                    tooltip="Indicates the current count of available sliders, with a maximum limit of 8."

                />
            )}
        </div>
    );
};

export default TotalSliderStats;
