import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt';

const LiveViewer = () => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const client = mqtt.connect('wss://060d18919ee741d28b9bde954d955e56.s1.eu.hivemq.cloud:8884/mqtt', {
      username: 'catalin',
      password: 'Mqtt1234!'
    });

    client.on('connect', () => {
      console.log('✅ Frontend connected to HiveMQ');
      client.subscribe('demo/topic');
    });

    client.on('message', (topic, payload) => {
      
      const data = JSON.parse(payload.toString());
      setMessage(data.message);
    });

    return () => client.end();
  }, []);

  return (
    <div>
      <h2>Mesaj MQTT:</h2>
      <p>{message || 'Aștept mesaj...'}</p>
    </div>
  );
};

export default LiveViewer;
