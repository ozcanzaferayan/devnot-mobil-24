import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient, onlineManager } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useEffect, useState } from "react";
import OfflineBanner from "./OfflineBanner";
import PostsScreen from "./screens/PostsScreen";

const queryClient = new QueryClient();
const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  throttleTime: 3000,
});

export default function App() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      const status = !!state.isConnected;
      setIsOnline(status);
      onlineManager.setOnline(status);
    });
  }, []);

  return (
    <PersistQueryClientProvider
      persistOptions={{ persister }}
      onSuccess={() =>
        queryClient
          .resumePausedMutations()
          .then(() => queryClient.invalidateQueries())
      }
      client={queryClient}
    >
      {!isOnline && <OfflineBanner />}
      <PostsScreen />
    </PersistQueryClientProvider>
  );
}
