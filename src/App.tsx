import {
  createAmplifyAuthAdapter,
  createStorageBrowser,
} from '@aws-amplify/ui-react-storage/browser';
import '@aws-amplify/ui-react-storage/styles.css';
import './App.css';
import config from '../amplify_outputs.json';
import { Amplify } from 'aws-amplify';
import {
  Authenticator,
  Button,
  createTheme,
  Flex,
  View,
  Text,
  Card,
  Grid,
  Badge,
  Heading,
  Tabs,
} from '@aws-amplify/ui-react';
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
    <Grid templateColumns="1fr 1fr 1fr" gap="6px" padding="20px">
      {state.pageItems.map((location) => {
        return (
          <Card key={location.id} variation="outlined">
            <Flex alignItems="center" justifyContent="space-around" height="100%">
              <Heading level={6} flex="1">
                {location.prefix}
              </Heading>
              <Badge color="font.tertiary" fontWeight="normal">
                {location.permissions.join(', ')}
              </Badge>
            </Flex>
          </Card>
        );
      })}
    </Grid>
  );
}

function LocationsViewCustom() {
  const [locations, setLocations] = useState<{ path?: string }[]>([]);
  const labResults = locations.filter((location) => location.path?.includes('lab-results'));
  const clinicalNotes = locations.filter((location) => location.path?.includes('clinical-notes'));

  useEffect(() => {
    list({
      path: 'public/',
      options: {
        bucket: 'myStorageBucket',
      },
    }).then((res) => {
      setLocations(res.items as { path?: string }[]);
    });
  }, []);

  return (
    <Flex direction="column" padding="medium" width="50%" margin="0 auto">
      <Tabs
        defaultValue="lab-results"
        items={[
          {
            label: 'Lab results',
            value: 'lab-results',
            content: labResults.map((location) => {
              return (
                <Flex key={location.path} backgroundColor="white" marginBlock="6px" padding="6px">
                  <Text textAlign="start">{location.path}</Text>
                </Flex>
              );
            }),
          },
          {
            label: 'Clinical notes',
            value: 'clinical-notes',
            content: clinicalNotes.map((location) => {
              return (
                <Flex key={location.path} backgroundColor="white" marginBlock="6px" padding="6px">
                  <Text textAlign="start">{location.path}</Text>
                </Flex>
              );
            }),
          },
        ]}
      />
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
              <h1>{`Hello ${user?.signInDetails?.loginId}`}</h1>
              <Button onClick={signOut}>Sign out</Button>
            </div>
            <View backgroundColor="background.tertiary" {...theme.containerProps()} padding="6px">
              <StorageBrowser />
              <ThemeStyle theme={theme} />
              <Heading level={5}>Composable locations</Heading>
              <StorageBrowser.Provider>
                <LocationsView />
              </StorageBrowser.Provider>
              <Heading level={5}>Custom locations</Heading>
              <LocationsViewCustom />
            </View>
          </>
        )}
      </Authenticator>
    </>
  );
}

export default App;
