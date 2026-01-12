
import app from './app';
import initRootOrg from './@core/utils/init-root-org';
import { initializeFirebase } from './@core/config/firebase-admin-config';
import { networkInterfaces } from 'os';

// const PORT = process.env.PORT;
const PORT = 3001;
const HOST = '0.0.0.0'; // Listen on all network interfaces

// Get local IP addresses
function getLocalIpAddresses(): string[] {
  const nets = networkInterfaces();
  const ips: string[] = [];
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]!) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  
  return ips;
}

(async () => {
  // Initialize Firebase Admin SDK
  initializeFirebase();

  const rootOrg = await initRootOrg({
    name: 'Society of Surgeons of Pakistan, Lahore',
    slug: 'sspl'
  });

  app.set('org', rootOrg);

  app.listen(PORT, HOST, () => {
    const localIps = getLocalIpAddresses();
    
    console.log(`\n🚀 Server is running!`);
    console.log(`\n📍 Local access:`);
    console.log(`   http://localhost:${PORT}`);
    
    if (localIps.length > 0) {
      console.log(`\n🌐 Network access (share with mobile developers):`);
      localIps.forEach(ip => {
        console.log(`   http://${ip}:${PORT}`);
      });
      console.log(`\n💡 Mobile app developers can use any of the above network URLs`);
    }
    
    console.log(`\n Server is listening on ${HOST}:${PORT}\n`);
  });  
})();
