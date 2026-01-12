
interface ClientContextInterface {
  currentUser: { id: number; };
  org: { id: number; };
  logger: { log: (msg:string)=>void; };
}

export default ClientContextInterface;
