import React from 'react';
import Image from 'next/image';

interface BannerProps {
    id: number;
    image: string;
    link: string;
}

const Banner: React.FC<BannerProps> = ({ id, image, link }) => {
    return (
        <a href={link} target="_blank" rel="noopener noreferrer">
            <Image src={image} alt={`Banner ${id}`} width={500} height={300} />
        </a>
    );
};

export default Banner;