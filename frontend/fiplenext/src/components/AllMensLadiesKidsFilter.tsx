import React from 'react';

interface AllMensLeadiesKidsFilterProps {
    onGenderSelect?: (gender: string) => void;
}

const AllMensLeadiesKidsFilter: React.FC<AllMensLeadiesKidsFilterProps> = ({ onGenderSelect }) => {
    const handleGenderSelect = (gender: string) => {
        if (onGenderSelect) {
            onGenderSelect(gender);
        }
    };

    return (
        <>
            {/* 性別カテゴリメニュー */}
            <ul className="flex justify-center items-center my-8 flex-wrap text-sm md:text-base">
                <li 
                    className="px-4 flex flex-col md:flex-row items-center border-l border-r border-gray-300 cursor-pointer"
                    onClick={() => handleGenderSelect('ALL')}
                >
                    <span>ALL</span>
                </li>
                <li 
                    className="px-4 flex flex-col md:flex-row items-center border-l border-r border-gray-300 cursor-pointer"
                    onClick={() => handleGenderSelect('MENS')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#4169e1" className="mb-1 md:mb-0 md:mr-1">
                        <path d="M400-80v-280h-80v-240q0-33 23.5-56.5T400-680h160q33 0 56.5 23.5T640-600v240h-80v280H400Zm80-640q-33 0-56.5-23.5T400-800q0-33 23.5-56.5T480-880q33 0 56.5 23.5T560-800q0 33-23.5 56.5T480-720Z"/>
                    </svg>
                    <span>MENS</span>
                </li>
                <li 
                    className="px-4 flex flex-col md:flex-row items-center border-l border-r border-gray-300 cursor-pointer"
                    onClick={() => handleGenderSelect('LADIES')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ff0000" className="mb-1 md:mb-0 md:mr-1">
                        <path d="M400-80v-240H280l122-308q10-24 31-38t47-14q26 0 47 14t31 38l122 308H560v240H400Zm80-640q-33 0-56.5-23.5T400-800q0-33 23.5-56.5T480-880q33 0 56.5 23.5T560-800q0 33-23.5 56.5T480-720Z"/>
                    </svg>
                    <span>LADIES</span>
                </li>
                <li 
                    className="px-4 flex flex-col md:flex-row items-center border-l border-r border-gray-300 cursor-pointer"
                    onClick={() => handleGenderSelect('KIDS')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffe500" className="mb-1 md:mb-0 md:mr-1">
                        <path d="M480-660q-29 0-49.5-20.5T410-730q0-29 20.5-49.5T480-800q29 0 49.5 20.5T550-730q0 29-20.5 49.5T480-660Zm-80 500v-200h-40v-180q0-33 23.5-56.5T440-620h80q33 0 56.5 23.5T600-540v180h-40v200H400Z"/>
                    </svg>
                    <span>KIDS</span>
                </li>
            </ul>
        </>
    );
};

export default AllMensLeadiesKidsFilter;