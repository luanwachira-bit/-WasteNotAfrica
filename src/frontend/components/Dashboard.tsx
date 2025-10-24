import { Thermometer, Droplets, Sprout, Gauge, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import SensorCard from './SensorCard';
import AlertBox from './AlertBox';
import RewardsSection from './RewardsSection';

interface SensorData {
  temperature: number;
  humidity: number;
  timestamp: string;
}

interface WebSocketMessage {
  sensor_data: SensorData;
  alert: string;
  reward_tokens: number;
}

export default function Dashboard() {
  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: 0,
    humidity: 0,
    timestamp: new Date().toISOString()
  });
  const [alert, setAlert] = useState<string>('');
  const [tokens, setTokens] = useState<number>(0);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');

    ws.onmessage = (event) => {
      const data: WebSocketMessage = JSON.parse(event.data);
      setSensorData(data.sensor_data);
      setAlert(data.alert);
      if (data.reward_tokens > 0) {
        setTokens(prev => prev + data.reward_tokens);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleRedeem = () => {
    alert('Redeem functionality coming soon!');
  };

  const handleWhatsAppContact = () => {
    window.open('https://wa.me/254710825792', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-farm-green-50 to-earth-brown-50">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <header className="text-center mb-6">
          <div className="bg-gradient-to-r from-farm-green-600 to-farm-green-700 text-white rounded-3xl shadow-xl p-7 mb-2">
            <h1 className="text-3xl font-bold mb-2">WasteNot Africa</h1>
            <p className="text-farm-green-100 text-xl font-semibold">Save Your Harvest</p>
          </div>
        </header>

        <section>
          <h2 className="text-earth-brown-800 font-bold text-xl mb-5 px-1 flex items-center gap-2">
            <span className="text-2xl">📊</span> Vipimo vya Mazao
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <SensorCard
              title="Temperature"
              value={sensorData.temperature.toString()}
              unit="°C"
              icon={Thermometer}
              color="bg-gradient-to-br from-orange-400 to-red-500"
            />
            <SensorCard
              title="Humidity"
              value={sensorData.humidity.toString()}
              unit="%"
              icon={Droplets}
              color="bg-gradient-to-br from-red-500 to-red-600"
              isWarning={sensorData.humidity > 70}
            />
            <SensorCard
              title="Soil Moisture"
              value="45" // TODO: Add soil moisture sensor
              unit="%"
              icon={Sprout}
              color="bg-gradient-to-br from-farm-green-400 to-farm-green-600"
            />
            <SensorCard
              title="Waste Score"
              value={(sensorData.humidity > 70 ? 72 : 25).toString()}
              unit="/100"
              icon={Gauge}
              color="bg-gradient-to-br from-purple-400 to-purple-600"
            />
          </div>
        </section>

        <section>
          <h2 className="text-earth-brown-800 font-bold text-xl mb-5 px-1 flex items-center gap-2">
            <span className="text-2xl">🤖</span> Ushauri wa AI
          </h2>
          <AlertBox message={alert} isHighPriority={sensorData.humidity > 70} />
        </section>

        <section>
          <h2 className="text-earth-brown-800 font-bold text-xl mb-5 px-1 flex items-center gap-2">
            <span className="text-2xl">🎁</span> Tuzo Yako
          </h2>
          <RewardsSection tokens={tokens} onRedeem={handleRedeem} />
        </section>

        <footer className="pt-6 pb-8">
          <button
            onClick={handleWhatsAppContact}
            className="w-full bg-green-500 hover:bg-green-600 active:scale-95 text-white font-bold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all duration-200 min-h-[44px]"
          >
            <MessageCircle className="w-7 h-7" strokeWidth={2.5} />
            <span className="text-xl">Wasiliana na Sisi</span>
          </button>
          <p className="text-center text-earth-brown-600 text-sm mt-3">+254 710 825 792</p>
        </footer>
      </div>
    </div>
  );
}
