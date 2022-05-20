import axios from 'axios';
import { AUTH_SERVER_ACTIONS_PATHS } from '@/constants/servers';

export const getAllPostsFromServer = async () => {
  const response = await axios.get(AUTH_SERVER_ACTIONS_PATHS.getAllPosts,
    { withCredentials: true }
  );
  return response.data;
};
