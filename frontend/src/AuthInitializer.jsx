import React, { useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';

const AuthInitializer = () => {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress;
      // set global headers for every axios request
      axios.defaults.headers.common['x-user-email'] = email || '';
      axios.defaults.headers.common['x-user-id'] = user?.id || '';
      // If you prefer sending in body, still useful to keep headers.
    } else {
      delete axios.defaults.headers.common['x-user-email'];
      delete axios.defaults.headers.common['x-user-id'];
    }
  }, [user]);

  return null;
};

export default AuthInitializer;
