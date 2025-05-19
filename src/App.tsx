import {
  createAmplifyAuthAdapter,
  createStorageBrowser,
} from '@aws-amplify/ui-react-storage/browser';
import '@aws-amplify/ui-react-storage/styles.css';
import './App.css';
import { Amplify } from 'aws-amplify';
import { Authenticator, Button, Flex, View, Text, Tabs, Card } from '@aws-amplify/ui-react';
import { useEffect, useState } from 'react';

// Mock configuration for development
const mockConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_XXXXXXXXX',
      userPoolClientId: 'XXXXXXXXXXXXXXXXXXXXXXXXX',
      identityPoolId: 'us-east-1:XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
      allowGuestAccess: true,
    },
  },
  Storage: {
    S3: {
      bucket: 'amplify-medical-records-XXXXXXXXXXXX',
      region: 'us-east-1',
    },
  },
};

// Configure Amplify with mock config
Amplify.configure(mockConfig);

// Create StorageBrowser instance
let storageBrowserInstance: ReturnType<typeof createStorageBrowser> | null = null;
try {
  storageBrowserInstance = createStorageBrowser({
    config: createAmplifyAuthAdapter(),
  });
} catch (error) {
  console.error('Failed to create StorageBrowser:', error);
}

interface MedicalFile {
  key: string;
  lastModified?: Date;
  size?: number;
}

interface CategorizedFiles {
  labs: MedicalFile[];
  imaging: MedicalFile[];
  notes: MedicalFile[];
}

interface LocationItem {
  key: string;
  lastModified?: Date;
  size?: number;
  type?: 'FILE' | 'FOLDER';
}

function App() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to initialize storage browser
    if (!storageBrowserInstance) {
      try {
        storageBrowserInstance = createStorageBrowser({
          config: createAmplifyAuthAdapter(),
        });
        setIsConfigured(true);
      } catch (err) {
        setError(
          'Failed to initialize storage browser. Please ensure AWS credentials are configured.'
        );
        console.error(err);
      }
    } else {
      setIsConfigured(true);
    }
  }, []);

  if (error) {
    return (
      <View className="loading-state">
        <Card variation="elevated" padding="xl">
          <Flex direction="column" gap="medium" alignItems="center">
            <Text fontSize="large" fontWeight="semibold" color="error">
              {error}
            </Text>
            <Text color="font.tertiary">To use this app, you need to:</Text>
            <ol style={{ textAlign: 'left', color: '#666666' }}>
              <li>Configure AWS credentials</li>
              <li>Run 'npx ampx sandbox' to set up backend resources</li>
            </ol>
            <Button variation="primary" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </Flex>
        </Card>
      </View>
    );
  }

  if (!isConfigured || !storageBrowserInstance) {
    return (
      <View className="loading-state">
        <Text>Loading storage browser...</Text>
      </View>
    );
  }

  const { StorageBrowser, useView } = storageBrowserInstance;

  // Custom view for patient records with medical categorization
  function PatientRecordsView() {
    const state = useView('LocationDetail');
    const [categorizedFiles, setCategorizedFiles] = useState<CategorizedFiles>({
      labs: [],
      imaging: [],
      notes: [],
    });

    useEffect(() => {
      // Categorize files by medical record types
      const categorizeFiles = (files: LocationItem[]): CategorizedFiles => {
        return files.reduce(
          (acc: CategorizedFiles, file: LocationItem) => {
            // Only process files, not folders
            if (file.type === 'FILE' || (file.size !== undefined && file.size > 0)) {
              const medicalFile: MedicalFile = {
                key: file.key,
                lastModified: file.lastModified,
                size: file.size,
              };
              
              if (file.key.includes('lab-results')) acc.labs.push(medicalFile);
              else if (file.key.includes('imaging')) acc.imaging.push(medicalFile);
              else if (file.key.includes('notes')) acc.notes.push(medicalFile);
              else if (file.key.includes('clinical')) acc.notes.push(medicalFile);
            }
            return acc;
          },
          { labs: [], imaging: [], notes: [] }
        );
      };

      setCategorizedFiles(categorizeFiles(state.pageItems || []));
    }, [state.pageItems]);

    const FileGrid = ({ files }: { files: MedicalFile[] }) => (
      <div className="file-grid">
        {files.map((file: MedicalFile) => (
          <div key={file.key} className="file-item">
            <Flex direction="column" gap="small">
              <Text fontWeight="semibold">{file.key.split('/').pop()}</Text>
              <Flex gap="small" alignItems="center">
                <Text fontSize="small" color="font.tertiary">
                  {file.lastModified && new Date(file.lastModified).toLocaleDateString()}
                </Text>
                {file.size && (
                  <Text fontSize="small" color="font.tertiary">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </Text>
                )}
              </Flex>
            </Flex>
          </div>
        ))}
      </div>
    );

    return (
      <View padding="medium" className="fade-in">
        <Tabs defaultValue="labs">
          <Tabs.List>
            <Tabs.Item value="labs">Lab Results</Tabs.Item>
            <Tabs.Item value="imaging">Medical Imaging</Tabs.Item>
            <Tabs.Item value="notes">Clinical Notes</Tabs.Item>
          </Tabs.List>

          <Tabs.Panel value="labs">
            <FileGrid files={categorizedFiles.labs} />
          </Tabs.Panel>
          <Tabs.Panel value="imaging">
            <FileGrid files={categorizedFiles.imaging} />
          </Tabs.Panel>
          <Tabs.Panel value="notes">
            <FileGrid files={categorizedFiles.notes} />
          </Tabs.Panel>
        </Tabs>
      </View>
    );
  }

  return (
    <>
      <Authenticator>
        {({ signOut, user }) => {
          return (
            <>
              <header className="header">
                <Flex justifyContent="space-between" alignItems="center" padding="medium">
                  <View>
                    <Flex alignItems="center" gap="medium">
                      {/* Logo SVG */}
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="#1877f2">
                        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                        <path
                          fill="white"
                          d="M12 5L6 8v6c0 3.5 2 6.5 6 7.5 4-1 6-4 6-7.5V8l-6-3z"
                        />
                        <path fill="#1877f2" d="M10 17l-4-4 1.4-1.4L10 14.2l5.6-5.6L17 10z" />
                      </svg>
                      <View>
                        <h1>SecureHealth Portal</h1>
                        <Text color="font.tertiary" fontSize="small">
                          Welcome back, {user?.username}
                        </Text>
                      </View>
                    </Flex>
                  </View>
                  <Button onClick={signOut}>Sign out</Button>
                </Flex>
              </header>

              <View
                backgroundColor="background.secondary"
                minHeight="calc(100vh - 80px)"
                padding="large"
              >
                <View maxWidth="1200px" margin="0 auto">
                  <StorageBrowser
                    displayText={{
                      LocationsView: {
                        title: 'Medical Records Management',
                      },
                    }}
                  />

                  <StorageBrowser.Provider>
                    <PatientRecordsView />
                  </StorageBrowser.Provider>
                </View>
              </View>

              {/* HIPAA Compliance Notice */}
              <View className="hipaa-notice">
                <Flex alignItems="center" justifyContent="center" gap="small">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                  </svg>
                  <Text>
                    All data is encrypted and stored in accordance with HIPAA compliance standards
                  </Text>
                </Flex>
              </View>
            </>
          );
        }}
      </Authenticator>
    </>
  );
}

export default App;