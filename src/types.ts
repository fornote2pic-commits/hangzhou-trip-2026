export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  location: string;
  category: 'attraction' | 'food' | 'transport' | 'hotel' | 'other';
  description: string;
  imageUrl: string;
  images: string[];
  mapUrl?: string;
  details?: string;
  introduction?: string;
}

export interface DailyItinerary {
  date: string;
  weather: { 
    temp: string; 
    condition: string; 
    suggestion: string;
    icon?: string;
  };
  items: ScheduleItem[];
  hourlyForecast?: { time: string; temp: string; condition: string }[];
}

export interface Expense {
  id: string;
  date: string;
  title: string;
  amountCNY: number;
  category: string;
  payerUid?: string;
}
