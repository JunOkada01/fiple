const GenderHeaderMenu: React.FC = () => {
    return (
        <>
         {/* 性別カテゴリメニュー */}
        <ul className="flex justify-center items-center my-12">
            <li className="px-4 border-l border-r border-gray-300">ALL</li>
            <li className="px-4 border-l border-r border-gray-300">MENS</li>
            <li className="px-4 border-l border-r border-gray-300">LADIES</li>
            <li className="px-4 border-l border-r border-gray-300">KIDS</li>
        </ul>
            
        </>
    );
};

export default GenderHeaderMenu;