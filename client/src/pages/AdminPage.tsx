import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

interface EventSummary {
  event_id: string;
  event_name: string;
  venue: string | null;
}

const AdminPage = () => {
  const storedUser = useMemo(() => {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  }, []);

  const isAdmin =
    storedUser &&
    Array.isArray(storedUser.roles) &&
    storedUser.roles.includes('Admin');

  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [eventId, setEventId] = useState('');
  const [eventName, setEventName] = useState('');
  const [venue, setVenue] = useState('');
  const [eventTimes, setEventTimes] = useState<string[]>([]);
  const [newEventTime, setNewEventTime] = useState('');
  const [performers, setPerformers] = useState<string[]>([]);
  const [newPerformer, setNewPerformer] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const fetchEvents = async () => {
      try {
        const res = await api.get('/events');
        setEvents(res.data);
      } catch (error) {
        console.error('Failed to fetch events', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [isAdmin]);

  const resetForm = () => {
    setEventId('');
    setEventName('');
    setVenue('');
    setEventTimes([]);
    setPerformers([]);
    setNewEventTime('');
    setNewPerformer('');
  };

  const handleAddEventTime = () => {
    if (!newEventTime) return;
    const isoTime = new Date(newEventTime).toISOString();
    setEventTimes((prev) => [...prev, isoTime]);
    setNewEventTime('');
  };

  const handleRemoveEventTime = (index: number) => {
    setEventTimes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddPerformer = () => {
    if (!newPerformer.trim()) return;
    setPerformers((prev) => [...prev, newPerformer.trim()]);
    setNewPerformer('');
  };

  const handleRemovePerformer = (index: number) => {
    setPerformers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim()) {
      alert('Event name is required');
      return;
    }

    const payload = {
      event_id: eventId.trim() || `EVT${Date.now().toString().slice(-6)}`,
      event_name: eventName.trim(),
      venue: venue.trim() || null,
      event_times: eventTimes,
      performers
    };

    try {
      setSubmitting(true);
      await api.post('/admin/events', payload);
      alert('Event created successfully');
      resetForm();

      const res = await api.get('/events');
      setEvents(res.data);
    } catch (error) {
      console.error('Failed to create event', error);
      alert('Failed to create event. Check server logs for details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string, name: string) => {
    const confirmed = window.confirm(
      `Delete event "${name}" and all related data? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/admin/events/${id}`);
      setEvents((prev) => prev.filter((event) => event.event_id !== id));
      alert('Event deleted successfully');
    } catch (error) {
      console.error('Failed to delete event', error);
      alert(
        'Failed to delete event. Ensure there are no related records or check server logs.'
      );
    }
  };

  if (!storedUser) {
    return (
      <div className="max-w-3xl mx-auto text-center bg-white rounded-lg p-10 shadow">
        <p className="text-lg text-gray-700 mb-4">
          Please log in to access the admin dashboard.
        </p>
        <Link
          to="/login"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-lg p-10 shadow text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Access restricted
        </h2>
        <p className="text-gray-600">
          Your account does not have admin privileges. Contact an administrator
          if you believe this is an error.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Admin Event Management
        </h1>
        <p className="text-gray-600 mb-6">
          Create new events and manage key details such as venue, schedule, and
          performers.
        </p>

        <form className="space-y-6" onSubmit={handleCreateEvent}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event ID (optional)
              </label>
              <input
                type="text"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full border rounded-md p-2"
                placeholder="Auto-generated if left blank"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Name *
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full border rounded-md p-2"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Venue
            </label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full border rounded-md p-2"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Times
              </label>
              <div className="flex space-x-2">
                <input
                  type="datetime-local"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  className="flex-1 border rounded-md p-2"
                />
                <button
                  type="button"
                  onClick={handleAddEventTime}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <ul className="mt-3 space-y-2">
                {eventTimes.map((time, index) => (
                  <li
                    key={time}
                    className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded"
                  >
                    <span>{new Date(time).toLocaleString()}</span>
                    <button
                      type="button"
                      className="text-sm text-red-500 hover:underline"
                      onClick={() => handleRemoveEventTime(index)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Performers
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newPerformer}
                  onChange={(e) => setNewPerformer(e.target.value)}
                  className="flex-1 border rounded-md p-2"
                  placeholder="Performer name"
                />
                <button
                  type="button"
                  onClick={handleAddPerformer}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <ul className="mt-3 space-y-2">
                {performers.map((performer, index) => (
                  <li
                    key={`${performer}-${index}`}
                    className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded"
                  >
                    <span>{performer}</span>
                    <button
                      type="button"
                      className="text-sm text-red-500 hover:underline"
                      onClick={() => handleRemovePerformer(index)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Existing Events
          </h2>
          <button
            onClick={async () => {
              setLoading(true);
              try {
                const res = await api.get('/events');
                setEvents(res.data);
              } finally {
                setLoading(false);
              }
            }}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-gray-500">No events found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Venue
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event ID
                  </th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.event_id}>
                    <td className="px-4 py-2">
                      <p className="font-medium text-gray-900">
                        {event.event_name}
                      </p>
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {event.venue || '—'}
                    </td>
                    <td className="px-4 py-2 text-gray-500">
                      {event.event_id}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() =>
                          handleDeleteEvent(event.event_id, event.event_name)
                        }
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminPage;

