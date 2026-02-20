import React, { useState, useEffect, useRef } from 'react';
import type { RedmineProject } from '../types';
import { Search, ChevronDown, Check } from 'lucide-react';

interface Props {
    projects: RedmineProject[];
    selectedIds: number[];
    onSelect: (ids: number[]) => void;
}

export const ProjectFilter: React.FC<Props> = ({ projects, selectedIds, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const sortedProjects = [...projects].sort((a, b) => {
        const aSelected = selectedIds.includes(a.id);
        const bSelected = selectedIds.includes(b.id);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return 0;
    });

    const filteredProjects = sortedProjects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleProject = (id: number) => {
        if (selectedIds.includes(id)) {
            onSelect(selectedIds.filter(pid => pid !== id));
        } else {
            onSelect([...selectedIds, id]);
        }
    };


    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div className="relative h-[28px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                    type="text"
                    className="w-full pl-8 pr-8 py-1 bg-gray-50 border border-gray-300 text-gray-900 text-[13px] rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 hover:bg-white transition-colors outline-none h-full"
                    placeholder={selectedIds.length > 0 ? `Selected: ${selectedIds.length} projects` : "Search Projects..."}
                    value={searchTerm}
                    maxLength={100}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                >
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-xl border border-gray-200 max-h-72 overflow-y-auto custom-scrollbar">
                    {filteredProjects.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 bg-gray-50">No projects found.</div>
                    ) : (
                        <ul className="py-1">
                            {filteredProjects.map(project => {
                                const isSelected = selectedIds.includes(project.id);
                                return (
                                    <li
                                        key={project.id}
                                        onClick={() => toggleProject(project.id)}
                                        className={`px-4 py-2.5 text-[13px] cursor-pointer hover:bg-blue-50 flex items-center justify-between group ${isSelected ? 'bg-blue-50/50' : 'text-gray-700'}`}
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                                                {isSelected && <Check size={12} className="text-white" />}
                                            </div>
                                            <span className={`truncate ${isSelected ? 'text-blue-700 font-medium' : ''}`}>{project.name}</span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};
