import React from 'react';
import { useRouter } from 'next/navigation';

const HomeImage = () => {
    const router = useRouter();

    const handleClick = () => {
        router.push('/');
    };

    return (
        <img
            src={`/favicon.png`}
            alt="Home"
            className="cursor-pointer"
            onClick={handleClick}
            height={64}
            width={64}
        />
    );
};

export default HomeImage;