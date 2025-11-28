import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';

interface Event {
  event_id: string;
  event_name: string;
  venue: string;
}

const HomePage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events');
        setEvents(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Upcoming Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <Link to={`/events/${event.event_id}`} key={event.event_id} className="block group">
            <div className="bg-white rounded-lg shadow-md p-6 transition group-hover:shadow-lg border border-gray-200">
              <h2 className="text-xl font-bold mb-2 text-gray-800">{event.event_name}</h2>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{event.venue}</span>
              </div>
              <div className="mt-4 text-blue-600 font-semibold group-hover:underline">
                View Details & Listings
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
