import { useState, useEffect } from 'react';
import { Calendar, Plus, X, ChevronLeft, ChevronRight, Download, Upload, ExternalLink } from 'lucide-react';

export default function PlantingCalendar() {
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [notes, setNotes] = useState([]);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showNoteDetails, setShowNoteDetails] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [newNote, setNewNote] = useState({
    title: '',
    description: '',
    image: '',
    date: '',
    year: selectedYear
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const periods = ['Beginning', 'Middle', 'End'];

  useEffect(() => {
    const savedData = localStorage.getItem('plantingCalendarData');
    if (savedData) {
      setNotes(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('plantingCalendarData', JSON.stringify(notes));
  }, [notes]);

  const handleAddNote = () => {
    if (newNote.title && selectedPeriod) {
      const noteToAdd = {
        ...newNote,
        id: Date.now(),
        year: selectedYear,
        date: selectedPeriod,
        createdAt: new Date().toISOString()
      };
      
      setNotes(prevNotes => [...prevNotes, noteToAdd]);
      setNewNote({
        title: '',
        description: '',
        image: '',
        date: '',
        year: selectedYear
      });
      setShowAddNote(false);
    }
  };

  const handleDeleteNote = (id) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    setShowNoteDetails(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewNote({ ...newNote, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(notes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.download = `planting-calendar-${selectedYear}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          setNotes(importedData);
        } catch (error) {
          alert('Error importing file. Please make sure it\'s a valid JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const openNoteDetails = (note) => {
    setSelectedNote(note);
    setShowNoteDetails(true);
  };

  const changeYear = (increment) => {
    setSelectedYear(prev => prev + increment);
  };

  const NoteDetailsModal = ({ note, onClose }) => {
    if (!note) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{note.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{note.date} • {note.year}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {note.image && (
            <div className="mb-6">
              <img 
                src={note.image} 
                alt={note.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}
          
          <div className="prose max-w-none mb-8">
            <p className="text-gray-600 whitespace-pre-wrap">{note.description || "No description provided."}</p>
          </div>
  
          <div className="border-t pt-6">
            <button
              onClick={() => handleDeleteNote(note.id)}
              className="w-full py-2 px-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Delete planting
            </button>
          </div>
        </div>
      </div>
    );
  }

// ... (keep all the state and functions the same until the return statement) ...

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto flex flex-col min-h-[calc(100vh-4rem)]">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-8 h-8" />
            Garden Job Calendar
          </h1>
          
          <div className="flex items-center gap-4 bg-white rounded-lg shadow-sm p-2">
            <button 
              onClick={() => changeYear(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xl font-semibold min-w-[100px] text-center">
              {selectedYear}
            </span>
            <button 
              onClick={() => changeYear(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
          {months.map(month => (
            <div key={month} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{month}</h2>
              <div className="space-y-3">
                {periods.map(period => {
                  const periodNotes = notes.filter(note => 
                    note.date === `${period} of ${month}` && note.year === selectedYear
                  );

                  return (
                    <div 
                      key={`${month}-${period}`}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="font-medium text-gray-700 mb-2">{period}</h3>
                      <div className="space-y-2">
                        {periodNotes.map(note => (
                          <button
                            key={note.id}
                            onClick={() => openNoteDetails(note)}
                            className="w-full text-left bg-gray-50 rounded p-3 hover:bg-gray-100 transition-colors group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{note.title}</span>
                              <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            setSelectedPeriod(`${period} of ${month}`);
                            setShowAddNote(true);
                          }}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          <Plus className="w-4 h-4" /> Add planting
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer with Export/Import */}
        <div className="mt-8 pt-6 border-t">
          <div className="flex justify-center gap-4">
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" /> Export Calendar
            </button>
            <label className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" /> Import Calendar
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Add Note Modal */}
        {showAddNote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Add New Planting</h3>
                <button 
                  onClick={() => setShowAddNote(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Seed name"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <textarea
                  placeholder="Description"
                  value={newNote.description}
                  onChange={(e) => setNewNote({ ...newNote, description: e.target.value })}
                  className="w-full p-2 border rounded h-24"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full"
                />
                <button
                  onClick={handleAddNote}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Add Planting
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Note Details Modal */}
        {showNoteDetails && (
          <NoteDetailsModal
            note={selectedNote}
            onClose={() => setShowNoteDetails(false)}
          />
        )}
      </div>
    </div>
  );
}
