import { Search } from "lucide-react";

export default function SearchInput() {
    return (
        <div className="col-span-2 md:col-span-1 relative w-[100%]  h-[40px]  md:w-[420px] md:h-[48px]">
            <input
                type="text"
                placeholder="Search anything here..."
                className="w-full h-full pl-12 pr-4 border rounded-[8px] focus:outline-none focus:ring-2 focus:ring-black"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-6 h-6" />
        </div>
    );
}
