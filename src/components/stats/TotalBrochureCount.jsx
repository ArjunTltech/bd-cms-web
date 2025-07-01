import axiosInstance from '../../config/axios';
import React, { useEffect, useState } from 'react';
import StatCard from '../ui/StatCard';
import { FilePlus } from 'lucide-react';
import { SkeletonCard } from '../skeleton/Skeleton';

const TotalBrochures = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get("/stats/brochure-count");
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
        <div className="w-full animate-fade-in-down">
            {loading ? (
                <SkeletonCard />
            ) : (
                <StatCard
                    title="Total Brochures"
                    value={data}
                    description="/ 10"
                    icon={FilePlus}
                    iconColor="text-yellow-500"
                    tooltip="Indicates the current count of generated brochures, with a maximum limit of 10."

                />
            )}
        </div>
    );
};

export default TotalBrochures;