import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Banner from './Banner';
import styles from '../styles/BannerList.module.css';

interface BannerData {
    id: number;
    image: string;
    link: string;
}

const BannerList: React.FC = () => {
    const [banners, setBanners] = useState<BannerData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        axios.get('http://13.216.135.244:8000/api/banners/')
            .then(response => {
                setBanners(response.data);
            })
            .catch(error => {
                console.error('Error fetching banners:', error);
            });
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            nextBanner();
        }, 5000); // 5秒ごとに次のバナーに移動

        return () => clearInterval(interval); // クリーンアップ
    }, [currentIndex, isAnimating]); // currentIndexとisAnimatingが変更されるたびに再設定

    const nextBanner = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
        setTimeout(() => setIsAnimating(false), 500);
    };

    const prevBanner = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
        setTimeout(() => setIsAnimating(false), 500);
    };

    const goToBanner = (index: number) => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex(index);
        setTimeout(() => setIsAnimating(false), 500);
    };

    return (
        <div className={styles.bannerContainer}>
            <div
                className={styles.banner}
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {banners.map((banner) => (
                    <div key={banner.id} className={styles.bannerItem}>
                        <Banner {...banner} />
                    </div>
                ))}
            </div>
            <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={prevBanner}>
                &lt;
            </button>
            <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={nextBanner}>
                &gt;
            </button>
            <div className={styles.indicators}>
                {banners.map((_, index) => (
                    <div
                        key={index}
                        className={`${styles.indicator} ${index === currentIndex ? styles.active : ''}`}
                        onClick={() => goToBanner(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default BannerList;