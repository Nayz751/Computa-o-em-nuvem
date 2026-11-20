import type { Event } from '../models';
import { getDb } from './db';

export const listEvents = (): Event[] => getDb().events;
