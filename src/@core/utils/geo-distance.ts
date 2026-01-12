
export type Coordinates = {
  lat: number;
  lng: number;
};

const getDistanceBetween = (point1:Coordinates, point2:Coordinates) => {
  const R = 6378; // Radius of the earth in km
  const dLat = deg2rad(point2.lat - point1.lat);  // deg2rad below
  const dLon = deg2rad(point2.lng - point1.lng); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(point1.lat)) * Math.cos(deg2rad(point2.lat)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d * 1000; // return in meters;
}

function deg2rad(deg:number) {
  return deg * (Math.PI/180)
}

export default getDistanceBetween;
