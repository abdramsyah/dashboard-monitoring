import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LogBox } from 'react-native';
import { Provider } from 'react-redux';
import AppWrapper from '@sentadell-src/AppWrapper';
import { store } from '@sentadell-src/database/reduxStore';
import RealmCtx from '@sentadell-src/database/realm';
import FlashMessage from 'react-native-flash-message';

// eslint-disable-next-line @typescript-eslint/no-var-requires
global.Buffer = require('buffer').Buffer;

LogBox.ignoreLogs(['Invalid prop textStyle of type array supplied to Cell']);

const queryClient = new QueryClient();

if (__DEV__) {
  import('react-query-native-devtools').then(({ addPlugin }) => {
    addPlugin({ queryClient });
  });
}

const App = () => {
  return (
    <Provider store={store}>
      <RealmCtx.RealmProvider closeOnUnmount={false}>
        <QueryClientProvider client={queryClient}>
          <AppWrapper />
          <FlashMessage position="top" />
        </QueryClientProvider>
      </RealmCtx.RealmProvider>
    </Provider>
  );
};

export default App;
