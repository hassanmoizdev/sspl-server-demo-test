
import ContextManagerInterface from './ContextManagerInterface';
import PersonDAO from './PersonDAO';
import GuestDAO from './GuestDAO';
import guestSchema, { GuestData } from './data-parsers/guest-data-parser';

const DEFAULT_PROFILE = {
  contact: {}
};

async function create (this:ContextManagerInterface, data:GuestData) {
  // Parse data.
  const parsedData = guestSchema.parse(data);

  const {email, profile, ...personInput} = parsedData;
  const person = await PersonDAO.create(personInput, {
    ...(profile||DEFAULT_PROFILE),
    org_id: this.org.id
  });

  const guest = await GuestDAO.create({
    email,
    person_id: person.id,
    creator_id: this.currentUser.id,
    org_id: this.org.id
  });

  return guest;
}

async function get (this:ContextManagerInterface, id:number) {}

function GuestsManager (ctx:ContextManagerInterface) {
  return Object.assign({}, ctx, {
    create
  });
}

export default GuestsManager;
