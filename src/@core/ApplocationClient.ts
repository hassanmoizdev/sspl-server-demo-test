
import AuthenticationManager from './AuthenticationManager';
import AccountsManager from './AccountsManager';
import GuestsManager from './GuestsManager';
import VenuesManager from './VenuesManager';
import ConferencesManager from './ConferencesManager';
import Logger from './Logger';

interface ContextInterface {
  user?: {
    id: number;
    role: string;
  },
  org?: {
    id: number;
  },
  logger: { log: (msg:string)=>void; }
}

interface ContextManagerInterface {
  _ctx: ContextInterface;
  get currentUser (): Required<ContextInterface>['user'];
  get org (): Required<ContextInterface>['org'];
  get logger (): ContextInterface['logger'];
}

interface ApplicationClientInterface {
  _instances: {
    auth?: ReturnType<typeof AuthenticationManager>;
    accounts?: ReturnType<typeof AccountsManager>;
    guests?: ReturnType<typeof GuestsManager>;
    venues?: ReturnType<typeof VenuesManager>;
    conferences?: ReturnType<typeof ConferencesManager>;
  };
  get auth (): ReturnType<typeof AuthenticationManager>;
  get accounts (): ReturnType<typeof AccountsManager>;
  get guests (): ReturnType<typeof GuestsManager>;
  get venues (): ReturnType<typeof VenuesManager>;
  get conferences (): ReturnType<typeof ConferencesManager>;
}

/**
 * DEFAULT CONTEXT
 */
const DEFAULT_CONTEXT:ContextInterface = {
  logger: Logger
};

/**
 * Context manager
 */
const ContextManager:ContextManagerInterface = {
  _ctx: DEFAULT_CONTEXT,

  get currentUser () {
    if (!this._ctx.user)
      throw new Error('Unable to access current user context.');
    return this._ctx.user;
  },

  get org () {
    if (!this._ctx.org)
      throw new Error('Unable to access current organization context.');
    return this._ctx.org;
  },

  get logger () {
    return this._ctx.logger
  }
};

/**
 * ApplicationClient Factory
 * @param ctx 
 * @returns 
 */
function ApplicationClient (ctx?:Partial<ContextInterface>): Omit<ApplicationClientInterface, '_instances'> {
  const {_ctx, ..._ctxManager} = ContextManager;

  const ctxManager:ContextManagerInterface = {
    _ctx: Object.assign({}, _ctx, ctx),
    ..._ctxManager
  };

  const _instances = {} as ApplicationClientInterface['_instances'];

  return {
    get auth () {
      if (_instances.auth)
        return _instances.auth;
      return _instances.auth = AuthenticationManager(ctxManager);
    },

    get accounts () {
      if (_instances.accounts)
        return _instances.accounts;
      return _instances.accounts = AccountsManager(ctxManager);
    },

    get guests () {
      if (_instances.guests)
        return _instances.guests;
      return _instances.guests = GuestsManager(ctxManager);
    },

    get venues () {
      if (_instances.venues)
        return _instances.venues;
      return _instances.venues = VenuesManager(ctxManager);
    },

    get conferences () {
      if (_instances.conferences)
        return _instances.conferences;
      return _instances.conferences = ConferencesManager(ctxManager);
    }
  };
}

export default ApplicationClient;
