
const AllMensLeadiesKidsFilter: React.FC = () => {
    return (
        <>
            {/* 性別カテゴリメニュー */}  
            <ul className="flex justify-center items-center my-12">  
            <li className="px-4 flex border-l border-r border-gray-300">ALL</li>  
            <li className="px-4 flex border-l border-r border-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#4169e1"><path d="M400-80v-280h-80v-240q0-33 23.5-56.5T400-680h160q33 0 56.5 23.5T640-600v240h-80v280H400Zm80-640q-33 0-56.5-23.5T400-800q0-33 23.5-56.5T480-880q33 0 56.5 23.5T560-800q0 33-23.5 56.5T480-720Z"/></svg>
            MENS
            </li>
            <li className="px-4 flex border-l border-r border-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ff0000"><path d="M400-80v-240H280l122-308q10-24 31-38t47-14q26 0 47 14t31 38l122 308H560v240H400Zm80-640q-33 0-56.5-23.5T400-800q0-33 23.5-56.5T480-880q33 0 56.5 23.5T560-800q0 33-23.5 56.5T480-720Z"/></svg>
            LADIES
            </li>
            <li className="px-4 flex border-l border-r border-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffe500"><path d="M480-660q-29 0-49.5-20.5T410-730q0-29 20.5-49.5T480-800q29 0 49.5 20.5T550-730q0 29-20.5 49.5T480-660Zm-80 500v-200h-40v-180q0-33 23.5-56.5T440-620h80q33 0 56.5 23.5T600-540v180h-40v200H400Z"/></svg>
            KIDS
            </li>  
            </ul>
        </>
    );
};

export default AllMensLeadiesKidsFilter;
