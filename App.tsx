import WhatsAppChatOpener from 'components/WhatsAppLink';
import { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import { Fragment } from 'react/jsx-runtime';

import './global.css';

export default function App() {
  // Set up transparent status bar when component mounts
  useEffect(() => {
    // For Android
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setTranslucent(true);
    }

    // For both platforms
    StatusBar.setBarStyle('light-content');

    return () => {
      // Reset status bar when component unmounts (if needed)
      if (Platform.OS === 'android') {
        StatusBar.setTranslucent(false);
      }
    };
  }, []);

  return (
    <Fragment>
      <WhatsAppChatOpener />
    </Fragment>
  );
}
