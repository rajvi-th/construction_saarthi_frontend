/**
 * Project Notes Page
 * Shows list of reminders/notes for a specific project
 */

import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ROUTES_FLAT, getRoute } from '../../../constants/routes';
import PageHeader from '../../../components/layout/PageHeader';
import SearchBar from '../../../components/ui/SearchBar';
import DatePicker from '../../../components/ui/DatePicker';
import Toggle from '../../../components/ui/Toggle';
import { useNotes } from '../hooks/useNotes';
import { useNotesProjects } from '../hooks/useNotesProjects';
import { useAuth } from '../../../features/auth/store/authStore';
import { startNote } from '../api/notesApi';
import { showError } from '../../../utils/toast';

export default function ProjectNotes() {
  const { t } = useTranslation('notes');
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { selectedWorkspace } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState(null);

  // Fetch notes for this project from API
  const { notes, isLoading } = useNotes(projectId);

  // Fetch projects to get project name
  const { projects } = useNotesProjects(selectedWorkspace);
  const currentProject = projects.find(p => p.id === projectId || p.id?.toString() === projectId);
  const projectName = currentProject?.name || 'Project';

  const handleNoteClick = (noteId) => {
    navigate(getRoute(ROUTES_FLAT.NOTES_DETAILS, { id: noteId }));
  };

  const handleAddNote = async () => {
    if (!selectedWorkspace) {
      showError('Workspace not selected');
      return;
    }

    try {
      // Call startNote API before opening the form
      const response = await startNote(selectedWorkspace);
      const noteKey = response?.noteKey || response?.note_key || response?.key || response?.data?.noteKey || response?.data?.note_key || response?.data?.key;

      if (!noteKey) {
        throw new Error('Failed to get note key from server');
      }

      // Navigate to add note form with noteKey in state
      navigate(ROUTES_FLAT.NOTES_ADD, { state: { noteKey } });
    } catch (error) {
      console.error('Error starting note:', error);
      const errorMessage = error?.response?.data?.message ||
        error?.message ||
        'Failed to initialize note. Please try again.';
      showError(errorMessage);
    }
  };

  const toggleReminder = (id) => {
    // Static toggle - in real app, this would update the state via API
    console.log('Toggle reminder:', id);
  };

  // Filter notes based on search query (API already filters by projectId)
  const filteredReminders = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [notes, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={projectName}
        onBack={() => navigate(ROUTES_FLAT.NOTES)}
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 md:gap-4">
          <SearchBar
            placeholder={t('searchNotes')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:flex-1 lg:w-[300px] lg:flex-none sm:min-w-0"
          />
          <div className="flex-shrink-0 w-full sm:w-auto">
            <DatePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder={t('selectDateRange')}
              className="w-full sm:w-auto sm:min-w-[180px]"
            />
          </div>
          <button
            onClick={handleAddNote}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-transparent hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 w-full sm:w-auto"
          >
            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-white" strokeWidth={3} />
            </span>
            <span className="text-accent font-medium text-sm sm:text-base">{t('addNote')}</span>
          </button>
        </div>
      </PageHeader>

      {/* Reminders List */}
      <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-secondary">{t('loading', { defaultValue: 'Loading...' })}</div>
          </div>
        ) : filteredReminders.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-secondary">{t('noNotes', { defaultValue: 'No notes found' })}</div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReminders.map((reminder) => (
              <div
                key={reminder.id}
                onClick={() => handleNoteClick(reminder.id)}
                className="bg-white rounded-xl p-4 cursor-pointer shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-primary mb-1">
                      {reminder.title}
                    </h3>
                    <p className="text-sm text-secondary">{t('reminder', { defaultValue: 'Reminder' })}</p>
                    <p className="text-sm font-medium">
                      {reminder.date} - {reminder.time}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Toggle
                      checked={reminder.isActive}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleReminder(reminder.id);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

