import { X, Calendar, MapPin, User, Ticket as TicketIcon, Clock, Music, DollarSign } from 'lucide-react';

interface ListingDetails {
  listing: {
    listing_id: string;
    event_id: string;
    event_date: string;
    status: string;
    content: string;
    type: string;
    owner_id: string;
  };
  event: {
    event_id: string;
    event_name: string;
    venue: string;
  };
  times: { event_time: string }[];
  performers: { performer: string }[];
  tickets: {
    ticket_id: string;
    seat_area: string;
    seat_number: string;
    price: number | null;
    status: string;
  }[];
  seller: {
    user_id: string;
    user_name: string;
    email: string;
  };
}

interface ListingModalProps {
  listing: ListingDetails | null;
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const ListingModal = ({ listing, isOpen, onClose, user }: ListingModalProps) => {
  if (!isOpen || !listing) return null;

  const { listing: list, event, times, performers, tickets, seller } = listing;

  const handleTrade = async () => {
    if (!user) {
      alert("Please login to trade");
      return;
    }
    if (user.user_id === seller.user_id) {
      alert("You cannot trade with yourself");
      return;
    }

    try {
      const ticketIds = tickets.map(t => t.ticket_id);

      if (ticketIds.length === 0) {
        alert("No tickets available for this listing");
        return;
      }

      const tradeId = `trade-${Date.now()}`;
      await fetch(`http://localhost:3000/api/trades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trade_id: tradeId,
          listing_id: list.listing_id,
          buyer_id: user.user_id,
          seller_id: seller.user_id,
          ticket_ids: ticketIds
        })
      });

      alert("Trade request sent! Go to Dashboard to confirm.");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to start trade");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{event.event_name}</h2>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{event.venue}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Listing Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wide ${
                list.type === 'Sale' ? 'bg-green-100 text-green-800' :
                list.type === 'Trade' ? 'bg-blue-100 text-blue-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {list.type}
              </span>
              <span className="text-sm text-gray-500 font-mono">#{list.listing_id}</span>
            </div>
            <p className="text-gray-700 mb-3">{list.content}</p>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Event Date: {new Date(list.event_date).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Event Details */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Event Times
            </h3>
            <div className="space-y-2">
              {times.map((time, index) => (
                <div key={index} className="bg-blue-50 p-3 rounded-lg">
                  {new Date(time.event_time).toLocaleString()}
                </div>
              ))}
            </div>
          </div>

          {/* Performers */}
          {performers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Music className="h-5 w-5 mr-2 text-purple-600" />
                Performers
              </h3>
              <div className="flex flex-wrap gap-2">
                {performers.map((performer, index) => (
                  <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    {performer.performer}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tickets */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <TicketIcon className="h-5 w-5 mr-2 text-green-600" />
              Available Tickets ({tickets.length})
            </h3>
            {tickets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tickets.map(ticket => (
                  <div key={ticket.ticket_id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-sm text-gray-600">#{ticket.ticket_id}</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {ticket.status}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="font-medium">Seat:</span> {ticket.seat_area} - {ticket.seat_number}
                      </div>
                      {ticket.price && (
                        <div className="text-sm flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                          <span className="font-semibold text-green-600">${ticket.price}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No tickets currently available</p>
            )}
          </div>

          {/* Seller Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Seller Information
            </h3>
            <div className="space-y-1">
              <p><span className="font-medium">Name:</span> {seller.user_name}</p>
              <p><span className="font-medium">Contact:</span> {seller.email}</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Close
            </button>

            {user && user.user_id !== seller.user_id && tickets.length > 0 && (
              <button
                onClick={handleTrade}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Start Trade Request
              </button>
            )}

            {!user && (
              <p className="text-sm text-gray-600">Login required to trade</p>
            )}

            {user && user.user_id === seller.user_id && (
              <p className="text-sm text-gray-600">This is your own listing</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingModal;
