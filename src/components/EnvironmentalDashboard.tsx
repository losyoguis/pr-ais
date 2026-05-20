import React, { useState, useEffect, useMemo } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  AlertTriangle, 
  Clock, 
  RefreshCcw,
  School,
  ArrowUpRight,
  ArrowDownRight,
  Gauge
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format, subMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

// Tipos
interface Reading {
  timestamp: Date;
  temp: number;
  humidity: number;
}

// Generador de datos de prueba
const generateHistory = (points: number): Reading[] => {
  const now = new Date();
  return Array.from({ length: points }).map((_, i) => ({
    timestamp: subMinutes(now, (points - i - 1) * 30),
    temp: 22 + Math.random() * 5 + Math.sin(i / 5) * 2,
    humidity: 50 + Math.random() * 10 + Math.cos(i / 5) * 5
  }));
};

export default function EnvironmentalDashboard() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [nextUpdate, setNextUpdate] = useState(42);

  useEffect(() => {
    // Carga inicial
    setReadings(generateHistory(24));

    // Simulación de tiempo real
    const interval = setInterval(() => {
      if (isLive) {
        setReadings(prev => {
          const lastReading = prev[prev.length - 1];
          const newReading: Reading = {
            timestamp: new Date(),
            temp: lastReading.temp + (Math.random() - 0.5) * 0.5,
            humidity: Math.min(100, Math.max(0, lastReading.humidity + (Math.random() - 0.5) * 1))
          };
          return [...prev.slice(1), newReading];
        });
        setNextUpdate(42);
      }
    }, 5000);

    const timer = setInterval(() => {
      if (isLive) setNextUpdate(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [isLive]);

  const currentReading = readings[readings.length - 1] || { temp: 24.2, humidity: 58 };
  
  // Fake zones to match design grid
  const zones = [
    { id: '01', name: 'Aula Máxima', temp: 22.5, hum: 52, color: 'emerald' },
    { id: '02', name: 'Biblioteca', temp: 21.0, hum: 64, color: 'blue' },
    { id: '03', name: 'Lab. Química', temp: 28.4, hum: 48, color: 'orange', alert: true },
    { id: '04', name: 'Sala de Sistemas', temp: 19.8, hum: 45, color: 'emerald' },
    { id: '05', name: 'Bloque A - Piso 2', temp: 23.1, hum: 55, color: 'emerald' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 md:p-4">
      <div id="app-container" className="w-full max-w-[1280px] h-full md:h-[800px] bg-[#f8fafc] text-slate-800 flex flex-col md:flex-row overflow-hidden border-0 md:border-8 border-slate-900 shadow-2xl relative">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-72 bg-slate-900 text-white flex flex-col shrink-0">
          <div className="p-8 border-b border-slate-700 bg-slate-800">
            <div className="w-12 h-12 bg-emerald-500 rounded-none mb-4 flex items-center justify-center font-black text-2xl text-slate-900">M</div>
            <h1 className="text-xl font-black leading-tight tracking-[0.01em] uppercase">
              Institución Educativa<br/>
              <span className="text-emerald-400">Manuel J Betancur</span>
            </h1>
          </div>
          
          <nav className="flex-1 py-8 px-4">
            <ul className="space-y-2">
              <li className="bg-slate-800 p-4 border-l-4 border-emerald-500 flex justify-between items-center cursor-pointer group">
                <span className="font-bold text-sm tracking-widest uppercase">Panel Central</span>
                <span className="w-2 h-2 rounded-none bg-emerald-500"></span>
              </li>
              {['Mapas de Calor', 'Reportes Mensuales', 'Configuración'].map((item) => (
                <li key={item} className="p-4 flex items-center opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="font-bold text-sm tracking-widest uppercase">{item}</span>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-8 bg-slate-800 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black border-t border-slate-700">
            Estado: <span className="text-emerald-400">Sistema Activo</span>
            <div className="mt-2 text-slate-300">Nodos En Línea: 12/12</div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {/* Top Statistics Bar */}
          <header className="h-auto md:h-32 bg-white border-b border-slate-200 grid grid-cols-1 md:grid-cols-3 shrink-0">
            <div className="p-6 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-center">
              <span className="geo-micro-label">Promedio Institucional</span>
              <div className="text-3xl font-black text-slate-900 flex items-baseline gap-2">
                {currentReading.temp.toFixed(1)}°C 
                <span className="text-emerald-500 text-sm">▲</span>
              </div>
            </div>
            <div className="p-6 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-center">
              <span className="geo-micro-label">Humedad Relativa</span>
              <div className="text-3xl font-black text-slate-900 flex items-baseline gap-2">
                {currentReading.humidity.toFixed(0)}% 
                <span className="text-blue-500 text-sm">▼</span>
              </div>
            </div>
            <div className="p-6 bg-emerald-50 flex flex-col justify-center items-end text-right">
              <span className="text-xs uppercase font-bold text-emerald-700 mb-1">Próxima Lectura</span>
              <div className="text-4xl font-black text-emerald-900 font-mono">
                00:{nextUpdate.toString().padStart(2, '0')}s
              </div>
            </div>
          </header>

          {/* Sensors Grid */}
          <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-100 overflow-y-auto">
            {zones.map((zone) => (
              <Card 
                key={zone.id} 
                className={cn(
                  "rounded-none border-2 p-6 flex flex-col justify-between transition-all duration-300 bg-white",
                  zone.alert ? "border-orange-200 ring-8 ring-orange-50" : "border-slate-200"
                )}
              >
                <div>
                  <div className={cn(
                    "text-[10px] font-black mb-1 tracking-widest",
                    zone.alert ? "text-orange-400" : "text-slate-300"
                  )}>
                    ZONA {zone.id} {zone.alert ? '/ ALERTA' : ''}
                  </div>
                  <h2 className="text-lg font-black text-slate-900 uppercase">{zone.name}</h2>
                </div>
                
                <div className="flex justify-between items-end mt-8">
                  <div className={cn(
                    "text-5xl font-black tracking-tighter",
                    zone.alert ? "text-orange-600" : "text-slate-900"
                  )}>
                    {zone.temp.toFixed(1)}<span className="text-xl">°C</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HUMEDAD</div>
                    <div className={cn(
                      "text-2xl font-black",
                      zone.color === 'blue' ? "text-blue-600" : "text-slate-900"
                    )}>
                      {zone.hum}%
                    </div>
                  </div>
                </div>

                <div className="h-1.5 w-full bg-slate-100 mt-6 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(zone.temp/40) * 100}%` }}
                    className={cn(
                      "h-full transition-all duration-1000",
                      zone.color === 'emerald' ? 'bg-emerald-500' : 
                      zone.color === 'blue' ? 'bg-blue-500' : 'bg-orange-500'
                    )}
                  />
                </div>
              </Card>
            ))}

            {/* Add Sensor Placeholder */}
            <div className="bg-slate-200 border-2 border-dashed border-slate-400 p-6 flex items-center justify-center cursor-pointer hover:bg-slate-300 transition-colors">
              <div className="text-center group">
                <div className="w-12 h-12 border-2 border-slate-400 flex items-center justify-center mx-auto mb-3 text-3xl font-black text-slate-400 group-hover:scale-110 transition-transform">+</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Añadir Sensor</div>
              </div>
            </div>
          </div>

          {/* Footer Timeline */}
          <footer className="h-20 bg-white border-t border-slate-200 px-8 flex items-center justify-between shrink-0">
            <div className="flex space-x-4 items-center">
              <div className="w-4 h-4 bg-emerald-500"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Última actualización: {format(new Date(), 'HH:mm:ss')}
              </span>
            </div>
            
            <div className="hidden sm:flex gap-1.5 h-10 items-end">
              {[3, 5, 2, 6, 8, 4, 3, 5, 7, 8, 4, 6, 2, 9, 3, 5].map((h, i) => (
                <motion.div 
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h * 4}px` }}
                  className={cn(
                    "w-1.5 transition-all duration-500",
                    i === 9 ? 'bg-emerald-600' : i > 12 ? 'bg-emerald-400' : 'bg-slate-200'
                  )}
                />
              ))}
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900"
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? 'Live On' : 'Live Off'}
            </Button>
          </footer>
        </main>

        {/* Global UI Decoration - Thick Frame corners */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-8 border-l-8 border-emerald-500 pointer-events-none" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-8 border-r-8 border-emerald-500 pointer-events-none" />
      </div>
    </div>
  );
}
