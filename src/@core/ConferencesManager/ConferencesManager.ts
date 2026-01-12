
import ContextManagerInterface from './ContextManagerInterface';

async function create () {}

function ConferencesManager (ctx:ContextManagerInterface) {
  return Object.assign({}, ctx, {
    create
  });
}

export default ConferencesManager;
