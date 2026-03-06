'use client';

import { useEffect, useState } from 'react';
import CountUp from 'react-countup';

interface ReactCountUpWrapperProps {
    value: number;
    prefix?: string;
    decimals?: number;
}

export default function ReactCountUpWrapper({
    value,
    prefix = "",
    decimals = 2
}: ReactCountUpWrapperProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <span>
                {prefix}{value.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
            </span>
        );
    }

    return (
        <CountUp
            duration={1}
            preserveValue
            end={value}
            decimals={decimals}
            prefix={prefix}
            separator=","
            decimal="."
        />
    );
}