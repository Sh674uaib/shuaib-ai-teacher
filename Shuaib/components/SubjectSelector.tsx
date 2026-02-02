
import React from 'react';
import { SUBJECTS } from '../constants';
import { Subject } from '../types';

interface SubjectSelectorProps {
  selectedSubject: Subject;
  onSelect: (subject: Subject) => void;
}

const SubjectSelector: React.FC<SubjectSelectorProps> = ({ selectedSubject, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4 p-2 bg-white rounded-xl shadow-sm border border-slate-100">
      {SUBJECTS.map((subject) => (
        <button
          key={subject.name}
          onClick={() => onSelect(subject.name)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            selectedSubject === subject.name
              ? `${subject.color} ring-2 ring-offset-1 ring-current`
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>{subject.icon}</span>
          <span>{subject.name === 'General' ? 'সাধারণ' : subject.name}</span>
        </button>
      ))}
    </div>
  );
};

export default SubjectSelector;
