import data from './generated/content.json';
import type { Profile, PublishedPost } from './types';

export const profile = data.profile as Profile;
export const posts = data.posts as PublishedPost[];
