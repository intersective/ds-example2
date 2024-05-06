import dotenv from 'dotenv';
dotenv.config();
import wrap from '@dazn/lambda-powertools-pattern-basic';
import { Log, error } from './utils';
import { experience, allExperiences } from './experience';
import { dashboard } from './dashboard';

const doNotWaitForEmptyEventLoop = require('@middy/do-not-wait-for-empty-event-loop');
import h from 'helmet';

const helmet = h as any
interface Event {
  type: string;
  id: number;
}

module.exports.handler = wrap(async (event: Event) => {
  // event.type is required
  if (!event.type) {
    Log.warn('invalid event', { event });
    return error('invalid event');
  }

  switch (event.type) {
    case 'experience':
      if (!event.id) {
        Log.warn('experience id missing for experience stats', { event });
        return error('experience id missing');
      }
      return experience(event.id);
    case 'experience-all':
      return allExperiences();
    case 'dashboard':
      if (!event.id) {
        Log.warn('experience id missing for dashboard stats', { event });
        return error('experience id missing');
      }
      return dashboard(event.id);
  }

  return error('event type not found');
}).use(doNotWaitForEmptyEventLoop({
  runOnBefore: true,
  runOnAfter: true,
  runOnError: true,
})).use(helmet({
  strictTransportSecurity: {
    maxAge: 31536000, // Must be at least 1 year to be approved
    includeSubDomains: true, // Must be enabled to be approved
    preload: true,
  },
  xContentTypeOptions: true, // nosniff 
}));
