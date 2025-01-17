import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Banner from './Banner';

interface BannerData {
    id: number;
    image: string;
    link: string;
}

const BannerList: React.FC = () => {
    const [banners, setBanners] = useState<BannerData[]>([]);

    useEffect(() => {
        axios.get('http://localhost:8000/api/banners/') // DjangoサーバーのURLを使用
            .then(response => {
                setBanners(response.data);
            })
            .catch(error => {
                console.error('Error fetching banners:', error);
            });
    }, []);

    return (
        <div className="banners">
            {banners.map(banner => (
                <Banner key={banner.id} id={banner.id} image={banner.image} link={banner.link} />
            ))}
        </div>
    );
};

export default BannerList;