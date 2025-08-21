import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QRCode } from "@/components/qr-code";
import { CheckCircle, Download, Share2, Calendar, MapPin, Clock, User } from "lucide-react";

export default function BookingConfirmation() {
  // Parse URL parameters
  const searchParams = new URLSearchParams(window.location.search);
  const bookingId = searchParams.get("bookingId");

  // Fetch booking details
  const { data: booking, isLoading } = useQuery({
    queryKey: ["/api/bookings", bookingId],
    enabled: !!bookingId,
  });

  if (!bookingId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-red-600" data-testid="error-missing-booking">Missing booking information</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-red-600" data-testid="error-booking-not-found">Booking not found</p>
      </div>
    );
  }

  const handleDownload = () => {
    // In a real application, this would generate and download a PDF ticket
    const ticketData = {
      bookingId: booking.id,
      passenger: booking.passengerName,
      seats: booking.seatNumbers?.join(", "),
      date: booking.bookingDate,
      amount: booking.totalAmount,
    };
    
    const blob = new Blob([JSON.stringify(ticketData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${booking.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'MoBus Ticket',
        text: `Bus ticket for ${booking.passengerName} - Booking ID: ${booking.id}`,
        url: window.location.href,
      });
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Card>
          <CardContent className="p-8">
            <div className="mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600 text-2xl h-10 w-10" data-testid="icon-success" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-confirmation-title">
                Booking Confirmed!
              </h2>
              <p className="text-gray-600">Your ticket has been booked successfully</p>
            </div>

            {/* E-Ticket */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900">E-Ticket</h3>
                    <p className="text-sm text-gray-600" data-testid="text-booking-id">
                      Booking ID: {booking.id}
                    </p>
                    <Badge 
                      variant={booking.paymentStatus === 'paid' ? 'default' : 'destructive'}
                      className="mt-2"
                      data-testid="badge-payment-status"
                    >
                      {booking.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <QRCode value={`MoBus-${booking.id}`} size={80} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 flex items-center">
                      <User className="mr-1 h-4 w-4" />
                      Passenger
                    </p>
                    <p className="font-medium" data-testid="text-passenger-name">
                      {booking.passengerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      Date
                    </p>
                    <p className="font-medium" data-testid="text-booking-date">
                      {new Date(booking.bookingDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Seat(s)</p>
                    <p className="font-medium" data-testid="text-seat-numbers">
                      {booking.seatNumbers?.join(", ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Amount</p>
                    <p className="font-medium text-primary" data-testid="text-total-amount">
                      ${booking.totalAmount}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 flex items-center">
                      <MapPin className="mr-1 h-4 w-4" />
                      Route
                    </p>
                    <p className="font-medium" data-testid="text-route">
                      From → To
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      Status
                    </p>
                    <Badge variant="secondary" data-testid="badge-booking-status">
                      {booking.bookingStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button className="flex-1" onClick={handleDownload} data-testid="button-download">
                <Download className="mr-2 h-4 w-4" />
                Download Ticket
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleShare} data-testid="button-share">
                <Share2 className="mr-2 h-4 w-4" />
                Share Ticket
              </Button>
            </div>

            {/* Additional Info */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Important:</strong> Please arrive at the boarding point at least 15 minutes before departure time. 
                Show this e-ticket or QR code to the driver/conductor.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
