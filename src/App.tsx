import {
  createAmplifyAuthAdapter,
  createStorageBrowser,
} from '@aws-amplify/ui-react-storage/browser';
import '@aws-amplify/ui-react-storage/styles.css';
import './App.css';
import config from '../amplify_outputs.json';
import { Amplify } from 'aws-amplify';
import { Authenticator, Button, createTheme, Flex, View, Text } from '@aws-amplify/ui-react';
import { defineComponentTheme, ThemeStyle } from '@aws-amplify/ui-react/server';
import { useEffect, useState } from 'react';
import { list } from 'aws-amplify/storage';
Amplify.configure(config);

const { StorageBrowser, useView } = createStorageBrowser({
  config: createAmplifyAuthAdapter(),
});

const storageBrowserTheme = defineComponentTheme({
  name: 'storage-browser',
  theme: (tokens) => {
    return {
      _element: {
        controls: {
          backgroundColor: tokens.colors.background.primary,
          padding: tokens.space.large,
          borderRadius: tokens.radii.large,
        },
        title: {
          fontWeight: tokens.fontWeights.thin,
        },
        search: {},
      },
    };
  },
});

const theme = createTheme({
  name: 'my-theme',
  primaryColor: 'green',
  components: [storageBrowserTheme],
});

function LocationsView() {
  const state = useView('Locations');

  return (
    <Flex direction="column" padding="medium">
      <Text fontWeight="bold">Locations</Text>
      {state.pageItems.map((location) => {
        return (
          <Flex key={location.id} textAlign="start">
            <Text flex="1">{location.prefix}</Text>
            <Text color="font.tertiary" fontWeight="normal">
              {location.permissions.join(', ')}
            </Text>
          </Flex>
        );
      })}
    </Flex>
  );
}

function LocationsViewCustom() {
  const [locations, setLocations] = useState<{ path?: string }[]>([]);

  useEffect(() => {
    list({
      path: 'public/',
      options: {
        bucket: 'myStorageBucket',
      },
    }).then((res) => {
      console.log(res);
      setLocations(res.items as { path?: string }[]);
    });
  }, []);

  return (
    <Flex direction="column" padding="medium">
      <Text fontWeight="bold" alignSelf="start">
        Locations
      </Text>
      {locations.map((location) => {
        return (
          <Text key={location.path} textAlign="start">
            {location.path}
          </Text>
        );
      })}
    </Flex>
  );
}

function App() {
  return (
    <>
      <ThemeStyle theme={theme} />
      <Authenticator>
        {({ signOut, user }) => (
          <>
            <div className="header">
              <h1>{`Hello ${user?.username}`}</h1>
              <Button onClick={signOut}>Sign out</Button>
            </div>
            <View backgroundColor="background.tertiary" {...theme.containerProps()}>
              <StorageBrowser />
              <ThemeStyle theme={theme} />
              <StorageBrowser.Provider>
                <LocationsView />
              </StorageBrowser.Provider>
              <LocationsViewCustom />
            </View>
          </>
        )}
      </Authenticator>
    </>
  );
}

export default App;
