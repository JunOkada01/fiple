import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPerson, faPersonDress, faChild } from "@fortawesome/free-solid-svg-icons";

const AllMensLeadiesKidsFilter: React.FC = () => {
    return (
        <>
            {/* 性別カテゴリメニュー ホバー時にテキスト下部にした線が伸びる */}
            <ul className="flex justify-center items-center my-8 flex-wrap text-sm md:text-base">
                {/* ALL */}
                <li className="group px-4 flex flex-col md:flex-row items-center border-l border-r border-gray-300 relative">
                    <span className="relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 after:bg-black after:transition-all after:duration-300 group-hover:after:w-full">
                        ALL
                    </span>
                </li>

                {/* MENS */}
                <li className="group px-4 flex flex-col md:flex-row items-center border-l border-r border-gray-300 relative">
                    <FontAwesomeIcon icon={faPerson} className="text-xl text-blue-500 mb-1 md:mb-0 md:mr-2" />
                    <span className="relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 after:bg-black after:transition-all after:duration-300 group-hover:after:w-full">
                        MENS
                    </span>
                </li>

                {/* LADIES */}
                <li className="group px-4 flex flex-col md:flex-row items-center border-l border-r border-gray-300 relative">
                    <FontAwesomeIcon icon={faPersonDress} className="text-xl text-red-500 mb-1 md:mb-0 md:mr-2" />
                    <span className="relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 after:bg-black after:transition-all after:duration-300 group-hover:after:w-full">
                        LADIES
                    </span>
                </li>

                {/* KIDS */}
                <li className="group px-4 flex flex-col md:flex-row items-center border-l border-r border-gray-300 relative">
                    <FontAwesomeIcon icon={faChild} className="text-lg text-yellow-500 mb-1 md:mb-0 md:mr-2" />
                    <span className="relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 after:bg-black after:transition-all after:duration-300 group-hover:after:w-full">
                        KIDS
                    </span>
                </li>
            </ul>
        </>
    );
};

export default AllMensLeadiesKidsFilter;
