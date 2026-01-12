
import ContextManagerInterface from './ContextManagerInterface';

async function create () {}

function VenuesManager (ctx:ContextManagerInterface) {
  return Object.assign({}, ctx, {
    create
  });
}

export default VenuesManager;
