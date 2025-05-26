import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt';

const LiveViewer = ({deviceId, topic = 'demo/topic', title = 'Mesaj MQTT:', style }) => {
  const [message, setMessage] = useState('');
  const [imageSrc, setImageSrc] = useState(null);
    console.log(topic);
  useEffect(() => {
    const client = mqtt.connect('wss://060d18919ee741d28b9bde954d955e56.s1.eu.hivemq.cloud:8884/mqtt', {
      username: 'catalin',
      password: 'Mqtt1234!'
    });

    client.on('connect', () => {
      console.log('✅ Frontend connected to HiveMQ');
      client.subscribe(topic);
      client.subscribe(`live/${deviceId}`);
    });

    client.on('message', (recvTopic, payload) => {
        console.log(payload);
        console.log(recvTopic);
        console.log(topic);
      if (recvTopic.startsWith('live')) {
        // try {
        //   const data = JSON.parse(payload.toString());
        //   setMessage(data.imageData);
        // } catch {
        //   setMessage(payload.toString());
        // }
        try {
            const data = JSON.parse(payload.toString());
            const base64 = data.imageData;
            const format = data.format || 'image/jpeg'; // Default to jpeg
            const dataUrl = `data:${format};base64,${base64}`;
            setImageSrc(dataUrl);
          } catch (e) {
            console.error('Error parsing message:', e);
          }
        
      }
      
    });

    return () => client.end();
  }, []);

//   return (
//     <div style={style}>
//       <h2>{title}</h2>
//       <p>{message || 'Aștept mesaj...'}</p>
//     </div>
//   );
// };
return (
    <div>
      {/* Removed 'Live Image' text */}
      {imageSrc ? (
        <img src={imageSrc} alt="Live stream" style={style} />
      ) : (
        <p>No image received yet</p>
      )}
    </div>
  );
}
export default LiveViewer;
