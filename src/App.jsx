import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Upload, 
  ExternalLink,
  ChevronDown 
} from 'lucide-react';

export default function GardenJobCalendar() {
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
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

  // Add this array of emojis
  const plantEmojis = [
    '🌱', '🌿', '🌺', '🌸', '🌼', '🌻', '🌹', '🪴', '🌵',
    '🌴', '🌳', '🌲', '🍀', '🍁', '🍂', '🍃', '🌾', '🌷',
    '🪷', '🌹', '🥀', '🌺', '🌸', '🌼', '🌻', '🌞', '🌝',
    '🍄', '🌰', '🥜', '🥕', '🥬', '🥦', '🧄', '🧅', '🌽'
  ];

  // Add this state to track used emojis
  const [usedEmojis, setUsedEmojis] = useState(new Set());

  // Add this function to get a random unused emoji
  const getRandomEmoji = () => {
    const availableEmojis = plantEmojis.filter(emoji => !usedEmojis.has(emoji));
    if (availableEmojis.length === 0) {
      // If all emojis are used, reset the used emojis set
      setUsedEmojis(new Set());
      return plantEmojis[Math.floor(Math.random() * plantEmojis.length)];
    }
    const randomEmoji = availableEmojis[Math.floor(Math.random() * availableEmojis.length)];
    setUsedEmojis(prev => new Set([...prev, randomEmoji]));
    return randomEmoji;
  };

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

  // Modify the handleAddNote function to include a random emoji if no image
  const handleAddNote = () => {
    if (newNote.title && selectedPeriod) {
      const noteToAdd = {
        ...newNote,
        id: Date.now(),
        year: selectedYear,
        date: selectedPeriod,
        createdAt: new Date().toISOString(),
        emoji: !newNote.image ? getRandomEmoji() : null // Add random emoji if no image
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

  const NoteDetailsModal = ({ note: initialNote, onClose }) => {
  const [note, setNote] = useState(initialNote);
  
  if (!note) return null;
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedNote = {
          ...note,
          image: reader.result,
          emoji: null // Remove emoji when image is added
        };
        setNote(updatedNote);
        setNotes(prevNotes => 
          prevNotes.map(n => n.id === note.id ? updatedNote : n)
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    const updatedNote = {
      ...note,
      image: '',
      emoji: getRandomEmoji() // Add a random emoji when image is removed
    };
    setNote(updatedNote);
    setNotes(prevNotes => 
      prevNotes.map(n => n.id === note.id ? updatedNote : n)
    );
  };

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
        
        <div className="mb-6">
          {note.image ? (
            <div className="relative group">
              <img 
                src={note.image} 
                alt={note.title}
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-lg">
                <div className="flex gap-2">
                  <label className="cursor-pointer px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Change Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={handleRemoveImage}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-6xl">
                {note.emoji}
              </div>
              <label className="cursor-pointer px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Add Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
        
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
};

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto flex flex-col min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-8 h-8" />
            Garden Job Calendar
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                value={selectedMonth || ''}
                onChange={(e) => setSelectedMonth(e.target.value || null)}
                className="appearance-none bg-white rounded-lg shadow-sm px-4 py-2 pr-10 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 h-[44px] text-base font-medium"
              >
                <option value="">All Months</option>
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
            
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
        </div>

        <div className="space-y-6 flex-grow">
          {months
            .filter(month => selectedMonth === null || month === selectedMonth)
            .map(month => (
            <div key={month} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{month}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <div className="grid grid-cols-3 gap-2">
                        {periodNotes.map(note => (
                          <button
                            key={note.id}
                            onClick={() => openNoteDetails(note)}
                            className="aspect-square relative group"
                          >
                            {note.image ? (
                              <img 
                                src={note.image} 
                                alt={note.title}
                                className="w-full h-full object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-4xl">
                                {note.emoji}
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <ExternalLink className="w-5 h-5 text-white drop-shadow-lg" />
                            </div>
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            setSelectedPeriod(`${period} of ${month}`);
                            setShowAddNote(true);
                          }}
                          className="aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-500 transition-colors flex items-center justify-center"
                        >
                          <Plus className="w-6 h-6 text-gray-400 hover:text-blue-500 transition-colors" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t">
          <div className="flex flex-row justify-between items-center">
            <div>
              <a 
                href="https://andreicarpen.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                Made with ❤️ by Andrei
              </a>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <button
                onClick={exportData}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto"
              >
                <Download className="w-4 h-4" /> Export Calendar
              </button>
              <label className="flex items-center justify-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer w-full sm:w-auto">
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
        </div>

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
