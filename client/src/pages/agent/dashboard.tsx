import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search, User, Phone, Mail, CreditCard, Banknote, Smartphone, Receipt } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AgentDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    idNumber: "",
  });

  const [searchParams, setSearchParams] = useState({
    from: "",
    to: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });

  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountReceived, setAmountReceived] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Search routes
  const { data: routes, isLoading: routesLoading } = useQuery({
    queryKey: ["/api/routes/search", searchParams.from, searchParams.to, searchParams.date],
    enabled: hasSearched && !!searchParams.from && !!searchParams.to && !!searchParams.date,
  });

  // Create booking mutation
  const bookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest("POST", "/api/bookings", bookingData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routes/search"] });
      toast({
        title: "Booking successful!",
        description: "Ticket has been issued successfully.",
      });
      resetForm();
    },
    onError: () => {
      toast({
        title: "Booking failed",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setCustomerInfo({ name: "", phone: "", email: "", idNumber: "" });
    setSelectedRoute(null);
    setSelectedSeats([]);
    setAmountReceived("");
    setHasSearched(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchParams.from && searchParams.to && searchParams.date) {
      setHasSearched(true);
    }
  };

  const handleBookNow = (route: any) => {
    setSelectedRoute(route);
  };

  const handleIssueTicket = () => {
    if (!customerInfo.name || !customerInfo.phone) {
      toast({
        title: "Missing customer information",
        description: "Please fill in customer name and phone number.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedRoute || selectedSeats.length === 0) {
      toast({
        title: "No seats selected",
        description: "Please select seats for the customer.",
        variant: "destructive",
      });
      return;
    }

    const totalAmount = selectedSeats.length * parseFloat(selectedRoute.price);

    if (!amountReceived || parseFloat(amountReceived) < totalAmount) {
      toast({
        title: "Insufficient payment",
        description: "Please ensure full payment is received.",
        variant: "destructive",
      });
      return;
    }

    bookingMutation.mutate({
      routeId: selectedRoute.id,
      passengerName: customerInfo.name,
      passengerPhone: customerInfo.phone,
      passengerEmail: customerInfo.email || undefined,
      seatNumbers: selectedSeats,
      bookingDate: searchParams.date,
      totalAmount: totalAmount.toFixed(2),
      paymentStatus: "paid",
      paymentMethod,
      bookingStatus: "confirmed",
      bookedBy: "agent",
    });
  };

  const generateSeatLayout = (route: any) => {
    if (!route) return [];
    
    const seats = [];
    const totalSeats = route.bus.totalSeats || 40;
    
    for (let i = 1; i <= totalSeats; i++) {
      const seatNumber = `${Math.ceil(i / 4)}${String.fromCharCode(65 + ((i - 1) % 4))}`;
      const isBooked = route.bookedSeats?.includes(seatNumber) || false;
      const isSelected = selectedSeats.includes(seatNumber);
      
      seats.push({
        number: seatNumber,
        isBooked,
        isSelected,
      });
    }
    
    return seats;
  };

  const handleSeatClick = (seatNumber: string) => {
    if (selectedRoute?.bookedSeats?.includes(seatNumber)) return;
    
    setSelectedSeats(prev => 
      prev.includes(seatNumber)
        ? prev.filter(seat => seat !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const cities = [
    "New York", "Boston", "Philadelphia", "Washington DC", "Baltimore", 
    "Atlanta", "Miami", "Chicago", "Detroit", "Toronto"
  ];

  const seats = generateSeatLayout(selectedRoute);
  const totalAmount = selectedRoute && selectedSeats.length > 0 
    ? selectedSeats.length * parseFloat(selectedRoute.price) 
    : 0;

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900" data-testid="text-agent-dashboard-title">
            Agent Dashboard
          </h2>
          <p className="text-gray-600 mt-1">Book tickets on behalf of customers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer-name" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Customer Name *
                    </Label>
                    <Input
                      id="customer-name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter customer name"
                      data-testid="input-customer-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer-phone" className="flex items-center">
                      <Phone className="mr-2 h-4 w-4" />
                      Phone Number *
                    </Label>
                    <Input
                      id="customer-phone"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                      data-testid="input-customer-phone"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer-email" className="flex items-center">
                      <Mail className="mr-2 h-4 w-4" />
                      Email (Optional)
                    </Label>
                    <Input
                      id="customer-email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                      data-testid="input-customer-email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer-id">ID Number</Label>
                    <Input
                      id="customer-id"
                      value={customerInfo.idNumber}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, idNumber: e.target.value }))}
                      placeholder="Enter ID number"
                      data-testid="input-customer-id"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Route Search */}
            <Card>
              <CardHeader>
                <CardTitle>Route Search</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="from">From</Label>
                    <Select value={searchParams.from} onValueChange={(value) => setSearchParams(prev => ({ ...prev, from: value }))}>
                      <SelectTrigger data-testid="select-from">
                        <SelectValue placeholder="Select departure city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="to">To</Label>
                    <Select value={searchParams.to} onValueChange={(value) => setSearchParams(prev => ({ ...prev, to: value }))}>
                      <SelectTrigger data-testid="select-to">
                        <SelectValue placeholder="Select destination city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={searchParams.date}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, date: e.target.value }))}
                      min={format(new Date(), "yyyy-MM-dd")}
                      data-testid="input-date"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" className="w-full" data-testid="button-search">
                      <Search className="mr-2 h-4 w-4" />
                      Search Buses
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Available Buses */}
            {hasSearched && (
              <Card>
                <CardHeader>
                  <CardTitle>Available Buses</CardTitle>
                </CardHeader>
                <CardContent>
                  {routesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : routes && routes.length > 0 ? (
                    <div className="space-y-4">
                      {routes.map((route: any) => (
                        <div 
                          key={route.id} 
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                          data-testid={`route-${route.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h4 className="font-medium text-gray-900" data-testid={`route-operator-${route.id}`}>
                                  {route.bus.operator.companyName}
                                </h4>
                                <Badge variant="outline" className="ml-2" data-testid={`route-type-${route.id}`}>
                                  {route.bus.busType}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">Dep:</span> {route.departureTime}
                                </div>
                                <div>
                                  <span className="font-medium">Arr:</span> {route.arrivalTime}
                                </div>
                                <div>
                                  <span className="font-medium">Duration:</span> {route.duration}
                                </div>
                                <div>
                                  <span className="font-medium text-secondary">Available:</span> {route.availableSeats} seats
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-gray-900 mb-2" data-testid={`route-price-${route.id}`}>
                                ${route.price}
                              </div>
                              <Button
                                onClick={() => handleBookNow(route)}
                                disabled={route.availableSeats === 0}
                                data-testid={`button-book-${route.id}`}
                              >
                                {route.availableSeats === 0 ? "Sold Out" : "Book Now"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8" data-testid="no-routes-found">
                      No buses found for the selected route and date.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Seat Selection */}
            {selectedRoute && (
              <Card>
                <CardHeader>
                  <CardTitle>Seat Selection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-8 gap-2 mb-4 max-w-md">
                    {seats.map((seat) => (
                      <Button
                        key={seat.number}
                        variant={seat.isSelected ? "default" : seat.isBooked ? "destructive" : "outline"}
                        className={`w-8 h-8 text-xs ${seat.isBooked ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                        disabled={seat.isBooked}
                        onClick={() => handleSeatClick(seat.number)}
                        data-testid={`seat-${seat.number}`}
                      >
                        {seat.number}
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-400 rounded mr-2"></div>
                      <span>Occupied</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-primary rounded mr-2"></div>
                      <span>Selected</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Payment Processing */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Payment Processing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Method */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Payment Method</Label>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex items-center cursor-pointer flex-1">
                        <Banknote className="text-green-600 mr-2 h-4 w-4" />
                        <span className="font-medium">Cash</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                      <RadioGroupItem value="mobile_money" id="mobile_money" />
                      <Label htmlFor="mobile_money" className="flex items-center cursor-pointer flex-1">
                        <Smartphone className="text-blue-600 mr-2 h-4 w-4" />
                        <span className="font-medium">Mobile Money</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Amount Received */}
                <div>
                  <Label htmlFor="amount-received">Amount Received</Label>
                  <Input
                    id="amount-received"
                    type="number"
                    step="0.01"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    placeholder="0.00"
                    data-testid="input-amount-received"
                  />
                </div>

                {/* Booking Summary */}
                {selectedRoute && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Booking Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customer</span>
                        <span className="font-medium" data-testid="summary-customer">
                          {customerInfo.name || "Not specified"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Route</span>
                        <span className="font-medium" data-testid="summary-route">
                          {selectedRoute.fromCity} → {selectedRoute.toCity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Seats</span>
                        <span className="font-medium text-primary" data-testid="summary-seats">
                          {selectedSeats.join(", ") || "None"}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount</span>
                        <span className="font-medium text-primary" data-testid="summary-amount">
                          ${totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={handleIssueTicket}
                    disabled={bookingMutation.isPending || !selectedRoute || selectedSeats.length === 0}
                    data-testid="button-issue-ticket"
                  >
                    <Receipt className="mr-2 h-4 w-4" />
                    {bookingMutation.isPending ? "Processing..." : "Issue Ticket"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.print()}
                    data-testid="button-print-receipt"
                  >
                    Print Receipt
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
